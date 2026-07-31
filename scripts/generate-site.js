#!/usr/bin/env node
/**
 * Generate the site's listing pages from data/tools.json and data/products.json.
 *
 * Single source of truth for tools/products:
 *   - data/tools.json     -> index.html (TOOL_GROUPS) + tools/index.html (cards)
 *   - data/products.json  -> index.html (PRODUCTS) + product/index.html (cards)
 *
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
// tools page lists cards in code order (TIME / 01 …); JSON array keeps homepage group order
const byCode = (a, b) => Number(a.code.match(/\d+$/)[0]) - Number(b.code.match(/\d+$/)[0]);

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
  const items = toolsList.filter(t => t.group === g).map(t => `['${t.name}','${rel(t.href, "")}']`);
  return `['${g}',[${items.join(",")}]]`;
});

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
patch("index.html", [
  [/^const PRODUCTS=.*;$/m, () => `const PRODUCTS=[${products.map(productEntry).join(",")}];`, "const PRODUCTS"],
  [/^const TOOL_GROUPS=.*;$/m, () => `const TOOL_GROUPS=[${toolGroups.join(",")}];`, "const TOOL_GROUPS"],
  [/<span>(\d+) tools<\/span>/, () => `<span>${toolsList.length} tools</span>`, "tools count"],
  [/<span>(\d+) projects<\/span>/, () => `<span>${products.length} projects</span>`, "projects count"],
]);

// tools/index.html — card grid + counts
const toolCard = (t) =>
  `<a class="tool-card${t.wide ? " tool-card--wide" : ""}" href="${rel(t.href, "tools")}">` +
  `<span class="tool-code">${t.code}</span><h3>${t.name}</h3><p>${t.desc}</p>` +
  `<span class="tool-open">OPEN TOOL ↗</span></a>`;

patch("tools/index.html", [
  [/(<div class="tool-grid">)[\s\S]*?(<\/div><\/section>)/, (_, a, b) => `${a}${[...toolsList].sort(byCode).map(toolCard).join("")}${b}`, "tool grid"],
  [/<span>(\d+) ENTRIES<\/span>/, () => `<span>${toolsList.length} ENTRIES</span>`, "ENTRIES count"],
  [/TOOLBOX \/ \d+/, () => `TOOLBOX / ${toolsList.length}`, "TOOLBOX count"],
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

console.log(`[generate-site] OK — ${toolsList.length} tools, ${products.length} products (${portalProducts.length} on product portal)`);
