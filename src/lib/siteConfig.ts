import raw from "../data/site.json";

type NavItem = { id: string; label: string };
type Package = { 
  id: string; 
  title: string; 
  basePrice: number; 
  monthlyPrices?: Record<string, number>;
  [key: string]: any; // Sblocca eventuali parametri extra nei pacchetti
};

// ⚠️ LA MAGIA È QUI: Abbiamo rimosso "typeof raw".
// Ora TypeScript non andrà più in crash se modifichiamo il JSON.
export type SiteConfig = {
  navigation: { items: NavItem[]; [key: string]: any };
  pricing: { packages: Package[]; [key: string]: any };
  preventivo?: any;
  sections?: any[];
  [key: string]: any; // Sblocca tutto il resto (brand, seo, theme, ecc.)
};

function assert(cond: any, msg: string): asserts cond {
  if (!cond) throw new Error("Config error: " + msg);
}

export function getConfig(): SiteConfig {
  const cfg = raw as any; // Bypassiamo l'errore di lettura iniziale

  assert(cfg.brand?.name, "brand.name missing");
  assert(cfg.brand?.logoPath, "brand.logoPath missing");
  assert(cfg.seo?.title && cfg.seo?.description, "seo missing");
  assert(cfg.theme?.bg && cfg.theme?.text, "theme missing");

  assert(cfg.contacts?.phoneE164 && cfg.contacts?.email, "contacts missing");
  assert(Array.isArray(cfg.sections) && cfg.sections.length > 0, "sections missing");
  assert(Array.isArray(cfg.navigation?.items), "navigation.items missing");
  assert(Array.isArray(cfg.pricing?.packages) && cfg.pricing.packages.length > 0, "pricing.packages missing");

  // Coerenza: pacchetti prezzi univoci e corretti (Setup Base + Mensile)
  const ids = new Set<string>();
  for (const p of cfg.pricing.packages) {
    assert(p.id && p.title, "package id/title missing");
    assert(typeof p.basePrice === "number", `package basePrice not number: ${p.id}`);
    assert(!ids.has(p.id), `duplicate package id: ${p.id}`);
    ids.add(p.id);
  }

  return cfg as SiteConfig;
}

// Compatibilità usata dalle pagine SSR/Statiche
export async function loadSiteConfig(): Promise<SiteConfig> {
  return getConfig();
}