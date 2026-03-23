/**
 * Heuristic industry detection from page signals.
 * Schema.org @type is decisive (10 pts), keyword matches are 1 pt each.
 * Falls back to "other" if no category scores above threshold.
 */

export type IndustryKey =
  | "restaurant"
  | "salon"
  | "professional"
  | "trades"
  | "retail"
  | "health"
  | "property"
  | "other";

export interface PageSignals {
  title: string;
  metaDescription: string;
  metaKeywords: string;
  h1s: string[];
  schemaTypes: string[];
  navText: string;
  bodySnippet: string;
  url: string;
}

const SCHEMA_TYPE_MAP: Record<string, IndustryKey> = {
  restaurant: "restaurant",
  cafe: "restaurant",
  foodestablishment: "restaurant",
  bakery: "restaurant",
  barorgrill: "restaurant",
  coffeeshop: "restaurant",
  fastfoodrestaurant: "restaurant",
  icecreamshop: "restaurant",

  hairsalon: "salon",
  beautysalon: "salon",
  dayspa: "salon",
  nailsalon: "salon",
  tattooparlor: "salon",
  healthandbeautybusiness: "salon",

  dentist: "health",
  medicalclinic: "health",
  physician: "health",
  hospital: "health",
  medicalbusiness: "health",
  optician: "health",
  pharmacy: "health",
  physiotherapy: "health",
  gymorfitnesscenter: "health",
  sportsclub: "health",
  healthclub: "health",

  realestateagent: "property",
  realestatelisting: "property",

  electrician: "trades",
  plumber: "trades",
  hvacbusiness: "trades",
  locksmith: "trades",
  homeandconstructionbusiness: "trades",
  roofingcontractor: "trades",
  generalcontractor: "trades",
  movingcompany: "trades",

  legalservice: "professional",
  attorney: "professional",
  accountingservice: "professional",
  financialservice: "professional",
  notary: "professional",
  insuranceagency: "professional",
  employmentagency: "professional",

  store: "retail",
  clothingstore: "retail",
  furniturestore: "retail",
  electronicsstore: "retail",
  hardwarestore: "retail",
  jewelrystore: "retail",
  shoppingcenter: "retail",
  onlinestore: "retail",
};

const KEYWORD_MAP: Record<Exclude<IndustryKey, "other">, readonly string[]> = {
  restaurant: [
    "restaurant", "cafe", "menu", "table booking", "reservation",
    "dine", "pizza", "curry", "food", "takeaway", "delivery",
    "cuisine", "chef", "bistro", "pub", "bar", "grill",
    "order online", "eat", "brunch", "lunch", "dinner",
  ],
  salon: [
    "salon", "hair", "beauty", "nails", "eyebrow", "lash",
    "wax", "facial", "spa", "treatment", "cut and colour",
    "blow dry", "barbershop", "barber", "stylist", "manicure",
    "pedicure", "tanning", "aesthetics",
  ],
  health: [
    "dental", "dentist", "clinic", "physiotherapy", "physio",
    "gym", "fitness", "health", "therapy", "medical",
    "appointment", "nhs", "chiropractor", "optician", "doctor",
    "surgery", "patient", "gp practice", "wellbeing", "yoga",
    "pilates", "personal trainer",
  ],
  property: [
    "estate agent", "property", "letting", "lettings", "mortgage",
    "landlord", "rental", "tenancy", "rightmove", "zoopla",
    "property management", "house for sale", "flat to rent",
    "valuation", "conveyancing", "surveyor",
  ],
  trades: [
    "plumber", "plumbing", "electrician", "electrical", "builder",
    "carpenter", "roofer", "roofing", "gas safe", "heating",
    "boiler", "installation", "contractor", "handyman",
    "painting", "decorator", "joiner", "glazier", "fencing",
    "landscaping", "gardener", "pest control", "locksmith",
  ],
  professional: [
    "solicitor", "accountant", "lawyer", "consultant",
    "financial advisor", "financial adviser", "insurance",
    "tax", "chartered", "law firm", "audit", "bookkeeping",
    "legal", "barrister", "advisory", "wealth management",
    "recruitment", "hr consultant",
  ],
  retail: [
    "shop", "store", "buy now", "add to cart", "add to basket",
    "checkout", "free delivery", "free shipping", "returns policy",
    "product", "order", "in stock", "price", "collection",
    "shopify", "woocommerce", "ecommerce", "e-commerce",
    "sale", "discount", "basket",
  ],
};

const MATCH_THRESHOLD = 2;

export function detectIndustry(signals: PageSignals): IndustryKey {
  // 1. Schema.org type match is decisive
  for (const schemaType of signals.schemaTypes) {
    const normalised = schemaType.toLowerCase().replace(/\s/g, "");
    const match = SCHEMA_TYPE_MAP[normalised];
    if (match) return match;
  }

  // 2. Keyword scoring across all text signals
  const haystack = [
    signals.title,
    signals.metaDescription,
    signals.metaKeywords,
    ...signals.h1s,
    signals.navText,
    signals.bodySnippet,
    signals.url,
  ]
    .join(" ")
    .toLowerCase();

  const scores: Record<string, number> = {};

  for (const [industry, keywords] of Object.entries(KEYWORD_MAP)) {
    let score = 0;
    for (const keyword of keywords) {
      if (haystack.includes(keyword)) {
        score += 1;
      }
    }
    scores[industry] = score;
  }

  // Find highest scoring industry
  let bestKey: IndustryKey = "other";
  let bestScore = 0;

  for (const [industry, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestKey = industry as IndustryKey;
    }
  }

  return bestScore >= MATCH_THRESHOLD ? bestKey : "other";
}

/**
 * Extract classification signals from a Puppeteer page.
 * Call this while the page is loaded, before closing.
 */
export async function extractPageSignals(
  page: { evaluate: (fn: () => unknown) => Promise<unknown>; url: () => string },
): Promise<PageSignals> {
  try {
    const extracted = (await page.evaluate(() => {
      const getMeta = (name: string): string =>
        (document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null)?.content ?? "";

      const h1Elements = Array.from(document.querySelectorAll("h1"));
      const h1s = h1Elements.slice(0, 3).map((el) => el.textContent?.trim() ?? "");

      // Extract Schema.org JSON-LD types
      const schemaTypes: string[] = [];
      try {
        const ldScripts = document.querySelectorAll('script[type="application/ld+json"]');
        for (const script of ldScripts) {
          const data = JSON.parse(script.textContent ?? "{}");
          const items = Array.isArray(data) ? data : [data];
          for (const item of items) {
            if (item["@type"]) {
              const types = Array.isArray(item["@type"]) ? item["@type"] : [item["@type"]];
              schemaTypes.push(...types);
            }
            // Check @graph
            if (Array.isArray(item["@graph"])) {
              for (const node of item["@graph"]) {
                if (node["@type"]) {
                  const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
                  schemaTypes.push(...types);
                }
              }
            }
          }
        }
      } catch {
        // Malformed JSON-LD — ignore
      }

      const navEls = document.querySelectorAll("nav a");
      const navText = Array.from(navEls)
        .map((a) => a.textContent?.trim() ?? "")
        .join(" ")
        .slice(0, 500);

      const bodyText = (document.body.innerText ?? "").slice(0, 1500);

      return {
        title: document.title ?? "",
        metaDescription: getMeta("description"),
        metaKeywords: getMeta("keywords"),
        h1s,
        schemaTypes,
        navText,
        bodySnippet: bodyText,
      };
    })) as Omit<PageSignals, "url">;

    return { ...extracted, url: page.url() };
  } catch {
    return {
      title: "",
      metaDescription: "",
      metaKeywords: "",
      h1s: [],
      schemaTypes: [],
      navText: "",
      bodySnippet: "",
      url: page.url(),
    };
  }
}
