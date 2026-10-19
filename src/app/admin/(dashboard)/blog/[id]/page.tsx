import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/admin";
import { Flash, PageTitle } from "@/components/admin/AdminUI";
import BlogForm, { type BlogRow } from "@/components/admin/BlogForm";

export default async function EditBlogPost({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const [{ id }, { saved, error }] = await Promise.all([params, searchParams]);
  if (id === "new") {
    return (
      <>
        <PageTitle title="New post" back={{ href: "/admin/blog", label: "Blog posts" }} />
        <Flash saved={saved} error={error} />
        <BlogForm />
      </>
    );
  }
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireStaff();
  const { data } = await supabase.from("blog_posts").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <>
      <PageTitle title="Edit post" back={{ href: "/admin/blog", label: "Blog posts" }} />
      <Flash saved={saved} error={error} />
      <BlogForm post={data as BlogRow} />
    </>
  );
}
