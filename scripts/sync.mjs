#!/usr/bin/env node
// Copies published blog posts out of the Obsidian vault into the Astro content
// collection. Only files under Blog/published are considered, and only those
// whose frontmatter does NOT say status: draft - so a draft can never ship by
// being moved into the wrong folder.
//
// Obsidian-isms are rewritten on the way through:
//   [[note]]        -> note            (plain text; nothing to link to on the site)
//   [[note|label]]  -> label
//   ![[image.png]]  -> dropped with a warning

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.resolve(HERE, "..");
const VAULT_BLOG = path.resolve(SITE, "..", "A4D", "Blog", "published");
const OUT = path.join(SITE, "src", "content", "blog");
const CV_SRC = path.resolve(SITE, "..", "Personal", "cv");
const CV_OUT = path.join(SITE, "src", "content", "cv");
const PDF_SRC = path.resolve(SITE, "..", "Personal", "exports");
const PDF_OUT = path.join(SITE, "public", "cv");

function frontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (kv) out[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

function clean(raw) {
  return raw
    .replace(/!\[\[[^\]]+\]\]/g, (m) => {
      console.warn(`  ! dropped embed ${m}`);
      return "";
    })
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1");
}

// ponytail: on CI the vault is not checked out, so the committed copy under
// src/content is the source. Only wipe and refill it when the vault is there.
const haveVault = fs.existsSync(VAULT_BLOG);
if (!haveVault) {
  console.warn(`sync: ${VAULT_BLOG} not found - keeping the committed content as-is`);
}

fs.mkdirSync(OUT, { recursive: true });
if (haveVault) {
  for (const f of fs.readdirSync(OUT).filter((f) => f.endsWith(".md"))) {
    fs.rmSync(path.join(OUT, f));
  }
}

let copied = 0;
let skipped = 0;
for (const file of haveVault ? fs.readdirSync(VAULT_BLOG).filter((f) => f.endsWith(".md")) : []) {
  const raw = fs.readFileSync(path.join(VAULT_BLOG, file), "utf8");
  const fm = frontmatter(raw);
  if ((fm.status || "").toLowerCase() === "draft") {
    console.log(`  - skipped ${file} (status: draft)`);
    skipped++;
    continue;
  }
  if (!fm.title || !fm.date) {
    console.log(`  - skipped ${file} (needs title and date in frontmatter)`);
    skipped++;
    continue;
  }
  fs.writeFileSync(path.join(OUT, file), clean(raw));
  console.log(`  + ${file}`);
  copied++;
}
console.log(`blog: ${copied} copied, ${skipped} skipped`);

// --- CV: markdown for the web page, PDFs for the download links ---
fs.mkdirSync(CV_OUT, { recursive: true });
fs.mkdirSync(PDF_OUT, { recursive: true });

if (fs.existsSync(CV_SRC)) {
  for (const f of fs.readdirSync(CV_SRC).filter((f) => f.endsWith(".md"))) {
    fs.copyFileSync(path.join(CV_SRC, f), path.join(CV_OUT, f));
    console.log(`  + cv/${f}`);
  }
} else {
  console.warn(`sync: ${CV_SRC} not found - keeping the committed CV as-is`);
}

// The .html exports are the same document as the .pdf, and are what the CV page
// embeds; the .pdf is the download.
if (fs.existsSync(PDF_SRC)) {
  for (const f of fs.readdirSync(PDF_SRC).filter((f) => /\.(pdf|html)$/.test(f))) {
    fs.copyFileSync(path.join(PDF_SRC, f), path.join(PDF_OUT, f));
    console.log(`  + public/cv/${f}`);
  }
}
