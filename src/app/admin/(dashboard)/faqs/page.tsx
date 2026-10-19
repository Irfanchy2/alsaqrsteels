import { requireStaff } from "@/lib/admin";
import { Card, Flash, PageTitle } from "@/components/admin/AdminUI";
import { saveFaq } from "../../actions";

type Faq = { id: string; scope: string; question: string; answer: string; sort_order: number; published: boolean };

function FaqForm({ faq, scopes }: { faq?: Faq; scopes: { value: string; label: string }[] }) {
  return (
    <form action={saveFaq} className="space-y-3">
      {faq ? <input type="hidden" name="id" value={faq.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-[1fr_12rem_6rem]">
        <input name="question" defaultValue={faq?.question} placeholder="Question" className="input !min-h-10 !py-2" aria-label="Question" required />
        <select name="scope" defaultValue={faq?.scope ?? "general"} className="input !min-h-10 !py-2" aria-label="Shown on">
          {scopes.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <input name="sort_order" type="number" defaultValue={faq?.sort_order ?? 0} className="input !min-h-10 !py-2" aria-label="Order" />
      </div>
      <textarea name="answer" defaultValue={faq?.answer} rows={3} className="input !min-h-20" placeholder="Answer" aria-label="Answer" required />
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="published" defaultChecked={faq?.published ?? true} className="h-4 w-4" /> Published
        </label>
        {faq ? (
          <label className="flex items-center gap-2">
            <input type="checkbox" name="delete" className="h-4 w-4" /> Delete
          </label>
        ) : null}
        <button className="btn btn-secondary btn-sm">{faq ? "Save" : "Add question"}</button>
      </div>
    </form>
  );
}

export default async function AdminFaqs({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { saved, error } = await searchParams;
  const { supabase } = await requireStaff();
  const [{ data: faqs }, { data: services }] = await Promise.all([
    supabase.from("faqs").select("*").order("scope").order("sort_order"),
    supabase.from("services").select("slug, title").not("slug", "is", null).order("sort_order"),
  ]);
  const scopes = [
    { value: "general", label: "Home & services pages" },
    { value: "quote", label: "Quote & contact pages" },
    ...(services ?? []).map((s) => ({ value: s.slug as string, label: `Service: ${s.title}` })),
  ];
  return (
    <>
      <PageTitle title="FAQs" />
      <Flash saved={saved} error={error} />
      <p className="mb-6 max-w-3xl text-sm text-steel-text">
        Answers are also used by the AI Project Assistant. Avoid promises on price, delivery time or engineering outcomes.
      </p>
      <Card className="mb-8">
        <h2 className="mb-4 text-lg font-bold">Add a question</h2>
        <FaqForm scopes={scopes} />
      </Card>
      <ul className="space-y-4">
        {((faqs ?? []) as Faq[]).map((f) => (
          <li key={f.id}>
            <Card>
              <FaqForm faq={f} scopes={scopes} />
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
