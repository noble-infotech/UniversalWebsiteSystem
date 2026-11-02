import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSite } from "@/core/config/loader";
import { buildMetadata, absoluteUrl } from "@/core/seo/metadata";
import { articleLd } from "@/core/seo/jsonld";
import { isEnabled } from "@/core/config/features";
import { formatDate } from "@/core/commerce/format";
import { Breadcrumbs, Container, JsonLd, RichText } from "@/components/ui/primitives";
import { SmartImage } from "@/components/ui/SmartImage";
import { PostCard } from "@/components/sections/content";
import { ShareButtons } from "@/components/engagement/ShareButtons";
import { NewsletterForm } from "@/components/forms/SmartForm";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const site = await getSite();
  const { slug } = await params;
  const p = site.content.posts.find((x) => x.slug === slug);
  if (!p) return {};
  return buildMetadata(site, { title: p.title, description: p.excerpt, seo: p.seo, image: p.cover, path: `/blog/${p.slug}`, type: "article" });
}

export default async function PostPage({ params }: Props) {
  const site = await getSite();
  const { slug } = await params;
  const p = site.content.posts.find((x) => x.slug === slug);
  if (!p || !isEnabled(site, "blog")) notFound();
  const more = site.content.posts.filter((x) => x.slug !== p.slug).slice(0, 3);
  return (
    <article>
      <JsonLd data={articleLd(site, p)} />
      <Container narrow className="pt-12 md:pt-16">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: p.title }]} className="mb-8 text-muted-foreground" />
        {p.category && <p className="eyebrow">{p.category}</p>}
        <h1 className="mt-4 text-4xl md:text-5xl">{p.title}</h1>
        <p className="mt-5 text-lg text-muted-foreground">{p.excerpt}</p>
        <p className="mt-6 text-sm text-muted-foreground">{[p.author, formatDate(p.date, site.commerce.locale)].filter(Boolean).join(" · ")}</p>
      </Container>
      {p.cover && <Container className="mt-10"><div className="relative aspect-[21/9] overflow-hidden img-brand"><SmartImage src={p.cover} alt={p.title} fill priority className="object-cover" sizes="100vw" /></div></Container>}
      <Container narrow className="py-12 md:py-16">
        <RichText text={p.body} className="text-lg" />
        {p.tags.length > 0 && <p className="mt-10 flex flex-wrap gap-2">{p.tags.map((t) => <span key={t} className="rounded-full bg-muted px-3 py-1 text-xs">#{t}</span>)}</p>}
        <div className="mt-10 border-t border-border pt-8">{site.integrations.socialShare.enabled && <ShareButtons url={absoluteUrl(site, `/blog/${p.slug}`)} title={p.title} networks={site.integrations.socialShare.networks} />}</div>
        {isEnabled(site, "newsletter") && (
          <div className="mt-12 rounded-brand bg-muted p-8">
            <h2 className="text-2xl">Enjoyed this article?</h2>
            <p className="mt-2 mb-5 text-muted-foreground">Get new insights delivered to your inbox.</p>
            <NewsletterForm />
          </div>
        )}
      </Container>
      {more.length > 0 && (
        <Container className="pb-20">
          <h2 className="mb-8 text-2xl md:text-3xl">More articles</h2>
          <div className="grid gap-8 md:grid-cols-3">{more.map((m) => <PostCard key={m.slug} post={m} site={site} />)}</div>
        </Container>
      )}
    </article>
  );
}
