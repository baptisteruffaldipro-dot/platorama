const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Validate auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Verify user is admin
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin requis" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { glb_url, dish_id, field } = await req.json();

    if (!glb_url || !dish_id || !field) {
      return new Response(JSON.stringify({ error: "glb_url, dish_id et field requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (field !== "model_android" && field !== "model_ios") {
      return new Response(JSON.stringify({ error: "field doit être model_android ou model_ios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Download the GLB file
    console.log("Downloading GLB from:", glb_url);
    const glbResponse = await fetch(glb_url);
    if (!glbResponse.ok) {
      throw new Error(`Erreur téléchargement GLB: ${glbResponse.status}`);
    }

    const originalBuffer = await glbResponse.arrayBuffer();
    const originalSize = originalBuffer.byteLength;
    console.log(`Taille originale: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);

    // Use gltf-transform for Draco compression
    const { NodeIO } = await import("https://esm.sh/@gltf-transform/core@4.1.1");
    const { dedup, quantize, prune } = await import("https://esm.sh/@gltf-transform/functions@4.1.1");
    const { KHRDracoMeshCompression } = await import("https://esm.sh/@gltf-transform/extensions@4.1.1");
    const draco3d = await import("https://esm.sh/draco3dgltf@1.5.7");

    // Initialize Draco encoder/decoder
    const encoderModule = await draco3d.createEncoderModule();
    const decoderModule = await draco3d.createDecoderModule();

    const io = new NodeIO()
      .registerExtensions([KHRDracoMeshCompression])
      .registerDependencies({
        "draco3d.encoder": encoderModule,
        "draco3d.decoder": decoderModule,
      });

    // Read the GLB
    const document = await io.readBinary(new Uint8Array(originalBuffer));

    // Apply optimizations: dedup, prune, quantize, then Draco
    await document.transform(
      dedup(),
      prune(),
      quantize(),
    );

    // Apply Draco compression extension
    document.createExtension(KHRDracoMeshCompression).setRequired(true);

    // Write compressed GLB
    const compressedBuffer = await io.writeBinary(document);
    const compressedSize = compressedBuffer.byteLength;
    console.log(`Taille compressée: ${(compressedSize / 1024 / 1024).toFixed(2)} MB`);
    const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
    console.log(`Réduction: ${ratio}%`);

    // Upload compressed file
    const path = `models/compressed_${Date.now()}.glb`;
    const { error: uploadError } = await supabase.storage
      .from("dish-assets")
      .upload(path, compressedBuffer, {
        contentType: "model/gltf-binary",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Erreur upload: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage.from("dish-assets").getPublicUrl(path);

    // Update the dish record
    const { error: updateError } = await supabase
      .from("dishes")
      .update({ [field]: urlData.publicUrl })
      .eq("id", dish_id);

    if (updateError) {
      throw new Error(`Erreur mise à jour: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        original_size: originalSize,
        compressed_size: compressedSize,
        reduction_percent: parseFloat(ratio),
        new_url: urlData.publicUrl,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Compression error:", error);
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
