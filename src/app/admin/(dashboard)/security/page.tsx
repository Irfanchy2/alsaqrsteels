import { requireStaff } from "@/lib/admin";
import { Card, PageTitle } from "@/components/admin/AdminUI";
import TwoFactorPanel from "@/components/admin/TwoFactorPanel";

export default async function SecurityPage() {
  const { user } = await requireStaff();
  return (
    <>
      <PageTitle title="Sign-in security" />
      <div className="grid max-w-4xl gap-6 lg:grid-cols-[1fr_18rem]">
        <Card>
          <h2 className="text-lg font-bold normal-case tracking-normal [font-stretch:100%]">Two-step sign-in</h2>
          <p className="mb-5 mt-1 text-sm text-steel-text">
            Protects <strong>{user.email}</strong>: even if someone learns your password, they cannot sign in without the code on your phone.
          </p>
          <TwoFactorPanel />
        </Card>
        <Card>
          <h2 className="text-base font-bold normal-case tracking-normal [font-stretch:100%]">Good habits</h2>
          <ul className="mt-2 list-disc space-y-1.5 ps-5 text-sm text-steel-text">
            <li>Use a long password you use nowhere else.</li>
            <li>Each staff member signs in with their own account.</li>
            <li>Remove people under Team &amp; roles when they leave.</li>
            <li>If you change phones, turn two-step sign-in off and on again with the new phone.</li>
          </ul>
        </Card>
      </div>
    </>
  );
}
