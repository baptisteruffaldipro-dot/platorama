import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Hard input limits to prevent abuse of AI credits
const MAX_TEXTS = 200;
const MAX_TEXT_LENGTH = 500;
const ALLOWED_LANGS = new Set([
  "en", "es", "de", "it", "pt", "nl", "ja", "zh", "ko", "ar", "ru", "tr",
  "pl", "sv", "no", "da", "fi", "el", "he", "hi", "th", "vi", "id", "uk",
]);

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { texts, target_lang } = await req.json();

    if (!texts || !Array.isArray(texts) || !target_lang || typeof target_lang !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing texts array or target_lang" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate target_lang against allowlist
    const lang = target_lang.toLowerCase().trim();
    if (!ALLOWED_LANGS.has(lang)) {
      return new Response(
        JSON.stringify({ error: "Unsupported target language" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Cap array size
    if (texts.length === 0 || texts.length > MAX_TEXTS) {
      return new Response(
        JSON.stringify({ error: `texts must contain between 1 and ${MAX_TEXTS} items` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate and truncate each text item
    const safeTexts: string[] = [];
    for (const t of texts) {
      if (typeof t !== "string") {
        return new Response(
          JSON.stringify({ error: "All texts must be strings" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      safeTexts.push(t.slice(0, MAX_TEXT_LENGTH));
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `Translate the following JSON array of strings from French to ${lang}. Return ONLY a JSON array of translated strings in the same order, no explanation.

${JSON.stringify(safeTexts)}`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            {
              role: "system",
              content:
                "You are a professional restaurant menu translator. Translate accurately, keeping culinary terms authentic when appropriate. Return ONLY a JSON array of strings.",
            },
            { role: "user", content: prompt },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "[]";

    // Extract JSON array from response
    const match = content.match(/\[[\s\S]*\]/);
    const translations = match ? JSON.parse(match[0]) : safeTexts;

    return new Response(JSON.stringify({ translations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("translate error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
