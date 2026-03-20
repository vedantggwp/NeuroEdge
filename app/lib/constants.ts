/** Site-wide constants — single source of truth */

export const SITE = {
  name: "NeuroEdge",
  tagline: "How much more could your website be making?",
  description:
    "Free 30-second accessibility scan. See what your website is missing — and what it's costing you.",
  url: "https://neuroedge.co.uk",
  location: "Liverpool",
} as const;

export const SOCIAL_PROOF = [
  {
    stat: "30/30",
    label: "Liverpool businesses we scanned had failures",
    source: "NeuroEdge audit, Feb 2026",
  },
  {
    stat: "24%",
    label: "of UK visitors have a disability",
    source: "Family Resources Survey, DWP 2023",
  },
  {
    stat: "71%",
    label: "leave sites they can't use",
    source: "Click-Away Pound Survey 2019",
  },
] as const;

export const URL_PATTERN =
  /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w\-./?%&=]*)?$/i;

export const INDUSTRY_BENCHMARKS = {
  restaurant:   { label: "Restaurant / Cafe",            avgOrderValue: 35,  conversionRate: 0.03 },
  salon:        { label: "Hair Salon / Beauty",          avgOrderValue: 45,  conversionRate: 0.05 },
  professional: { label: "Professional Services",        avgOrderValue: 200, conversionRate: 0.02 },
  trades:       { label: "Trades / Home Services",       avgOrderValue: 150, conversionRate: 0.04 },
  retail:       { label: "Retail / E-commerce",          avgOrderValue: 50,  conversionRate: 0.03 },
  health:       { label: "Health / Dental / Gym",        avgOrderValue: 60,  conversionRate: 0.04 },
  property:     { label: "Estate Agent / Property",      avgOrderValue: 500, conversionRate: 0.01 },
  other:        { label: "Other",                        avgOrderValue: 75,  conversionRate: 0.03 },
} as const;

export type IndustryKey = keyof typeof INDUSTRY_BENCHMARKS;

export const ACCESSIBILITY_STATS = {
  disabledPopulationPercent: 0.24,
  clickAwayRate: 0.71,
  recoveryRateLow: 0.14,
  recoveryRateHigh: 0.25,
  source:
    "Family Resources Survey 2023, Click-Away Pound Survey 2019, WebAIM Million 2025",
} as const;
