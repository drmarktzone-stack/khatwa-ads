import type { Lang, NicheId } from "../types";
import { beautyAesthetic } from "./defs/beauty-aesthetic";
import { contractors } from "./defs/contractors";
import { dental } from "./defs/dental";
import { fitness } from "./defs/fitness";
import { homeTrades } from "./defs/home-trades";
import { lawyers } from "./defs/lawyers";
import { medicalClinics } from "./defs/medical-clinics";
import { outOfNiche } from "./defs/out-of-niche";
import { realEstateAgents } from "./defs/real-estate-agents";
import { restaurants } from "./defs/restaurants";
import { tutoring } from "./defs/tutoring";
import type { AnyNicheDefinition } from "./types";
import { NICHE_IDS } from "./types";

export const SUPPORTED_NICHES = NICHE_IDS;

export const NICHE_REGISTRY: Record<Exclude<NicheId, "out_of_niche">, AnyNicheDefinition> & {
  out_of_niche: AnyNicheDefinition;
} = {
  lawyers,
  real_estate_agents: realEstateAgents,
  medical_clinics: medicalClinics,
  dental,
  beauty_aesthetic: beautyAesthetic,
  contractors,
  tutoring,
  restaurants,
  fitness,
  home_trades: homeTrades,
  out_of_niche: outOfNiche,
};

export function getNiche(id: NicheId): AnyNicheDefinition {
  return NICHE_REGISTRY[id] || NICHE_REGISTRY.out_of_niche;
}

export function nicheLabel(niche: NicheId, lang: Lang): string {
  return getNiche(niche).labels[lang];
}

export function allNicheLabels(lang: Lang): Array<{ id: NicheId; label: string }> {
  return SUPPORTED_NICHES.map((id) => ({ id, label: nicheLabel(id, lang) }));
}
