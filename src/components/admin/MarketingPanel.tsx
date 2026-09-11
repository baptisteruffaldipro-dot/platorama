import { useState } from "react";
import { Megaphone, Send } from "lucide-react";
import PopupsPanel from "./PopupsPanel";
import CampaignsPanel from "./CampaignsPanel";

const SUBTABS = [
  { key: "popups", label: "Pop-ups", icon: Megaphone },
  { key: "campaigns", label: "Campagnes", icon: Send },
] as const;

type SubTab = (typeof SUBTABS)[number]["key"];

const MarketingPanel = ({ restaurantId }: { restaurantId: string }) => {
  const [sub, setSub] = useState<SubTab>("popups");

  return (
    <div>
      <div className="flex gap-2 p-4 pb-0">
        {SUBTABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setSub(t.key)}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              sub === t.key
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>
      {sub === "popups" ? (
        <PopupsPanel restaurantId={restaurantId} />
      ) : (
        <CampaignsPanel restaurantId={restaurantId} />
      )}
    </div>
  );
};

export default MarketingPanel;
