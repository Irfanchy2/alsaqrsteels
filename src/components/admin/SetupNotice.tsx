// Shown when the site_content table has not been created yet.
export default function SetupNotice() {
  return (
    <div role="alert" className="mb-6 rounded-lg border border-warn/40 bg-warn-bg p-4 text-sm">
      <p className="font-semibold">One-time database update needed</p>
      <p className="mt-1">
        You can look around, but saving here needs the new content table. In Supabase, open <strong>SQL Editor → New query</strong>,
        paste the contents of <code className="rounded bg-white/60 px-1">supabase/migrations/20261020090000_site_content_team.sql</code> from
        the GitHub repo, and click <strong>Run</strong>. It only adds a table; nothing existing is changed.
      </p>
    </div>
  );
}
