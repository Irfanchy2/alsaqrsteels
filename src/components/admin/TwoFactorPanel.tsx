"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Enrolment = { factorId: string; qr: string; secret: string };

// Two-step sign-in with an authenticator app (Google Authenticator, Microsoft
// Authenticator, Authy…), using Supabase Auth's built-in TOTP factors. Once it
// is on, signing in needs the password and a 6-digit code from the phone.
export default function TwoFactorPanel() {
  const [loading, setLoading] = useState(true);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [enrol, setEnrol] = useState<Enrolment | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const refresh = async () => {
    const { data } = await createClient().auth.mfa.listFactors();
    setFactorId(data?.totp?.[0]?.id ?? null);
    setLoading(false);
  };
  useEffect(() => {
    void refresh();
  }, []);

  async function start() {
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    // Remove any half-finished setup first, then start a new one.
    const { data: all } = await supabase.auth.mfa.listFactors();
    for (const f of all?.all ?? []) if (f.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: f.id });
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `Authenticator ${new Date().toISOString().slice(0, 10)}` });
    setBusy(false);
    if (error || !data) return setMsg({ kind: "error", text: error?.message ?? "Could not start set-up." });
    setEnrol({ factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  }

  async function confirm() {
    if (!enrol || code.replace(/\D/g, "").length !== 6) return setMsg({ kind: "error", text: "Enter the 6-digit code from the app." });
    setBusy(true);
    setMsg(null);
    const { error } = await createClient().auth.mfa.challengeAndVerify({ factorId: enrol.factorId, code: code.replace(/\D/g, "") });
    setBusy(false);
    if (error) return setMsg({ kind: "error", text: "That code did not match. Wait for a new code in the app and try again." });
    setEnrol(null);
    setCode("");
    setMsg({ kind: "ok", text: "Two-step sign-in is on. Next time you sign in, you will be asked for a code from the app." });
    await refresh();
  }

  async function turnOff() {
    if (!factorId || !confirm_("Turn off two-step sign-in? Your account will be protected by the password only.")) return;
    setBusy(true);
    setMsg(null);
    const { error } = await createClient().auth.mfa.unenroll({ factorId });
    setBusy(false);
    if (error) return setMsg({ kind: "error", text: error.message });
    setMsg({ kind: "ok", text: "Two-step sign-in is off." });
    await refresh();
  }

  if (loading) return <p className="text-sm text-steel-text">Checking…</p>;

  return (
    <div className="space-y-4">
      <p className="flex items-center gap-2 text-sm">
        Status:{" "}
        {factorId ? (
          <span className="rounded-full bg-ok/15 px-2.5 py-0.5 font-semibold text-ok">On</span>
        ) : (
          <span className="rounded-full bg-warn-bg px-2.5 py-0.5 font-semibold">Off</span>
        )}
      </p>

      {!factorId && !enrol ? (
        <button type="button" className="btn btn-primary" onClick={() => void start()} disabled={busy}>
          {busy ? "Starting…" : "Turn on two-step sign-in"}
        </button>
      ) : null}

      {enrol ? (
        <ol className="space-y-4 text-sm">
          <li>
            <strong>1.</strong> Install an authenticator app on your phone (Google Authenticator, Microsoft Authenticator or Authy).
          </li>
          <li>
            <strong>2.</strong> In the app, add an account and scan this code:
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={enrol.qr} alt="QR code for the authenticator app" width={180} height={180} className="mt-2 rounded border border-line bg-white p-2" />
            <span className="mt-2 block text-steel-text">
              Can&apos;t scan? Type this key instead: <code className="select-all break-all font-mono">{enrol.secret}</code>
            </span>
          </li>
          <li>
            <strong>3.</strong> Enter the 6-digit code the app shows:
            <span className="mt-2 flex flex-wrap gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void confirm()}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={7}
                placeholder="123456"
                aria-label="6-digit code"
                className="input w-36 font-mono tracking-[0.3em]"
              />
              <button type="button" className="btn btn-primary" onClick={() => void confirm()} disabled={busy}>
                {busy ? "Checking…" : "Confirm"}
              </button>
              <button type="button" className="text-sm underline" onClick={() => setEnrol(null)}>
                Cancel
              </button>
            </span>
          </li>
        </ol>
      ) : null}

      {factorId && !enrol ? (
        <button type="button" className="text-sm text-danger underline" onClick={() => void turnOff()} disabled={busy}>
          Turn off two-step sign-in
        </button>
      ) : null}

      {msg ? <p className={msg.kind === "ok" ? "text-sm font-medium text-ok" : "field-error"}>{msg.text}</p> : null}
    </div>
  );
}

const confirm_ = (q: string) => (typeof window === "undefined" ? false : window.confirm(q));
