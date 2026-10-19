import type { Metadata, Viewport } from "next";
import { requireStaff } from "@/lib/admin";
import AdminNav from "@/components/admin/AdminNav";
import { signOut } from "../actions";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const viewport: Viewport = { themeColor: "#13171c" };
export const dynamic = "force-dynamic";
// Run next to the database (Supabase, Tokyo): each admin page makes several
// queries, so this removes most of the waiting.
export const preferredRegion = "hnd1";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/analytics", label: "Visitors & analytics" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/projects", label: "Projects & photos" },
  { href: "/admin/blog", label: "Blog posts" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/faqs", label: "FAQs" },
  { href: "/admin/clients", label: "Client logos" },
  { href: "/admin/certifications", label: "Certifications" },
  { href: "/admin/documents", label: "Documents" },
  { href: "/admin/settings", label: "Company details" },
];

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user, role } = await requireStaff();
  return (
    <div className="admin min-h-dvh bg-paper lg:flex">
      <AdminNav
        items={NAV}
        email={user.email}
        role={role}
        signOut={
          <form action={signOut}>
            <button type="submit" className="text-on-ink-muted underline hover:text-on-ink">
              Sign out
            </button>
          </form>
        }
      />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">{children}</main>
    </div>
  );
}
