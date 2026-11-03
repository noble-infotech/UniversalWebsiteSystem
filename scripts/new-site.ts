/**
 * Scaffold a new company site from an existing one.
 *   npm run new-site -- <new-id> [--from <existing-id>]
 * Copies sites/<from> → sites/<new-id>, rewrites the id, copies brand assets and
 * registers the site in sites/index.ts. Then edit the new folder's config files.
 */
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const id = args[0];
const fromIdx = args.indexOf("--from");
const from = fromIdx >= 0 ? args[fromIdx + 1] : "northstar-advisory";
if (!id || !/^[a-z0-9-]+$/.test(id)) {
  console.error("Usage: npm run new-site -- <new-id> [--from <existing-id>]   (id: lowercase letters, digits, dashes)");
  process.exit(1);
}
const root = path.resolve(__dirname, "..");
const src = path.join(root, "sites", from);
const dest = path.join(root, "sites", id);
if (!fs.existsSync(src)) throw new Error(`Source site "${from}" not found`);
if (fs.existsSync(dest)) throw new Error(`sites/${id} already exists`);

fs.cpSync(src, dest, { recursive: true });
const indexFile = path.join(dest, "index.ts");
fs.writeFileSync(indexFile, fs.readFileSync(indexFile, "utf8").replace(new RegExp(`id: "${from}"`), `id: "${id}"`));
for (const f of fs.readdirSync(dest)) {
  const p = path.join(dest, f);
  fs.writeFileSync(p, fs.readFileSync(p, "utf8").replaceAll(`/sites/${from}/`, `/sites/${id}/`));
}
const assetsFrom = path.join(root, "public", "sites", from);
if (fs.existsSync(assetsFrom)) fs.cpSync(assetsFrom, path.join(root, "public", "sites", id), { recursive: true });

const camel = id.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase()).replace(/^[0-9]/, "_$&");
const registry = path.join(root, "sites", "index.ts");
let reg = fs.readFileSync(registry, "utf8");
reg = reg.replace(/(import [^\n]+ from "\.\/[^"]+";\n)(?!import)/, `$1import ${camel} from "./${id}";\n`);
reg = reg.replace(/(export const siteRegistry[^{]+\{\n)/, `$1  [${camel}.id]: ${camel},\n`);
fs.writeFileSync(registry, reg);

console.log(`✓ Created sites/${id} (copied from ${from}) and registered it in sites/index.ts.
Next steps:
  1. Edit sites/${id}/company.ts, theme.ts, home.ts, pages.ts, … (see docs/CUSTOMIZATION.md)
  2. Replace brand assets in public/sites/${id}/
  3. npm run validate:sites
  4. SITE_ID=${id} npm run dev`);
