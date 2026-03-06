import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://weboracode.com",
  output: "static",
  adapter: cloudflare(),
  integrations: [sitemap()],
});