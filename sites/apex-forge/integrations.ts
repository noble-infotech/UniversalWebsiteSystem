import type { SiteConfigInput } from "@/core/config/schema";

export const integrations: SiteConfigInput["integrations"] = {
  analytics: { googleAnalyticsId: undefined, metaPixelId: undefined, conversionEvents: true },
  whatsapp: { enabled: true, number: "+912040001994", message: "Hello {brand}, I'd like to discuss an RFQ.", position: "right" },
  clickToCall: { enabled: true },
  liveChat: { provider: "none" },
  forms: { provider: "console", notifyEmail: "sales@apexforge.example" },
  socialShare: { enabled: true, networks: ["linkedin", "x", "email", "copy"] },
};
