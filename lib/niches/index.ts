export { SUPPORTED_NICHES, NICHE_REGISTRY, getNiche, nicheLabel, allNicheLabels } from "./registry";
export { detectNiche, classifySite, scoreNiches } from "./detect";
export {
  buildCopyLines,
  sanitizeGeneratedLines,
  groupLinesByAngle,
  angleGroupOf,
  fillTemplate,
  lineRepeatsProperName,
  countPhrase,
} from "./copy";
export {
  safeDisplayName,
  pickHonestName,
  isBannedSloganName,
  isBannedPhone,
  filterRealPhones,
  extractDoctorName,
  extractKnownSlogan,
  extractInsurance,
  isEyadatiBrandSite,
  looksLikeDoctorName,
  mentionsJerusalem,
  jerusalemAllowed,
  lineInventsFacts,
  BANNED_NAME_SLOGANS,
} from "./brand";
export { PLACE_HINTS, findPlaceHint, findExplicitJerusalem } from "./places";
export { NICHE_IDS, ANGLE_GROUPS } from "./types";
export type { CopyTemplate, ImageMotif, NicheDefinition, AnyNicheDefinition, AngleGroupId } from "./types";
