import type { SiteConfigInput } from "@/core/config/schema";

export const integrations: SiteConfigInput["integrations"] = {
  analytics: { conversionEvents: true },
  liveChat: { provider: "none" },
  forms: { provider: "console", notifyEmail: "hello@northstar.example" },
  clickToCall: { enabled: true },
  socialShare: { enabled: true, networks: ["linkedin", "x", "email", "copy"] },
};
