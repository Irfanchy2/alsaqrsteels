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
  { href: "/admin", label: "Dashboard", icon: "dashboard", group: "" },
  { href: "/admin/enquiries", label: "Enquiries", icon: "inbox", group: "Leads" },
  { href: "/admin/analytics", label: "Visitors & analytics", icon: "chart", group: "Leads" },
  { href: "/admin/pages", label: "Pages & sections", icon: "pages", group: "Website" },
  { href: "/admin/projects", label: "Projects & photos", icon: "projects", group: "Website" },
  { href: "/admin/services", label: "Services", icon: "services", group: "Website" },
  { href: "/admin/blog", label: "Blog posts", icon: "blog", group: "Website" },
  { href: "/admin/faqs", label: "FAQs", icon: "faq", group: "Website" },
  { href: "/admin/settings", label: "Company details", icon: "company", group: "Company" },
  { href: "/admin/clients", label: "Client logos", icon: "clients", group: "Company" },
  { href: "/admin/certifications", label: "Certifications", icon: "cert", group: "Company" },
  { href: "/admin/documents", label: "Documents", icon: "docs", group: "Company" },
  { href: "/admin/motion", label: "Motion & effects", icon: "motion", group: "Settings", admin: true },
  { href: "/admin/team", label: "Team & roles", icon: "team", group: "Settings", admin: true },
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
