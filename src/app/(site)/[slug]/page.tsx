import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCustomPages, getLayout } from "@/lib/content";
import PageLayout from "@/components/blocks/PageLayout";

// Pages created in Admin → Page builder → Add a page, at /<slug>.
export const revalidate = 60;

async function find(slug: string) {
  return (await getCustomPages()).find((p) => p.slug === slug) ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = await find((await params).slug);
  if (!page) return {};
  return { title: page.title, description: page.description || undefined, alternates: { canonical: `/${page.slug}` } };
}

export default async function CustomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await find(slug);
  if (!page) notFound();
  const layout = await getLayout(`c:${slug}`);
  return <PageLayout page={`c:${slug}`} blocks={layout?.blocks ?? []} />;
}
