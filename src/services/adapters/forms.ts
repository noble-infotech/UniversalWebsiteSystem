import type { FormHandler } from "../types";

const id = () => `SUB-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

/** Development handler: logs submissions on the server. Nothing is emailed or stored. */
export const consoleForms: FormHandler = {
  id: "console",
  async submit(form, data, meta) {
    const ref = id();
    console.info(`[forms] ${meta.site.id}/${form} ${ref}`, JSON.stringify(data));
    return { id: ref };
  },
};

/** POSTs JSON to a webhook (Zapier, Make, n8n, Slack, CRM endpoint…). */
export function webhookForms(url: string): FormHandler {
  return {
    id: "webhook",
    async submit(form, data, meta) {
      const ref = id();
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: ref, form, site: meta.site.id, company: meta.site.company.name, notifyEmail: meta.site.integrations.forms.notifyEmail, page: meta.page, submittedAt: new Date().toISOString(), data }),
      });
      if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
      return { id: ref };
    },
  };
}
