/**
 * SECTION REGISTRY
 * Maps every config `type` to a component. To add a new section type:
 *   1. add the type name to SectionTypes in core/config/schema.ts
 *   2. build the component (props: { section, site })
 *   3. register it here
 */
import type { ComponentType } from "react";
import type { SectionConfig, SectionType, SiteConfig } from "@/core/config/schema";
import { isEnabled } from "@/core/config/features";
import type { SectionProps } from "./types";
import * as B from "./brand";
import * as S from "./showcase";
import * as C from "./content";

export const sectionRegistry: Record<SectionType, ComponentType<SectionProps>> = {
  hero: B.HeroSection,
  about: B.AboutSection,
  visionMission: B.VisionMissionSection,
  story: B.StorySection,
  whatWeDo: B.WhatWeDoSection,
  productsServices: S.ProductsServicesSection,
  productCategories: S.ProductCategoriesSection,
  whyChooseUs: B.WhyChooseUsSection,
  achievements: B.AchievementsSection,
  stats: B.StatsSection,
  team: B.TeamSection,
  infrastructure: B.InfrastructureSection,
  process: B.ProcessSection,
  gallery: S.GallerySection,
  projects: S.ProjectsSection,
  clients: S.ClientsSection,
  testimonials: S.TestimonialsSection,
  reviews: S.ReviewsSection,
  faq: C.FaqSection,
  blog: C.BlogSection,
  events: C.EventsSection,
  offers: C.OffersSection,
  partners: S.PartnersSection,
  newsletter: C.NewsletterSection,
  contact: C.ContactSection,
  shop: C.ShopSection,
  richText: C.RichTextSection,
  ctaBanner: C.CtaBannerSection,
  careers: C.CareersSection,
  quoteForm: C.QuoteFormSection,
  serviceList: S.ServiceListSection,
  pricing: S.PricingSection,
};

/** Sections that depend on a feature flag are skipped automatically when it's off. */
const requires: Partial<Record<SectionType, Parameters<typeof isEnabled>[1]>> = {
  shop: "shop",
  blog: "blog",
  careers: "careers",
  quoteForm: "quote",
  newsletter: "newsletter",
  serviceList: "services",
};

export function SectionRenderer({ sections, site }: { sections: SectionConfig[]; site: SiteConfig }) {
  return (
    <>
      {sections.map((section) => {
        if (!section.enabled) return null;
        const flag = requires[section.type];
        if (flag && !isEnabled(site, flag)) return null;
        if ((section.type === "productsServices" && section.source !== "services") || (section.type === "productCategories" && section.source !== "services"))
          if (!isEnabled(site, "catalog") || site.catalog.products.length === 0) return null;
        const Component = sectionRegistry[section.type];
        if (!Component) {
          if (process.env.NODE_ENV !== "production") return <div key={section.id} className="container-brand py-8 text-danger">Unknown section type “{section.type}”</div>;
          return null;
        }
        return <Component key={section.id} section={section} site={site} />;
      })}
    </>
  );
}
