import { defineConfig } from "astro/config";

// User site at the domain root. CI sets GITHUB_USER from the repo owner; the
// fallback is what local builds use. It has to be the real account, because a
// canonical URL pointing at the wrong host is worse than none at all.
const user = process.env.GITHUB_USER ?? "aminalali8";

export default defineConfig({
  site: `https://${user}.github.io`,
  markdown: {
    shikiConfig: { theme: "github-dark-dimmed", wrap: true },
  },
});
