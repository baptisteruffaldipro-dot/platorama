import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

const page = (title: string, message: string, status = 200) =>
  new Response(
    `<!doctype html><html lang="fr"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${title}</title></head>
<body style="margin:0;font-family:Helvetica,Arial,sans-serif;background:#fafafa;display:flex;min-height:100vh;align-items:center;justify-content:center;">
  <div style="max-width:420px;padding:32px;text-align:center;background:#fff;border-radius:16px;box-shadow:0 6px 24px rgba(0,0,0,.06);">
    <h1 style="font-size:20px;margin:0 0 12px;color:#111;">${title}</h1>
    <p style="font-size:15px;line-height:1.6;color:#555;margin:0;">${message}</p>
  </div>
</body></html>`,
    { status, headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" } },
  );

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const token = new URL(req.url).searchParams.get("token") ?? "";
  if (!UUID.test(token)) {
    return page("Lien invalide", "Ce lien de désinscription n'est plus valide.", 400);
  }

  const { data: member } = await admin
    .from("loyalty_members")
    .select("id, restaurant_id, email")
    .eq("access_token", token)
    .maybeSingle();
  if (!member) {
    return page("Lien invalide", "Ce lien de désinscription n'est plus valide.", 404);
  }

  const now = new Date().toISOString();
  await admin
    .from("loyalty_members")
    .update({ consent_email: false, consent_sms: false, unsubscribed_at: now })
    .eq("id", member.id);
  await admin.from("consent_events").insert({
    restaurant_id: member.restaurant_id,
    member_id: member.id,
    email: member.email,
    channel: "email",
    granted: false,
    source: "email_unsubscribe",
  });

  return page(
    "Désinscription confirmée",
    "Vous ne recevrez plus nos emails. Vous pouvez à tout moment vous réinscrire depuis votre carte de fidélité.",
  );
});
