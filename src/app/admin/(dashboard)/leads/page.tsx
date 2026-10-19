import { permanentRedirect } from "next/navigation";

// The old "leads" screen was replaced by Enquiries.
export default function LegacyLeads() {
  permanentRedirect("/admin/enquiries");
}
