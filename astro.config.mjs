import { defineConfig } from "astro/config";

// User site at the domain root. Set GITHUB_USER (or edit the fallback below)
// before the first deploy - it is what makes og:image and the RSS feed absolute.
const user = process.env.GITHUB_USER ?? "username";

export default defineConfig({
  site: `https://${user}.github.io`,
  markdown: {
    shikiConfig: { theme: "github-dark-dimmed", wrap: true },
  },
});
