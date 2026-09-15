import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const RequestSchema = z.object({
  provider: z.enum(["apple", "google"]),
  token: z.string().uuid(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée" }, 405);

  try {
    const parsed = RequestSchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Demande Wallet invalide" }, 400);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) return json({ error: "Service indisponible" }, 503);

    const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const { data: member } = await admin
      .from("loyalty_members")
      .select("id, restaurant_id, first_name, last_name, card_code, points")
      .eq("access_token", parsed.data.token)
      .maybeSingle();
    if (!member) return json({ error: "Carte introuvable" }, 404);

    const serviceUrl = Deno.env.get(
      parsed.data.provider === "apple" ? "APPLE_WALLET_SERVICE_URL" : "GOOGLE_WALLET_SERVICE_URL",
    );
    const serviceToken = Deno.env.get("WALLET_SERVICE_TOKEN");
    if (!serviceUrl || !serviceToken) {
      return json({
        error:
          parsed.data.provider === "apple"
            ? "Apple Wallet sera disponible après activation du certificat."
            : "Google Wallet sera disponible après activation du compte émetteur.",
        configured: false,
      }, 503);
    }

    const response = await fetch(serviceUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceToken}` },
      body: JSON.stringify({ provider: parsed.data.provider, member }),
    });
    if (!response.ok) return json({ error: "Création de la carte Wallet impossible" }, 502);

    const result = await response.json();
    const ResultSchema = z.object({ url: z.string().url() });
    const validResult = ResultSchema.safeParse(result);
    if (!validResult.success) return json({ error: "Réponse Wallet invalide" }, 502);
    return json({ url: validResult.data.url, configured: true });
  } catch (error) {
    console.error("wallet-pass error", error instanceof Error ? error.message : "unknown");
    return json({ error: "Service Wallet indisponible" }, 500);
  }
});