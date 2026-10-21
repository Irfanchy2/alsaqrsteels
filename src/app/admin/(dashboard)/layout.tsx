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
  { href: "/admin", label: "Home", icon: "dashboard", group: "" },
  { href: "/admin/enquiries", label: "Messages & quotes", icon: "inbox", group: "" },
  { href: "/admin/builder", label: "Page builder", icon: "pages", group: "Website" },
  { href: "/admin/pages", label: "Page text", icon: "blog", group: "Website" },
  { href: "/admin/projects", label: "Projects & photos", icon: "projects", group: "Website" },
  { href: "/admin/services", label: "Services", icon: "services", group: "Website" },
  { href: "/admin/blog", label: "Blog", icon: "blog", group: "Website" },
  { href: "/admin/faqs", label: "Questions (FAQ)", icon: "faq", group: "Website" },
  { href: "/admin/settings", label: "Company info", icon: "company", group: "Company" },
  { href: "/admin/clients", label: "Client logos", icon: "clients", group: "Company" },
  { href: "/admin/certifications", label: "Certificates", icon: "cert", group: "Company", admin: true },
  { href: "/admin/documents", label: "Documents", icon: "docs", group: "Company", admin: true },
  { href: "/admin/analytics", label: "Visitors", icon: "chart", group: "Admin", admin: true },
  { href: "/admin/motion", label: "Motion & effects", icon: "motion", group: "Admin", admin: true },
  { href: "/admin/team", label: "Team & roles", icon: "team", group: "Admin", admin: true },
];

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user, role } = await requireStaff();
  return (
    <div className="admin min-h-dvh bg-paper lg:flex">
      <AdminNav
        items={NAV.filter((n) => !n.admin || role === "admin")}
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
