import { Document, NodeIO } from "@gltf-transform/core";
import { dedup, prune, quantize } from "@gltf-transform/functions";
import { KHRDracoMeshCompression } from "@gltf-transform/extensions";
import { KHRONOS_EXTENSIONS } from "@gltf-transform/extensions";

/**
 * Compress a GLB file in the browser using gltf-transform + Draco WASM.
 * Returns a compressed GLB as a File object ready for upload.
 */
export async function compressGlb(file: File): Promise<File> {
  const buffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(buffer);

  const io = new NodeIO();

  // Register all Khronos extensions including Draco
  io.registerExtensions(KHRONOS_EXTENSIONS);

  let doc: Document;
  try {
    doc = await io.readBinary(uint8);
  } catch (err) {
    console.warn("Failed to read GLB for compression, uploading as-is:", err);
    return file;
  }

  try {
    // Run optimization passes (pure JS, always works)
    await doc.transform(
      prune(),
      dedup(),
      quantize(),
    );
  } catch (err) {
    console.warn("GLB optimization failed, uploading with partial compression:", err);
  }

  // Try Draco compression
  try {
    const dracoModule = await import("draco3dgltf");
    const encoderModule = await dracoModule.createEncoderModule();
    const decoderModule = await dracoModule.createDecoderModule();

    doc.createExtension(KHRDracoMeshCompression)
      .setRequired(true)
      .setEncoderOptions({
        method: KHRDracoMeshCompression.EncoderMethod.EDGEBREAKER,
        encodeSpeed: 5,
        decodeSpeed: 5,
      });

    // Re-register after adding extension
    io.registerExtensions([KHRDracoMeshCompression]);
    io.registerDependencies({
      "draco3d.encoder": encoderModule,
      "draco3d.decoder": decoderModule,
    });
  } catch (err) {
    console.warn("Draco WASM unavailable, skipping mesh compression:", err);
  }

  let compressed: Uint8Array;
  try {
    compressed = await io.writeBinary(doc);
  } catch (err) {
    console.warn("Failed to write compressed GLB, uploading original:", err);
    return file;
  }

  const compressedFile = new File([compressed], file.name, { type: "model/gltf-binary" });
  
  const ratio = ((1 - compressedFile.size / file.size) * 100).toFixed(0);
  console.log(
    `GLB compressed: ${(file.size / 1e6).toFixed(1)} MB → ${(compressedFile.size / 1e6).toFixed(1)} MB (-${ratio}%)`
  );

  return compressedFile;
}
