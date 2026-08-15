import type { Locale } from "@/lib/i18n/config";

/**
 * Reference catalog of popular peptides shown as autocomplete suggestions in
 * the treatment form, plus a "quick reference" info panel when one is picked.
 *
 * The function/dose/frequency values are anecdotal figures compiled from
 * online user reports — NOT medical guidance. The UI surfaces a disclaimer to
 * that effect (see `peptide.disclaimer` in the i18n dictionaries).
 */

interface Localized {
  es: string;
  en: string;
}

export interface Peptide {
  /** Canonical name — this is what gets inserted into the name field. */
  name: string;
  /** Alternative spellings/names used for matching (accent-insensitive). */
  aliases?: string[];
  /** Attributed function ("función que se le atribuye online"). */
  fn: Localized;
  /** User-reported dose. */
  dose: Localized;
  /** User-reported frequency. */
  freq: Localized;
}

export const PEPTIDES: Peptide[] = [
  {
    name: "GHK-Cu",
    aliases: ["GHK", "copper peptide", "cobre"],
    fn: { es: "Piel, colágeno, cabello", en: "Skin, collagen, hair" },
    dose: { es: "~1–2 mg", en: "~1–2 mg" },
    freq: { es: "5–7×/semana", en: "5–7×/week" },
  },
  {
    name: "Retatrutida",
    aliases: ["Retatrutide", "Reta"],
    fn: { es: "Pérdida de grasa/apetito", en: "Fat loss/appetite" },
    dose: { es: "~2–5 mg", en: "~2–5 mg" },
    freq: { es: "1×/semana", en: "1×/week" },
  },
  {
    name: "Tirzepatida",
    aliases: ["Tirzepatide", "Mounjaro", "Zepbound"],
    fn: { es: "Pérdida de grasa/apetito", en: "Fat loss/appetite" },
    dose: { es: "~2.5–15 mg", en: "~2.5–15 mg" },
    freq: { es: "1×/semana", en: "1×/week" },
  },
  {
    name: "Semaglutida",
    aliases: ["Semaglutide", "Ozempic", "Wegovy"],
    fn: { es: "Pérdida de grasa/apetito", en: "Fat loss/appetite" },
    dose: { es: "~0.25–2.4 mg", en: "~0.25–2.4 mg" },
    freq: { es: "1×/semana", en: "1×/week" },
  },
  {
    name: "BPC-157",
    aliases: ["BPC157", "BPC"],
    fn: { es: "Recuperación/tejidos", en: "Recovery/tissues" },
    dose: { es: "~250–500 µg", en: "~250–500 µg" },
    freq: { es: "1–2×/día", en: "1–2×/day" },
  },
  {
    name: "TB-500",
    aliases: ["TB500"],
    fn: { es: "Recuperación", en: "Recovery" },
    dose: { es: "~2–5 mg", en: "~2–5 mg" },
    freq: { es: "1–2×/semana", en: "1–2×/week" },
  },
  {
    name: "CJC-1295 + Ipamorelin",
    aliases: ["CJC Ipamorelin", "CJC+Ipamorelin"],
    fn: {
      es: "GH, recuperación, composición corporal",
      en: "GH, recovery, body composition",
    },
    dose: { es: "~100–300 µg de cada uno", en: "~100–300 µg each" },
    freq: { es: "1–2×/día", en: "1–2×/day" },
  },
  {
    name: "Ipamorelin",
    fn: { es: "GH/recuperación", en: "GH/recovery" },
    dose: { es: "~100–300 µg", en: "~100–300 µg" },
    freq: { es: "1–2×/día", en: "1–2×/day" },
  },
  {
    name: "CJC-1295 no-DAC",
    aliases: ["CJC-1295 sin DAC", "Mod GRF 1-29"],
    fn: { es: "GH/recuperación", en: "GH/recovery" },
    dose: { es: "~100–300 µg", en: "~100–300 µg" },
    freq: { es: "1–2×/día", en: "1–2×/day" },
  },
  {
    name: "CJC-1295 DAC",
    fn: { es: "GH/recuperación", en: "GH/recovery" },
    dose: { es: "~1–2 mg", en: "~1–2 mg" },
    freq: { es: "1–2×/semana", en: "1–2×/week" },
  },
  {
    name: "MOTS-c",
    aliases: ["MOTSc"],
    fn: { es: "Metabolismo/energía", en: "Metabolism/energy" },
    dose: { es: "~2–10 mg", en: "~2–10 mg" },
    freq: { es: "2–3×/semana", en: "2–3×/week" },
  },
  {
    name: "AOD-9604",
    aliases: ["AOD9604", "AOD"],
    fn: { es: "Pérdida de grasa", en: "Fat loss" },
    dose: { es: "~250–500 µg", en: "~250–500 µg" },
    freq: { es: "1×/día", en: "1×/day" },
  },
  {
    name: "Melanotan II",
    aliases: ["MT-II", "MT2", "Melanotan 2"],
    fn: { es: "Bronceado", en: "Tanning" },
    dose: { es: "~50–200 µg", en: "~50–200 µg" },
    freq: {
      es: "variable; inicialmente frecuente",
      en: "variable; initially frequent",
    },
  },
  {
    name: "PT-141",
    aliases: ["Bremelanotida", "Bremelanotide", "PT141"],
    fn: { es: "Libido", en: "Libido" },
    dose: { es: "~0.5–2 mg", en: "~0.5–2 mg" },
    freq: { es: "ocasional", en: "occasional" },
  },
  {
    name: "Sermorelina",
    aliases: ["Sermorelin"],
    fn: { es: "GH/recuperación", en: "GH/recovery" },
    dose: { es: "~200–500 µg", en: "~200–500 µg" },
    freq: { es: "1×/día", en: "1×/day" },
  },
  {
    name: "Tesamorelina",
    aliases: ["Tesamorelin", "Egrifta"],
    fn: { es: "Grasa visceral", en: "Visceral fat" },
    dose: { es: "~1–2 mg", en: "~1–2 mg" },
    freq: { es: "1×/día", en: "1×/day" },
  },
  {
    name: "GHRP-2",
    aliases: ["GHRP2"],
    fn: { es: "GH", en: "GH" },
    dose: { es: "~100–300 µg", en: "~100–300 µg" },
    freq: { es: "1–3×/día", en: "1–3×/day" },
  },
  {
    name: "GHRP-6",
    aliases: ["GHRP6"],
    fn: { es: "GH/apetito", en: "GH/appetite" },
    dose: { es: "~100–300 µg", en: "~100–300 µg" },
    freq: { es: "1–3×/día", en: "1–3×/day" },
  },
  {
    name: "Hexarelin",
    fn: { es: "GH", en: "GH" },
    dose: { es: "~100–300 µg", en: "~100–300 µg" },
    freq: { es: "1×/día", en: "1×/day" },
  },
  {
    name: "IGF-1 LR3",
    aliases: ["IGF1 LR3", "LR3"],
    fn: { es: "Músculo", en: "Muscle" },
    dose: { es: "~20–100 µg", en: "~20–100 µg" },
    freq: { es: "variable", en: "variable" },
  },
  {
    name: "IGF-1 DES",
    aliases: ["IGF1 DES", "DES"],
    fn: { es: "Músculo", en: "Muscle" },
    dose: { es: "~20–100 µg", en: "~20–100 µg" },
    freq: { es: "variable", en: "variable" },
  },
  {
    name: "PEG-MGF",
    aliases: ["PEG MGF", "MGF"],
    fn: { es: "Recuperación/músculo", en: "Recovery/muscle" },
    dose: { es: "~100–500 µg", en: "~100–500 µg" },
    freq: { es: "variable", en: "variable" },
  },
  {
    name: "Epitalon",
    aliases: ["Epithalon"],
    fn: { es: "Longevidad/anti-aging", en: "Longevity/anti-aging" },
    dose: { es: "~5–10 mg", en: "~5–10 mg" },
    freq: { es: "ciclos", en: "cycles" },
  },
  {
    name: "Selank",
    fn: { es: "Estrés/foco", en: "Stress/focus" },
    dose: { es: "~200–500 µg", en: "~200–500 µg" },
    freq: { es: "1–2×/día", en: "1–2×/day" },
  },
  {
    name: "Semax",
    fn: { es: "Cognición/foco", en: "Cognition/focus" },
    dose: { es: "~200–600 µg", en: "~200–600 µg" },
    freq: { es: "1–2×/día", en: "1–2×/day" },
  },
  {
    name: "DSIP",
    fn: { es: "Sueño", en: "Sleep" },
    dose: { es: "~100–300 µg", en: "~100–300 µg" },
    freq: { es: "nocturna", en: "nightly" },
  },
  {
    name: "KPV",
    fn: { es: "Inflamación/piel", en: "Inflammation/skin" },
    dose: { es: "~200–500 µg", en: "~200–500 µg" },
    freq: { es: "1×/día", en: "1×/day" },
  },
  {
    name: "Thymosin Alpha-1",
    aliases: ["Timosina Alfa-1", "TA1", "Thymalfasin"],
    fn: { es: "Inmunomodulación", en: "Immunomodulation" },
    dose: { es: "~1–2 mg", en: "~1–2 mg" },
    freq: { es: "2×/semana", en: "2×/week" },
  },
  {
    name: "Thymosin Beta-4",
    aliases: ["Timosina Beta-4", "TB4"],
    fn: { es: "Reparación", en: "Repair" },
    dose: { es: "~2–5 mg", en: "~2–5 mg" },
    freq: { es: "1–2×/semana", en: "1–2×/week" },
  },
  {
    name: "LL-37",
    aliases: ["LL37"],
    fn: { es: "Piel/cicatrización", en: "Skin/wound healing" },
    dose: { es: "~100–500 µg", en: "~100–500 µg" },
    freq: { es: "variable", en: "variable" },
  },
  {
    name: "ARA-290",
    aliases: ["ARA290", "Cibinetide"],
    fn: {
      es: "Neuroprotección/recuperación",
      en: "Neuroprotection/recovery",
    },
    dose: { es: "~1–4 mg", en: "~1–4 mg" },
    freq: { es: "variable", en: "variable" },
  },
  {
    name: "SS-31",
    aliases: ["Elamipretide", "SS31", "MTP-131"],
    fn: { es: "Mitocondrias/energía", en: "Mitochondria/energy" },
    dose: { es: "~5–30 mg", en: "~5–30 mg" },
    freq: { es: "variable", en: "variable" },
  },
  {
    name: "5-Amino-1MQ",
    aliases: ["5 Amino 1MQ", "5A1MQ"],
    fn: { es: "Metabolismo/grasa", en: "Metabolism/fat" },
    dose: { es: "~100–200 µg", en: "~100–200 µg" },
    freq: { es: "5×/semana", en: "5×/week" },
  },
  {
    name: "SLU-PP-332",
    aliases: ["SLU PP 332"],
    fn: {
      es: 'Metabolismo/"exercise mimetic"',
      en: 'Metabolism/"exercise mimetic"',
    },
    dose: { es: "~250–500 µg", en: "~250–500 µg" },
    freq: { es: "1–3×/día", en: "1–3×/day" },
  },
  {
    name: "Kisspeptin-10",
    aliases: ["Kisspeptin 10"],
    fn: { es: "Eje hormonal/libido", en: "Hormonal axis/libido" },
    dose: { es: "~100–500 µg", en: "~100–500 µg" },
    freq: { es: "variable", en: "variable" },
  },
  {
    name: "NAD+",
    aliases: ["NAD", "NAD plus"],
    fn: { es: 'Energía/"anti-aging"', en: 'Energy/"anti-aging"' },
    dose: { es: "variable", en: "variable" },
    freq: { es: "variable", en: "variable" },
  },
  {
    name: "Glutatión",
    aliases: ["Glutathione", "GSH"],
    fn: { es: "Antioxidante/piel", en: "Antioxidant/skin" },
    dose: { es: "~600–1,200 mg", en: "~600–1,200 mg" },
    freq: { es: "variable", en: "variable" },
  },
  {
    name: "GH / Somatropina",
    aliases: ["Somatropin", "HGH", "Hormona de crecimiento", "Growth hormone"],
    fn: {
      es: "Músculo/composición corporal",
      en: "Muscle/body composition",
    },
    dose: { es: "variable", en: "variable" },
    freq: { es: "1×/día", en: "1×/day" },
  },
  {
    name: "Cagrilintida",
    aliases: ["Cagrilintide", "Cagri"],
    fn: { es: "Apetito/pérdida de grasa", en: "Appetite/fat loss" },
    dose: { es: "~0.3–4.5 mg", en: "~0.3–4.5 mg" },
    freq: { es: "1×/semana", en: "1×/week" },
  },
  {
    name: "CagriSema",
    fn: { es: "Pérdida de grasa", en: "Fat loss" },
    dose: { es: "variable", en: "variable" },
    freq: { es: "1×/semana", en: "1×/week" },
  },
  {
    name: "Survodutida",
    aliases: ["Survodutide"],
    fn: { es: "Pérdida de grasa", en: "Fat loss" },
    dose: { es: "variable", en: "variable" },
    freq: { es: "1×/semana", en: "1×/week" },
  },
  {
    name: "Mazdutida",
    aliases: ["Mazdutide"],
    fn: { es: "Pérdida de grasa", en: "Fat loss" },
    dose: { es: "variable", en: "variable" },
    freq: { es: "1×/semana", en: "1×/week" },
  },
  {
    name: "Pemvidutida",
    aliases: ["Pemvidutide"],
    fn: { es: "Pérdida de grasa", en: "Fat loss" },
    dose: { es: "variable", en: "variable" },
    freq: { es: "1×/semana", en: "1×/week" },
  },
  {
    name: "Kisspeptin",
    fn: { es: "Hormonas/libido", en: "Hormones/libido" },
    dose: { es: "variable", en: "variable" },
    freq: { es: "variable", en: "variable" },
  },
  {
    name: "Pinealon",
    fn: { es: "Cognición/anti-aging", en: "Cognition/anti-aging" },
    dose: { es: "~5–10 mg", en: "~5–10 mg" },
    freq: { es: "ciclos", en: "cycles" },
  },
  {
    name: "Thymulin",
    aliases: ["Timulina"],
    fn: { es: "Inmunidad/anti-aging", en: "Immunity/anti-aging" },
    dose: { es: "variable", en: "variable" },
    freq: { es: "variable", en: "variable" },
  },
  {
    name: "FOXO4-DRI",
    aliases: ["FOXO4 DRI", "FOXO4"],
    fn: { es: "Senolítico/longevidad", en: "Senolytic/longevity" },
    dose: { es: "experimental", en: "experimental" },
    freq: { es: "experimental", en: "experimental" },
  },
  {
    name: "MOTS-c + SS-31",
    aliases: ["MOTSc SS31"],
    fn: { es: "Mitocondrias/metabolismo", en: "Mitochondria/metabolism" },
    dose: { es: "combinaciones variables", en: "variable combinations" },
    freq: { es: "2–3×/semana", en: "2–3×/week" },
  },
  {
    name: "GLOW",
    aliases: ["GHK-Cu + BPC-157 + TB-500"],
    fn: { es: "Piel + recuperación", en: "Skin + recovery" },
    dose: {
      es: "~2 mg GHK-Cu + cantidades variables de BPC/TB",
      en: "~2 mg GHK-Cu + variable BPC/TB",
    },
    freq: { es: "frecuentemente 5–7×/semana", en: "often 5–7×/week" },
  },
  {
    name: "KLOW",
    aliases: ["KPV + BPC-157 + TB-500 + GHK-Cu"],
    fn: { es: "Piel + recuperación", en: "Skin + recovery" },
    dose: { es: "cantidades variables", en: "variable amounts" },
    freq: { es: "frecuentemente diaria", en: "often daily" },
  },
];

/** Lowercase, strip accents and collapse spaces for tolerant matching. */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** All searchable strings for a peptide (name + aliases), normalized. */
function haystack(peptide: Peptide): string[] {
  return [peptide.name, ...(peptide.aliases ?? [])].map(normalize);
}

/**
 * Suggestions for the given query. Prefix matches rank above substring
 * matches. An empty query returns the full list (so focusing shows options).
 */
export function searchPeptides(query: string, limit = 8): Peptide[] {
  const q = normalize(query);
  if (!q) return PEPTIDES.slice(0, limit);

  const starts: Peptide[] = [];
  const contains: Peptide[] = [];
  for (const peptide of PEPTIDES) {
    const terms = haystack(peptide);
    if (terms.some((t) => t.startsWith(q))) starts.push(peptide);
    else if (terms.some((t) => t.includes(q))) contains.push(peptide);
  }
  return [...starts, ...contains].slice(0, limit);
}

/** Exact (accent-insensitive) match against a peptide name or alias, else null. */
export function findPeptide(value: string): Peptide | null {
  const q = normalize(value);
  if (!q) return null;
  return PEPTIDES.find((p) => haystack(p).includes(q)) ?? null;
}

/** Pick the localized string for the active locale. */
export function localized(value: { es: string; en: string }, locale: Locale): string {
  return value[locale] ?? value.es;
}
