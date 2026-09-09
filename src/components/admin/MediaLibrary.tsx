import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Images, Upload, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMediaAssets, type MediaAsset } from "@/hooks/useCampaigns";

interface Props {
  restaurantId: string;
  /** Si fourni, un bouton « Utiliser » apparaît sur chaque visuel. */
  onPick?: (asset: MediaAsset) => void;
  selectedUrl?: string;
}

const MediaLibrary = ({ restaurantId, onPick, selectedUrl }: Props) => {
  const { data: assets } = useMediaAssets(restaurantId);
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const refresh = () => qc.invalidateQueries({ queryKey: ["media-assets", restaurantId] });

  const upload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `media/${restaurantId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("dish-assets").upload(path, file);
    if (error) {
      setUploading(false);
      toast.error("Envoi impossible");
      return;
    }
    const { data } = supabase.storage.from("dish-assets").getPublicUrl(path);
    const { error: insErr } = await supabase.from("media_assets").insert({
      restaurant_id: restaurantId,
      label: file.name,
      url: data.publicUrl,
      storage_path: path,
      kind: "image",
    });
    setUploading(false);
    if (insErr) {
      toast.error(insErr.message);
      return;
    }
    toast.success("Visuel ajouté");
    refresh();
  };

  const remove = async (asset: MediaAsset) => {
    if (!confirm("Supprimer ce visuel ?")) return;
    if (asset.storage_path) {
      await supabase.storage.from("dish-assets").remove([asset.storage_path]);
    }
    const { error } = await supabase.from("media_assets").delete().eq("id", asset.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    refresh();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Images className="w-4 h-4 text-accent" />
          <h3 className="font-semibold text-sm">Médiathèque</h3>
        </div>
        <Button asChild variant="outline" size="sm" disabled={uploading}>
          <label className="cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? "Envoi..." : "Ajouter un visuel"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
            />
          </label>
        </Button>
      </div>

      {!assets?.length ? (
        <p className="text-xs text-muted-foreground">
          Aucun visuel pour le moment. Ajoutez vos photos une fois, réutilisez-les partout.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {assets.map((a) => (
            <div
              key={a.id}
              className={`relative rounded-xl overflow-hidden border ${
                selectedUrl === a.url ? "border-accent ring-2 ring-accent/40" : "border-border"
              }`}
            >
              <img src={a.url} alt={a.label} className="w-full h-24 object-cover" loading="lazy" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-background/85 backdrop-blur px-2 py-1">
                {onPick ? (
                  <button
                    type="button"
                    className="text-xs font-medium text-accent hover:underline"
                    onClick={() => onPick(a)}
                  >
                    {selectedUrl === a.url ? (
                      <span className="flex items-center gap-1">
                        <Check className="w-3 h-3" /> Choisi
                      </span>
                    ) : (
                      "Utiliser"
                    )}
                  </button>
                ) : (
                  <span className="text-[11px] truncate text-muted-foreground">{a.label}</span>
                )}
                <button
                  type="button"
                  aria-label="Supprimer le visuel"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => remove(a)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;
