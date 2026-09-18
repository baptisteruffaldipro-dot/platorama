import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download, QrCode, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { buildMenuUrl } from "@/lib/slug";

interface QRCodePanelProps {
  restaurantId: string;
  restaurantName?: string;
  /** Optional: pre-known slug (avoids extra fetch) */
  slug?: string;
}

const QRCodePanel = ({ restaurantId, restaurantName, slug: slugProp }: QRCodePanelProps) => {
  const svgRef = useRef<HTMLDivElement>(null);
  const [slug, setSlug] = useState<string | null>(slugProp ?? null);

  useEffect(() => {
    if (slugProp) {
      setSlug(slugProp);
      return;
    }
    let cancelled = false;
    supabase
      .from("restaurants")
      .select("slug")
      .eq("id", restaurantId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data?.slug) setSlug(data.slug);
      });
    return () => {
      cancelled = true;
    };
  }, [restaurantId, slugProp]);

  const menuUrl = slug ? buildMenuUrl(slug) : "";

  const handleDownload = () => {
    const svg = svgRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    canvas.width = 1024;
    canvas.height = 1024;

    img.onload = () => {
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 1024, 1024);
      ctx.drawImage(img, 0, 0, 1024, 1024);

      const link = document.createElement("a");
      link.download = `qr-${restaurantName || "menu"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div>
      <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider text-muted-foreground flex items-center gap-2">
        <QrCode className="w-4 h-4" />
        QR Code du menu
      </h3>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div ref={svgRef} className="bg-white p-4 rounded-lg">
          {menuUrl ? (
            <QRCodeSVG
              value={menuUrl}
              size={180}
              level="H"
              includeMargin={false}
            />
          ) : (
            <div className="w-[180px] h-[180px] flex items-center justify-center text-xs text-muted-foreground">
              Chargement…
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2 text-center sm:text-left">
          <p className="text-sm text-muted-foreground">
            Scannez ce QR code pour accéder directement au menu en réalité augmentée.
          </p>
          <p className="text-xs text-muted-foreground/60 break-all">{menuUrl}</p>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-1" />
            Télécharger le QR code
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QRCodePanel;
