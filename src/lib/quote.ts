import { z } from "zod";

// Shared by the quote form (instant feedback) and the API route (first server
// check). The submit-enquiry edge function validates everything again before
// anything is stored.

export { SERVICE_OTHER, formatBytes } from "./quote-client";

const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be ${max.toLocaleString()} characters or fewer.`)
    .optional()
    .transform((v) => (v ? v : undefined));

export const quoteFieldsSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your name.").max(120, "Name is too long."),
    company: optionalText(160, "Company"),
    phone: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? v : undefined))
      .refine((v) => !v || /^\+?[0-9][0-9\s()-]{6,24}$/.test(v), "Enter a valid phone number, e.g. +971 50 123 4567."),
    email: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? v : undefined))
      .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), "Enter a valid email address."),
    service: z.string().min(1, "Choose the service you need."),
    location: z.string().trim().min(2, "Enter the project location (city or site).").max(200, "Location is too long."),
    scope: z
      .string()
      .trim()
      .min(10, "Describe the scope in a sentence or two (at least 10 characters).")
      .max(5000, "Scope must be 5,000 characters or fewer."),
    dimensions: optionalText(1000, "Dimensions"),
    quantities: optionalText(1000, "Quantities"),
    targetDate: z
      .string()
      .optional()
      .transform((v) => (v ? v : undefined))
      .refine((v) => !v || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v))), "Enter a valid date."),
    consent: z.literal(true, { message: "Please confirm we may use these details to respond." }),
    source: z.enum(["quote_form", "assistant"]).default("quote_form"),
  })
  .refine((v) => v.phone || v.email, {
    message: "Enter a phone number or an email address so we can reply.",
    path: ["contact"],
  });

export type QuoteFields = z.input<typeof quoteFieldsSchema>;

export const submitSchema = z.object({
  session: z.string().uuid().optional(),
  files: z
    .array(z.object({ path: z.string().max(400), name: z.string().max(200) }))
    .max(5)
    .default([]),
  fields: z.unknown(),
  pagePath: z.string().max(200).optional(),
  // Spam checks: a field real visitors never see, and time spent on the form.
  website: z.string().max(200).optional(),
  elapsedMs: z.number().optional(),
});

export const uploadUrlSchema = z.object({
  session: z.string().uuid(),
  fileName: z.string().min(1).max(200),
  size: z.number().int().positive(),
  type: z.string().max(100),
});

export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
