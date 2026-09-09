import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const admin = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

const BodySchema = z.object({
  campaign_id: z.string().uuid(),
  test_email: z.string().trim().email().max(180).optional(),
});

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

interface Campaign {
  id: string;
  restaurant_id: string;
  name: string;
  subject: string;
  body: string;
  image_url: string;
  cta_label: string;
  cta_url: string;
  target_lang: string | null;
  status: string;
}

const renderHtml = (c: Campaign, firstName: string | null, unsubUrl: string) => {
  const paragraphs = c.body
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#2b2b2b;">${esc(p).replace(/\n/g, "<br/>")}</p>`)
    .join("");
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:24px 22px;">
    ${firstName ? `<p style="margin:0 0 14px;font-size:15px;color:#2b2b2b;">Bonjour ${esc(firstName)},</p>` : ""}
    ${c.image_url ? `<img src="${esc(c.image_url)}" alt="" style="width:100%;border-radius:12px;margin:0 0 18px;display:block;"/>` : ""}
    ${paragraphs}
    ${
      c.cta_label && c.cta_url
        ? `<p style="margin:22px 0;"><a href="${esc(c.cta_url)}" style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:15px;">${esc(c.cta_label)}</a></p>`
        : ""
    }
    <hr style="border:none;border-top:1px solid #e6e6e6;margin:26px 0 12px;"/>
    <p style="margin:0;font-size:12px;line-height:1.5;color:#8a8a8a;">
      Vous recevez cet email car vous avez accepté nos communications.
      <a href="${esc(unsubUrl)}" style="color:#8a8a8a;">Se désinscrire</a>.
    </p>
  </div>
</body></html>`;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!LOVABLE_API_KEY || !RESEND_API_KEY) {
      return json({ error: "Service d'envoi d'emails non connecté" }, 400);
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return json({ error: "Non authentifié" }, 401);
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    const user = userData?.user;
    if (userErr || !user) return json({ error: "Non authentifié" }, 401);

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
    const { campaign_id, test_email } = parsed.data;

    const { data: campaign } = await admin
      .from("campaigns")
      .select("*")
      .eq("id", campaign_id)
      .maybeSingle();
    if (!campaign) return json({ error: "Campagne introuvable" }, 404);
    const c = campaign as Campaign;

    // Accès : membre du restaurant ou super admin
    const [{ data: membership }, { data: superAdmin }] = await Promise.all([
      admin
        .from("restaurant_members")
        .select("id")
        .eq("user_id", user.id)
        .eq("restaurant_id", c.restaurant_id)
        .maybeSingle(),
      admin.rpc("has_role", { _user_id: user.id, _role: "super_admin" }),
    ]);
    if (!membership && !superAdmin) return json({ error: "Accès refusé" }, 403);

    const { data: features } = await admin
      .from("restaurant_features")
      .select("crm_enabled, crm_sender_name, crm_sender_email")
      .eq("restaurant_id", c.restaurant_id)
      .maybeSingle();
    if (!features?.crm_enabled) return json({ error: "Campagnes désactivées pour ce restaurant" }, 403);
    if (!features.crm_sender_email) return json({ error: "Adresse d'expédition manquante" }, 400);
    const from = `${features.crm_sender_name || "Restaurant"} <${features.crm_sender_email}>`;

    type Target = { id: string | null; email: string; first_name: string | null; access_token: string | null };
    let targets: Target[] = [];

    if (test_email) {
      targets = [{ id: null, email: test_email, first_name: null, access_token: null }];
    } else {
      if (c.status === "sending" || c.status === "sent") {
        return json({ error: "Campagne déjà envoyée" }, 409);
      }
      let query = admin
        .from("loyalty_members")
        .select("id, email, first_name, access_token, lang")
        .eq("restaurant_id", c.restaurant_id)
        .eq("consent_email", true)
        .is("unsubscribed_at", null)
        .not("email", "is", null);
      if (c.target_lang) query = query.eq("lang", c.target_lang);
      const { data: members, error: memErr } = await query;
      if (memErr) throw memErr;

      const seen = new Set<string>();
      const suppressed = new Set<string>();
      const { data: sup } = await admin
        .from("consent_events")
        .select("email, granted, channel")
        .eq("restaurant_id", c.restaurant_id)
        .eq("channel", "email")
        .eq("granted", false);
      (sup ?? []).forEach((s: { email: string | null }) => s.email && suppressed.add(s.email.toLowerCase()));

      for (const m of members ?? []) {
        const email = (m.email as string).trim().toLowerCase();
        if (!email || seen.has(email) || suppressed.has(email)) continue;
        seen.add(email);
        targets.push({
          id: m.id as string,
          email,
          first_name: (m.first_name as string | null) ?? null,
          access_token: (m.access_token as string | null) ?? null,
        });
      }
      if (!targets.length) return json({ error: "Aucun destinataire consentant" }, 400);
      await admin.from("campaigns").update({ status: "sending", error: null }).eq("id", c.id);
    }

    let sent = 0;
    let failed = 0;
    const rows: Record<string, unknown>[] = [];

    for (const target of targets) {
      const unsubUrl = target.access_token
        ? `${SUPABASE_URL}/functions/v1/crm-unsubscribe?token=${target.access_token}`
        : `${SUPABASE_URL}/functions/v1/crm-unsubscribe`;
      try {
        const res = await fetch(`${GATEWAY_URL}/emails`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "X-Connection-Api-Key": RESEND_API_KEY,
          },
          body: JSON.stringify({
            from,
            to: [target.email],
            subject: c.subject || c.name,
            html: renderHtml(c, target.first_name, unsubUrl),
            headers: { "List-Unsubscribe": `<${unsubUrl}>` },
          }),
        });
        if (!res.ok) {
          const details = await res.text();
          console.error(`Resend error [${res.status}]: ${details}`);
          failed++;
          if (!test_email) {
            rows.push({ campaign_id: c.id, member_id: target.id, email: target.email, status: "failed", error: `${res.status}: ${details.slice(0, 300)}` });
          } else {
            return json({ error: `Envoi refusé (${res.status})`, details: details.slice(0, 500) }, res.status);
          }
        } else {
          sent++;
          if (!test_email) {
            rows.push({ campaign_id: c.id, member_id: target.id, email: target.email, status: "sent" });
          }
        }
      } catch (e) {
        console.error("send failure", e);
        failed++;
        if (!test_email) {
          rows.push({ campaign_id: c.id, member_id: target.id, email: target.email, status: "failed", error: String(e).slice(0, 300) });
        } else {
          return json({ error: "Envoi impossible" }, 500);
        }
      }
      // Ménage le débit d'envoi
      await new Promise((r) => setTimeout(r, 120));
    }

    if (test_email) return json({ ok: true, test: true, sent, failed });

    if (rows.length) await admin.from("campaign_recipients").insert(rows);
    await admin
      .from("campaigns")
      .update({
        status: sent > 0 ? "sent" : "failed",
        sent_count: sent,
        failed_count: failed,
        sent_at: new Date().toISOString(),
        error: sent === 0 ? "Aucun email n'a pu être envoyé" : null,
      })
      .eq("id", c.id);

    return json({ ok: true, sent, failed });
  } catch (e) {
    console.error(e);
    return json({ error: e instanceof Error ? e.message : "Erreur inattendue" }, 500);
  }
});
