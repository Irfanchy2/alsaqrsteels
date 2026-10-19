import Link from "next/link";
import { Field } from "@/components/admin/AdminUI";
import MediaUpload from "@/components/admin/MediaUpload";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { saveBlogPost } from "@/app/admin/actions";

export type BlogRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  tags: string | null;
  author: string | null;
  meta_title: string | null;
  meta_description: string | null;
  status: string;
  published_at: string | null;
};

export default function BlogForm({ post }: { post?: BlogRow }) {
  const date = post?.published_at ? post.published_at.slice(0, 10) : "";
  return (
    <form action={saveBlogPost} className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}
      <div className="min-w-0 space-y-5">
        <Field label="Title" name="title" defaultValue={post?.title} required />
        <Field
          label="Summary"
          name="excerpt"
          defaultValue={post?.excerpt}
          textarea
          rows={2}
          hint="One or two sentences shown on the blog list and in search results."
        />
        <div>
          <p className="field-label">Article</p>
          <RichTextEditor name="content" defaultValue={post?.content ?? "<p></p>"} />
          <span className="field-hint">
            Keep to general, accurate information. Don&rsquo;t promise prices, delivery times or certificates we don&rsquo;t hold.
          </span>
        </div>
      </div>

      <div className="space-y-5 xl:sticky xl:top-6 xl:self-start">
        <div className="border border-line bg-card p-5">
          <label htmlFor="f-status" className="field-label">
            Status
          </label>
          <select id="f-status" name="status" defaultValue={post?.status ?? "draft"} className="input">
            <option value="draft">Draft — not on the website</option>
            <option value="published">Published — live on the website</option>
          </select>
          <div className="mt-4">
            <Field label="Publish date" name="published_at" type="date" defaultValue={date} hint="Leave empty to use today." />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="btn btn-primary btn-sm flex-1">Save</button>
            {post?.status === "published" ? (
              <Link href={`/blog/${post.slug}`} target="_blank" className="btn btn-secondary btn-sm">
                View ↗
              </Link>
            ) : null}
          </div>
        </div>

        <div className="border border-line bg-card p-5">
          <p className="field-label">Cover image</p>
          <MediaUpload name="image" folder="blog" defaultUrl={post?.featured_image} label="Upload image" maxMb={8} />
          <span className="field-hint">Landscape photo, at least 1600 px wide. Only our own photos.</span>
        </div>

        <div className="space-y-4 border border-line bg-card p-5">
          <Field label="Tags" name="tags" defaultValue={post?.tags} hint="Comma separated, e.g. Welding, Inspection" />
          <Field label="Author" name="author" defaultValue={post?.author} />
          <Field label="Web address (slug)" name="slug" defaultValue={post?.slug} hint="Made from the title if left empty." />
        </div>

        <details className="border border-line bg-card p-5">
          <summary className="cursor-pointer font-semibold">Search engine settings</summary>
          <div className="mt-4 space-y-4">
            <Field label="SEO title" name="meta_title" defaultValue={post?.meta_title} hint="Up to 60 characters." />
            <Field label="SEO description" name="meta_description" defaultValue={post?.meta_description} textarea rows={3} hint="Up to 160 characters." />
          </div>
        </details>

        {post ? (
          <label className="flex items-center gap-2 border border-danger/40 bg-danger-bg px-4 py-3 text-sm">
            <input type="checkbox" name="delete" className="h-4 w-4" /> Delete this post when I press Save
          </label>
        ) : null}
      </div>
    </form>
  );
}
