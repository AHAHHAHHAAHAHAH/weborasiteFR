import raw from "../data/site.json";

type NavItem = { id: string; label: string };
type Package = { 
  id: string; 
  title: string; 
  basePrice: number; 
  monthlyPrices?: Record<string, number> 
};

export type SiteConfig = typeof raw & {
  navigation: { items: NavItem[] };
  pricing: { packages: Package[] };
};

function assert(cond: any, msg: string): asserts cond {
  if (!cond) throw new Error("Config error: " + msg);
}

export function getConfig(): SiteConfig {
  const cfg = raw as SiteConfig;

  assert(cfg.brand?.name, "brand.name missing");
  assert(cfg.brand?.logoPath, "brand.logoPath missing");
  assert(cfg.seo?.title && cfg.seo?.description, "seo missing");
  assert(cfg.theme?.bg && cfg.theme?.text, "theme missing");

  assert(cfg.contacts?.phoneE164 && cfg.contacts?.email, "contacts missing");
  assert(Array.isArray(cfg.sections) && cfg.sections.length > 0, "sections missing");
  assert(Array.isArray(cfg.navigation?.items), "navigation.items missing");
  assert(Array.isArray(cfg.pricing?.packages) && cfg.pricing.packages.length > 0, "pricing.packages missing");

  /* * HO RIMOSSO LA VECCHIA REGOLA:
   * Prima controllavamo che ogni link del menu fosse una sezione.
   * Ora non serve più, perché i link (es. 'prezzi-lavori') sono Pagine Fisiche di Astro.
   */

  // Coerenza: pacchetti prezzi univoci e corretti (Setup Base + Mensile)
  const ids = new Set<string>();
  for (const p of cfg.pricing.packages as any[]) {
    assert(p.id && p.title, "package id/title missing");
    assert(typeof p.basePrice === "number", `package basePrice not number: ${p.id}`);
    assert(!ids.has(p.id), `duplicate package id: ${p.id}`);
    ids.add(p.id);
  }

  return cfg;
}

// Compatibilità usata dalle pagine SSR/Statiche
export async function loadSiteConfig(): Promise<SiteConfig> {
  return getConfig();
}