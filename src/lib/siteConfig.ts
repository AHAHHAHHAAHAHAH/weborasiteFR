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

  // coerenza: nav id devono esistere nelle sections
  const sectionIds = new Set(cfg.sections.map(s => s.id));
  for (const it of cfg.navigation.items) {
    assert(sectionIds.has(it.id), `nav item '${it.id}' not found in sections`);
  }

  // coerenza: package ids univoci (Aggiornato per supportare il nuovo sistema Base + Mensile)
  const ids = new Set<string>();
  for (const p of cfg.pricing.packages as any[]) {
    assert(p.id && p.title, "package id/title missing");
    assert(typeof p.basePrice === "number", `package basePrice not number: ${p.id}`);
    assert(!ids.has(p.id), `duplicate package id: ${p.id}`);
    ids.add(p.id);
  }

  return cfg;
}

// compat: usata dalle pagine/SSR (stessa config, stessa validazione)
export async function loadSiteConfig(): Promise<SiteConfig> {
  return getConfig();
}