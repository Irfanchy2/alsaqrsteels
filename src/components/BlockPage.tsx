import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/data";
import Block from "@/components/BlockRenderer";
import Reveal from "@/components/motion/Reveal";

export default async function BlockPage({ slug }: { slug: string }) {
  const result = await getPageBySlug(slug);
  if (!result) notFound();
  const { blocks } = result;
  return (
    <>
      {blocks.map((b, i) => (
        // The hero block (first, i === 0) animates immediately on load like
        // the homepage hero; later blocks fade up as the visitor scrolls to
        // them, so the whole page never dumps everything in at once.
        <Reveal key={b.id} repeat={false} amount={i === 0 ? 0 : 0.15}>
          <Block block={b} />
        </Reveal>
      ))}
    </>
  );
}

export async function getBlockPageMetadata(slug: string) {
  const result = await getPageBySlug(slug);
  if (!result) return {};
  return {
    title: result.page.meta_title || result.page.title,
    description: result.page.meta_description || undefined,
  };
}
