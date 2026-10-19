import { requireAdmin } from "@/lib/admin";
import { Card, Flash, PageTitle } from "@/components/admin/AdminUI";
import { addStaff, removeStaff, setStaffRole } from "../../actions";

type Member = { user_id: string; email: string; role: "admin" | "staff"; created_at: string };

const ROLE_INFO = {
  admin: "Everything, including Team & roles and Motion & effects.",
  staff: "Pages, projects, services, blog, FAQs, company details, client logos, certificates, documents and enquiries.",
};

export default async function TeamPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { saved, error } = await searchParams;
  const { supabase, user } = await requireAdmin();
  const { data } = await supabase.from("staff").select("user_id, email, role, created_at").order("created_at");
  const team = (data ?? []) as Member[];

  return (
    <>
      <PageTitle title="Team & roles" />
      <Flash saved={saved} error={error} />

      <div className="grid max-w-5xl gap-6 lg:grid-cols-[1fr_20rem]">
        <Card className="!p-0">
          <ul className="divide-y divide-line">
            {team.map((m) => (
              <li key={m.user_id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <span aria-hidden="true" className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-ink font-bold uppercase text-on-ink">
                  {m.email.slice(0, 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {m.email} {m.user_id === user.id ? <span className="text-sm font-normal text-steel-text">(you)</span> : null}
                  </p>
                  <p className="text-xs text-steel-text">Added {new Date(m.created_at).toLocaleDateString("en-GB", { dateStyle: "medium" })}</p>
                </div>
                <form action={setStaffRole} className="flex items-center gap-2">
                  <input type="hidden" name="user_id" value={m.user_id} />
                  <label className="sr-only" htmlFor={`role-${m.user_id}`}>
                    Role
                  </label>
                  <select id={`role-${m.user_id}`} name="role" defaultValue={m.role} className="input !min-h-9 !w-32 !py-1.5 text-sm">
                    <option value="admin">Admin</option>
                    <option value="staff">Editor</option>
                  </select>
                  <button className="btn btn-sm btn-secondary">Update</button>
                </form>
                {m.user_id !== user.id ? (
                  <form action={removeStaff}>
                    <input type="hidden" name="user_id" value={m.user_id} />
                    <button className="btn btn-sm text-danger hover:bg-danger-bg">Remove</button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-bold">Add a team member</h2>
            <form action={addStaff} className="mt-4 space-y-4">
              <div>
                <label htmlFor="new-email" className="field-label">
                  Email they sign in with
                </label>
                <input id="new-email" name="email" type="email" required className="input" placeholder="name@alsaqrsteels.com" />
              </div>
              <div>
                <label htmlFor="new-role" className="field-label">
                  Role
                </label>
                <select id="new-role" name="role" defaultValue="staff" className="input">
                  <option value="staff">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button className="btn btn-primary w-full">Add to team</button>
            </form>
            <p className="mt-4 text-xs text-steel-text">
              The person needs a login first: Supabase → Authentication → Users → Add user (email and password). Then add the
              same email here.
            </p>
          </Card>
          <Card>
            <h2 className="text-lg font-bold">What each role can do</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <div>
                <dt className="font-semibold">Admin</dt>
                <dd className="text-steel-text">{ROLE_INFO.admin}</dd>
              </div>
              <div>
                <dt className="font-semibold">Editor</dt>
                <dd className="text-steel-text">{ROLE_INFO.staff}</dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}
