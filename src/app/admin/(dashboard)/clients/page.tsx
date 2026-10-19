import { requireStaff } from "@/lib/admin";
import { PageTitle } from "@/components/admin/AdminUI";
import ClientLogosManager, { type LogoRow } from "@/components/admin/ClientLogosManager";

export default async function AdminClients() {
  const { supabase } = await requireStaff();
  const { data } = await supabase.from("client_logos").select("id, name, logo_url, published").order("sort_order").order("created_at");
  return (
    <>
      <PageTitle title="Client logos" />
      <p className="mb-6 max-w-3xl text-sm text-steel-text">
        The “Trusted by teams across UAE industry” strip under the home page banner. Changes here save immediately. Only show a
        client&rsquo;s logo when you have worked for them and are allowed to name them.
      </p>
      <ClientLogosManager logos={(data ?? []) as LogoRow[]} />
    </>
  );
}
