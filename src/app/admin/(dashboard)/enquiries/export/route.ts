import { requireStaff } from "@/lib/admin";

export const dynamic = "force-dynamic";

const COLS = ["reference", "created_at", "status", "name", "company", "phone", "email", "service", "location", "target_date", "source", "scope"] as const;

// CSV download of enquiries for Excel. Staff only (requireStaff redirects otherwise).
export async function GET() {
  const { supabase } = await requireStaff();
  const { data } = await supabase.from("enquiries").select(COLS.join(", ")).order("created_at", { ascending: false }).limit(5000);
  const cell = (v: unknown) => {
    let s = v == null ? "" : String(v);
    if (/^[=+\-@]/.test(s)) s = `'${s}`; // stop spreadsheet formula injection
    return `"${s.replace(/"/g, '""')}"`;
  };
  const rows = ((data ?? []) as unknown as Record<string, unknown>[]).map((r) => COLS.map((c) => cell(r[c])).join(","));
  const csv = "﻿" + [COLS.join(","), ...rows].join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="enquiries-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
