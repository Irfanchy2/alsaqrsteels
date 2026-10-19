"use server";

import { createClient } from "@/lib/supabase/server";

export type LeadFormState = {
  ok: boolean;
  message: string;
};

export async function submitLead(
  _prevState: LeadFormState,
  formData: FormData
): Promise<LeadFormState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const company = String(formData.get("company") || "").trim();
  const project_type = String(formData.get("project_type") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const required_by = String(formData.get("required_by") || "").trim();

  if (!name || !description) {
    return { ok: false, message: "Please share your name and a short description of the project." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("leads").insert({
    name,
    email: email || null,
    phone: phone || null,
    company: company || null,
    project_type: project_type || null,
    description,
    location: location || null,
    required_by: required_by || null,
    source: "website",
    status: "new",
  });

  if (error) {
    return { ok: false, message: "Something went wrong submitting your request. Please try again or call us directly." };
  }

  return { ok: true, message: "Thanks — we've received your request and will get back to you shortly." };
}
