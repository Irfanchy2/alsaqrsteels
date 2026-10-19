// Browser-side checks for the quote form, written without a validation
// library so the form stays light. They mirror quoteFieldsSchema in
// src/lib/quote.ts, which the server still applies to every submission.

export const SERVICE_OTHER = "other";

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

type Values = Record<string, unknown>;
const s = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export function validateQuoteFields(v: Values): Record<string, string> {
  const e: Record<string, string> = {};
  const name = s(v.name);
  if (name.length < 2) e.name = "Enter your name.";
  else if (name.length > 120) e.name = "Name is too long.";
  if (s(v.company).length > 160) e.company = "Company must be 160 characters or fewer.";
  const phone = s(v.phone);
  if (phone && !/^\+?[0-9][0-9\s()-]{6,24}$/.test(phone)) e.phone = "Enter a valid phone number, e.g. +971 50 123 4567.";
  const email = s(v.email);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) e.email = "Enter a valid email address.";
  if (!s(v.service)) e.service = "Choose the service you need.";
  const location = s(v.location);
  if (location.length < 2) e.location = "Enter the project location (city or site).";
  else if (location.length > 200) e.location = "Location is too long.";
  const scope = s(v.scope);
  if (scope.length < 10) e.scope = "Describe the scope in a sentence or two (at least 10 characters).";
  else if (scope.length > 5000) e.scope = "Scope must be 5,000 characters or fewer.";
  if (s(v.dimensions).length > 1000) e.dimensions = "Dimensions must be 1,000 characters or fewer.";
  if (s(v.quantities).length > 1000) e.quantities = "Quantities must be 1,000 characters or fewer.";
  const date = s(v.targetDate);
  if (date && !(/^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date)))) e.targetDate = "Enter a valid date.";
  if (v.consent !== true) e.consent = "Please confirm we may use these details to respond.";
  if (!phone && !email && !e.phone && !e.email) e.contact = "Enter a phone number or an email address so we can reply.";
  return e;
}
