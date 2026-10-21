import { requireStaff } from "@/lib/admin";
import { Card, Flash, PageTitle } from "@/components/admin/AdminUI";
import ServicesBoard from "@/components/admin/ServicesBoard";
import { createService } from "../../actions";

export default async function AdminServices({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { saved, error } = await searchParams;
  const { supabase } = await requireStaff();
  const { data } = await supabase
    .from("services")
    .select("id, slug, title, summary, published, image_url")
    .not("slug", "is", null)
    .order("sort_order");

  return (
    <>
      <PageTitle title="Services" />
      <Flash saved={saved} error={error} />
      <p className="mb-6 max-w-2xl text-steel-text">
        Drag <span className="font-mono">⠿</span> to change the order they appear on the website. Click a service to edit its
        text and photo. Use the green button to show or hide it.
      </p>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <ServicesBoard services={(data ?? []) as never} />
        <Card className="h-fit">
          <h2 className="text-lg font-bold">Add a service</h2>
          <form action={createService} className="mt-4 space-y-4">
            <div>
              <label htmlFor="new-title" className="field-label">
                Service name
              </label>
              <input id="new-title" name="title" required className="input" placeholder="e.g. Steel Gates & Fencing" />
            </div>
            <div>
              <label htmlFor="new-summary" className="field-label">
                One-line description <span className="font-normal text-steel-text">(optional)</span>
              </label>
              <textarea id="new-summary" name="summary" rows={2} className="input" placeholder="What you make, in one sentence" />
            </div>
            <button className="btn btn-primary w-full">Add service</button>
          </form>
          <p className="mt-3 text-xs text-steel-text">New services start hidden, so you can add a photo and details first.</p>
        </Card>
      </div>
    </>
  );
}
