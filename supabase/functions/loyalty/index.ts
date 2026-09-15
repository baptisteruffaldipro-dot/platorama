import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

const JoinSchema = z.object({
  action: z.literal("join"),
  restaurant_id: z.string().uuid(),
  first_name: z.string().trim().min(1).max(60),
  last_name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(180),
  phone: z.string().trim().min(6).max(30).regex(/^\+?[0-9 ()'.-]+$/),
  consent_email: z.boolean().optional(),
  consent_sms: z.boolean().optional(),
  lang: z.string().max(8).optional(),
});

const MeSchema = z.object({
  action: z.literal("me"),
  token: z.string().uuid(),
});

const PrefsSchema = z.object({
  action: z.literal("prefs"),
  token: z.string().uuid(),
  consent_email: z.boolean(),
  consent_sms: z.boolean(),
  unsubscribe: z.boolean().optional(),
});

const BodySchema = z.discriminatedUnion("action", [JoinSchema, MeSchema, PrefsSchema]);

const ALPHABET = "ACDEFGHJKLMNPQRTUVWXY34789";
const makeCode = () =>
  Array.from({ length: 6 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join("");
const normalizeEmail = (value: string) => value.trim().toLowerCase();
const normalizePhone = (value: string) => value.replace(/[^0-9+]/g, "");

async function memberPayload(memberId: string) {
  const [{ data: member }, { data: tx }, { data: features }] = await Promise.all([
    admin.from("loyalty_members").select("*").eq("id", memberId).maybeSingle(),
    admin
      .from("loyalty_transactions")
      .select("id, kind, points, label, created_at")
      .eq("member_id", memberId)
      .order("created_at", { ascending: false })
      .limit(30),
    admin.from("loyalty_members").select("restaurant_id").eq("id", memberId).maybeSingle(),
  ]);
  if (!member) return null;
  const [{ data: rewards }, { data: settings }] = await Promise.all([
    admin
      .from("loyalty_rewards")
      .select("id, label, description, points_cost, sort_order")
      .eq("restaurant_id", member.restaurant_id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    admin
      .from("restaurant_features")
      .select("loyalty_points_per_visit, loyalty_reward_threshold, loyalty_welcome_text, loyalty_program_name")
      .eq("restaurant_id", member.restaurant_id)
      .maybeSingle(),
  ]);
  void features;
  return {
    member: {
      id: member.id,
      first_name: member.first_name,
      last_name: member.last_name,
      email: member.email,
      phone: member.phone,
      card_code: member.card_code,
      points: member.points,
      visits: member.visits,
      consent_email: member.consent_email,
      consent_sms: member.consent_sms,
      unsubscribed_at: member.unsubscribed_at,
      created_at: member.created_at,
    },
    history: tx ?? [],
    rewards: rewards ?? [],
    settings: settings ?? null,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return json({ error: parsed.error.flatten().fieldErrors }, 400);
    }
    const body = parsed.data;

    if (body.action === "join") {
      const emailNormalized = normalizeEmail(body.email);
      const phoneNormalized = normalizePhone(body.phone);
      const { data: feat } = await admin
        .from("restaurant_features")
        .select("loyalty_enabled")
        .eq("restaurant_id", body.restaurant_id)
        .maybeSingle();
      if (!feat?.loyalty_enabled) return json({ error: "Programme de fidélité désactivé" }, 403);

      // Membre déjà existant pour ce restaurant ?
      const [{ data: emailMatch }, { data: phoneMatch }] = await Promise.all([
        admin
          .from("loyalty_members")
          .select("id, access_token")
          .eq("restaurant_id", body.restaurant_id)
          .eq("email_normalized", emailNormalized)
          .maybeSingle(),
        admin
          .from("loyalty_members")
          .select("id, access_token")
          .eq("restaurant_id", body.restaurant_id)
          .eq("phone_normalized", phoneNormalized)
          .maybeSingle(),
      ]);
      if (emailMatch && phoneMatch && emailMatch.id !== phoneMatch.id) {
        return json(
          { error: "Cet email et ce téléphone appartiennent à deux cartes différentes. Contactez le restaurant." },
          409,
        );
      }
      // Une seule coordonnée connue : on retrouve la carte et on complète l'autre.
      const existing = emailMatch ?? phoneMatch ?? null;

      if (existing) {
        await admin
          .from("loyalty_members")
          .update({
            first_name: body.first_name,
            last_name: body.last_name,
            email: emailNormalized,
            email_normalized: emailNormalized,
            phone: body.phone.trim(),
            phone_normalized: phoneNormalized,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
        const payload = await memberPayload(existing.id);
        return json({ token: existing.access_token, ...payload });
      }

      let created: { id: string; access_token: string } | null = null;
      for (let i = 0; i < 5 && !created; i++) {
        const { data, error } = await admin
          .from("loyalty_members")
          .insert({
            restaurant_id: body.restaurant_id,
            first_name: body.first_name,
            last_name: body.last_name,
            email: emailNormalized,
            phone: body.phone.trim(),
            email_normalized: emailNormalized,
            phone_normalized: phoneNormalized,
            card_code: makeCode(),
            consent_email: !!body.consent_email,
            consent_sms: !!body.consent_sms,
            consent_at: body.consent_email || body.consent_sms ? new Date().toISOString() : null,
            lang: body.lang ?? null,
          })
          .select("id, access_token")
          .maybeSingle();
        if (!error && data) created = data;
        else if (error && !error.message.includes("card_code")) throw error;
      }
      if (!created) return json({ error: "Création impossible, réessayez" }, 500);
      const createdMember = created;

      const consents = [
        { channel: "email", granted: !!body.consent_email },
        { channel: "sms", granted: !!body.consent_sms },
      ];
      await admin.from("consent_events").insert(
        consents.map((c) => ({
          restaurant_id: body.restaurant_id,
          member_id: createdMember.id,
          email: emailNormalized,
          phone: body.phone.trim(),
          channel: c.channel,
          granted: c.granted,
          source: "loyalty_signup",
        })),
      );

      const payload = await memberPayload(createdMember.id);
      return json({ token: createdMember.access_token, ...payload });
    }

    // me / prefs : accès par jeton porteur de la carte
    const { data: member } = await admin
      .from("loyalty_members")
      .select("id, restaurant_id, email, phone")
      .eq("access_token", body.token)
      .maybeSingle();
    if (!member) return json({ error: "Carte introuvable" }, 404);

    if (body.action === "prefs") {
      await admin
        .from("loyalty_members")
        .update({
          consent_email: body.consent_email,
          consent_sms: body.consent_sms,
          consent_at: new Date().toISOString(),
          unsubscribed_at: body.unsubscribe ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", member.id);
      await admin.from("consent_events").insert([
        {
          restaurant_id: member.restaurant_id,
          member_id: member.id,
          email: member.email,
          phone: member.phone,
          channel: "email",
          granted: body.consent_email && !body.unsubscribe,
          source: "loyalty_prefs",
        },
        {
          restaurant_id: member.restaurant_id,
          member_id: member.id,
          email: member.email,
          phone: member.phone,
          channel: "sms",
          granted: body.consent_sms && !body.unsubscribe,
          source: "loyalty_prefs",
        },
      ]);
    }

    const payload = await memberPayload(member.id);
    return json({ token: body.token, ...payload });
  } catch (e) {
    console.error("loyalty error", e);
    return json({ error: e instanceof Error ? e.message : "Erreur inconnue" }, 500);
  }
});
