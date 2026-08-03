#!/usr/bin/env node
/**
 * Generate the site's listing pages from data/tools.json and data/products.json.
 *
 * Single source of truth for tools/products:
 *   - data/tools.json     -> index.html (TOOL_GROUPS) + tools/index.html (cards)
 *   - data/products.json  -> index.html (PRODUCTS) + product/index.html (cards)
 *
 * Also emits the main-site sitemap (sitemap-main.xml) and the sitemap index
 * (sitemap-index.xml) referencing it plus the Astro-built blog sitemap.
 * Deterministic: same data in, same HTML out. Run locally before committing,
 * and again in CI before assembling the deployment.
 *
 * All emitted hrefs are relative to the target page (absolute /xxx paths break
 * under file://, resolving to the drive root). Directory-style URLs get an
 * explicit index.html so file:// opens the page instead of a directory listing.
 */
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");

const tools = JSON.parse(fs.readFileSync(path.join(ROOT, "data/tools.json"), "utf8"));
const products = JSON.parse(fs.readFileSync(path.join(ROOT, "data/products.json"), "utf8"));

const toolsList = tools.tools;
const portalProducts = products.filter(p => p.portal);
const coreProducts = products.filter(p => p.core);
const buildingProducts = products.filter(p => !p.core);
// tools page lists cards in code order (TIME / 01 …); JSON array keeps homepage group order
const byCode = (a, b) => Number(a.code.match(/\d+$/)[0]) - Number(b.code.match(/\d+$/)[0]);

// tools/ 目录扫描：data/tools.json 未登记的新 .html 自动归入 Others 组
const toolFiles = fs.readdirSync(path.join(ROOT, "tools")).filter(f => /\.html$/.test(f) && f !== "index.html");
const knownHrefs = new Set(toolsList.map(t => t.href));
const autoTools = [];
for (const f of toolFiles) {
  const href = "/tools/" + f;
  if (knownHrefs.has(href)) continue;
  const slug = f.replace(/\.html$/, "");
  const name = slug.split(/[-_]/).map(w => (w ? w[0].toUpperCase() + w.slice(1) : w)).join(" ");
  autoTools.push({
    name,
    href,
    code: `OTHER / ${String(toolsList.length + autoTools.length + 1).padStart(2, "0")}`,
    desc: "A tool hosted on this site.",
    group: "Others"
  });
}
const mergedTools = [...toolsList, ...autoTools];

// 站内绝对路径 → 相对路径；目录型 URL 补 index.html
const rel = (abs, prefix) => {
  let p = prefix && abs.startsWith("/" + prefix) ? abs.slice(prefix.length + 2) : abs.replace(/^\//, "");
  if (p.endsWith("/")) p += "index.html";
  return p;
};

// ---- serializers -----------------------------------------------------------

const js = (v) => JSON.stringify(v).replace(/"/g, "'");

const productEntry = (p) => {
  const links = p.links.map(l => `['${l.short}','${rel(l.href, "")}','${l.type === "github" ? "github" : "doc"}']`);
  return `{n:${js(p.name)},d:${js(p.desc)},l:[${links.join(",")}]}`;
};

const toolGroups = tools.groups.map(g => {
  const items = mergedTools.filter(t => t.group === g).map(t => `['${t.name}','${rel(t.href, "")}']`);
  return `['${g}',[${items.join(",")}]]`;
});
if (autoTools.length) toolGroups.push(`['Others',[${autoTools.map(t => `['${t.name}','${rel(t.href, "")}']`).join(",")}]]`);

// ---- blog sync: 从 _blog 源文件提取文章列表（构建时自动更新首页 BLOG 列表）----
const POSTS_DIR = path.join(ROOT, "_blog/src/content/posts");
const blogEntries = [];
if (fs.existsSync(POSTS_DIR)) {
  const posts = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith(".md")).map(f => {
    const raw = fs.readFileSync(path.join(POSTS_DIR, f), "utf8");
    const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const kv = {};
    if (fm) for (const line of fm[1].split(/\r?\n/)) {
      const m = line.match(/^(\w+):\s*(.*)$/);
      if (m) kv[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, "");
    }
    return { title: kv.title || f.replace(/\.md$/, ""), date: kv.pubDatetime || kv.date || "", slug: kv.slug || f.replace(/\.md$/, ""), draft: kv.draft === "true" };
  }).filter(p => !p.draft && p.title)
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .map(p => `['${p.title.replace(/[\\']/g, "\\$&")}','${p.slug}']`);
  blogEntries.push(...posts);
}

// ---- page transforms ---------------------------------------------------------

const patch = (file, rules) => {
  const f = path.join(ROOT, file);
  let t = fs.readFileSync(f, "utf8");
  for (const [pattern, replacer, what] of rules) {
    if (!pattern.test(t)) {
      console.error(`[generate-site] FAILED: ${what} not found in ${file}`);
      process.exit(1);
    }
    t = t.replace(pattern, replacer);
  }
  fs.writeFileSync(f, t);
};

// index.html — data consts + section counts
const indexRules = [
  [/^\s*const PRODUCTS\s*=.*;$/m, () => `    const PRODUCTS = [${products.map(productEntry).join(",")}];`, "const PRODUCTS"],
  [/^\s*const TOOL_GROUPS\s*=.*;$/m, () => `    const TOOL_GROUPS = [${toolGroups.join(",")}];`, "const TOOL_GROUPS"],
  ...(blogEntries.length ? [[/^\s*const BLOG\s*=.*;$/m, () => `    const BLOG = [${blogEntries.join(",")}];`, "const BLOG"]] : []),
  [/<span>(\d+) tools<\/span>/, () => `<span>${mergedTools.length} tools</span>`, "tools count"],
  [/<span>(\d+) products<\/span>/, () => `<span>${coreProducts.length} products</span>`, "products count"],
  [/<span>(\d+) projects<\/span>/, () => `<span>${buildingProducts.length} projects</span>`, "projects count"],
];
patch("index.html", indexRules);

// tools/index.html — card grid + counts
const toolCard = (t) =>
  `<a class="tool-card${t.wide ? " tool-card--wide" : ""}" href="${rel(t.href, "tools")}">` +
  `<span class="tool-code">${t.code}</span><h3>${t.name}</h3><p>${t.desc}</p>` +
  `<span class="tool-open">OPEN TOOL ↗</span></a>`;

patch("tools/index.html", [
  [/(<div class="tool-grid">)[\s\S]*?(<\/div><\/section>)/, (_, a, b) => `${a}${[...mergedTools].sort(byCode).map(toolCard).join("")}${b}`, "tool grid"],
  [/<span>(\d+) ENTRIES<\/span>/, () => `<span>${mergedTools.length} ENTRIES</span>`, "ENTRIES count"],
  [/TOOLBOX \/ \d+/, () => `TOOLBOX / ${mergedTools.length}`, "TOOLBOX count"],
]);

// product/index.html — card grid + count
const productCard = (p) => {
  const links = p.links.map(l => {
    const ext = l.href.startsWith("http") ? ' target="_blank" rel="noopener"' : "";
    const cls = l.type === "primary" ? "action primary" : "action";
    return `<a class="${cls}" href="${rel(l.href, "product")}"${ext}>${l.label}</a>`;
  }).join("");
  return (
    `<article class="product-card${p.wide ? " product-card--wide" : ""}">` +
    `<div><span class="product-index">${p.index}</span><h3>${p.name}</h3><p>${p.desc}</p></div>` +
    `<div><div class="product-links">${links}</div>` +
    `<div class="product-state">${p.state}</div></div></article>`
  );
};

patch("product/index.html", [
  [/(<div class="product-grid">)[\s\S]*?(<\/div><\/section>)/, (_, a, b) => `${a}${portalProducts.map(productCard).join("")}${b}`, "product grid"],
  [/<span>(\d+) PROJECTS<\/span>/, () => `<span>${String(portalProducts.length).padStart(2, "0")} PROJECTS</span>`, "PROJECTS count"],
]);

// ---- sitemaps ----------------------------------------------------------------

const SITE = "https://acidev.cc";
// Indexable main-site URLs. Excluded: meta-refresh redirect pages
// (product/*/index.html), noindexed experiments, and tools/claude/ exports.
const mainUrls = [
  "/",
  "/tools/",
  ...toolsList.map(t => t.href),
  "/product/",
  "/product/volante/landing/",
  "/product/techne/landing/",
  "/product/techne/doc/",
  "/docs/",
  "/graphify-out/graph.html",
];

const xml = (tag, urls) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<${tag} xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(u => `  <url><loc>${SITE}${u}</loc></url>`).join("\n") +
  `\n</${tag}>\n`;

fs.writeFileSync(path.join(ROOT, "sitemap-main.xml"), xml("urlset", mainUrls));
const indexXml =
  `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  `  <sitemap><loc>${SITE}/sitemap-main.xml</loc></sitemap>\n` +
  `  <sitemap><loc>${SITE}/blog/sitemap-0.xml</loc></sitemap>\n</sitemapindex>\n`;
// sitemap.xml is an alias of the index: the most commonly guessed sitemap URL
// (and what some tools/plugins submit) must resolve instead of 404.
fs.writeFileSync(path.join(ROOT, "sitemap-index.xml"), indexXml);
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), indexXml);

console.log(`[generate-site] OK — ${toolsList.length} tools, ${products.length} products (${portalProducts.length} on product portal), sitemaps written`);
