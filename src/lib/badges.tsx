import React from "react";
import { Flame, Heart, Sparkles } from "lucide-react";
import vbfLogo from "@/assets/badge-vbf.png";

export interface BadgeDef {
  value: string;
  /** Libellé complet (formulaires, vues détaillées) */
  label: string;
  /** Libellé court (listes, pastilles compactes) */
  shortLabel: string;
  /** Emoji utilisé dans le tableau admin */
  emoji?: string;
  icon?: React.ElementType;
  /** Logo image (prioritaire sur l'icône) */
  image?: string;
}

export const BADGES: BadgeDef[] = [
  { value: "bestseller", label: "Best seller", shortLabel: "Best", emoji: "🔥", icon: Flame },
  { value: "coup_de_coeur", label: "Coup de cœur", shortLabel: "♥", emoji: "❤️", icon: Heart },
  { value: "nouveau", label: "Nouveau", shortLabel: "Nouveau", emoji: "✨", icon: Sparkles },
  {
    value: "viande_bovine_francaise",
    label: "Viande bovine française",
    shortLabel: "VBF",
    emoji: "🇫🇷",
    image: vbfLogo,
  },
];

export const getBadge = (value?: string | null): BadgeDef | undefined =>
  value ? BADGES.find((b) => b.value === value) : undefined;

/** Rendu de l'icône ou du logo d'un badge, dimensionné par `className`. */
export const BadgeMark = ({ badge, className }: { badge: BadgeDef; className?: string }) => {
  if (badge.image) {
    return <img src={badge.image} alt={badge.label} loading="lazy" className={`${className ?? ""} w-auto object-contain`} />;
  }
  const Icon = badge.icon;
  return Icon ? <Icon className={className} /> : null;
};
