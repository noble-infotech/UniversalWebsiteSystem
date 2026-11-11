// Cloudflare (OpenNext) adapter configuration.
// Every page is rendered per request (it depends on the site / admin session), so no
// incremental cache (R2) or image binding is needed – nothing extra to create per customer.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({});
