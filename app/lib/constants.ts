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
