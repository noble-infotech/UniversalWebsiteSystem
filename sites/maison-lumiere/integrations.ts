import type { SiteConfigInput } from "@/core/config/schema";
import { img } from "../_shared/helpers";

export const integrations: SiteConfigInput["integrations"] = {
  analytics: { conversionEvents: true },
  whatsapp: { enabled: false, number: "" },
  liveChat: { provider: "none" },
  forms: { provider: "console" },
  popup: { enabled: true, id: "welcome-2026", title: "Take 10% off your first order", body: "Join our list for early access to new collections. Use code WELCOME10 at checkout.", image: img("photo-1602874801007-bd458bb1b8b6", 900), delaySeconds: 8, frequency: "once", showNewsletter: true },
  socialShare: { enabled: true, networks: ["facebook", "x", "whatsapp", "email", "copy"] },
};
