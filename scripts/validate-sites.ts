/**
 * npm run validate:sites
 * Validates every registered site config (schema + cross-references). Exits 1 on errors.
 */
import { siteRegistry } from "../sites/index";
import { validateSite } from "../src/core/config/validate";

let failed = false;
for (const [id, raw] of Object.entries(siteRegistry)) {
  const { issues } = validateSite(raw);
  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");
  console.log(`${errors.length ? "✗" : "✓"} ${id}  (${errors.length} errors, ${warnings.length} warnings)`);
  for (const i of issues) console.log(`   ${i.level === "error" ? "ERROR" : "warn "} ${i.path}: ${i.message}`);
  if (errors.length) failed = true;
}
process.exit(failed ? 1 : 0);
