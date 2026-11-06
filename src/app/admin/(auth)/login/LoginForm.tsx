"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const validEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function LoginForm({ next = "/admin", startAtCode = false }: { next?: string; startAtCode?: boolean }) {
  const router = useRouter();
  const [step, setStep] = useState<"password" | "code">(startAtCode ? "code" : "password");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || !password) return setError("Please enter both email and password.");
    if (!validEmail(email)) return setError("Please enter a valid email address.");
    setPending(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setPending(false);
      setError(error.message === "Invalid login credentials" ? "Email or password is incorrect." : error.message);
      return;
    }
    await continueAfterPassword();
  }

  // Accounts with two-step sign-in also need the 6-digit code from their app.
  async function continueAfterPassword() {
    const { data } = await createClient().auth.mfa.getAuthenticatorAssuranceLevel();
    if (data?.nextLevel === "aal2" && data.currentLevel !== "aal2") {
      setPending(false);
      setStep("code");
      return;
    }
    // One navigation only: the admin pages are always rendered fresh, so a
    // refresh() on top of push() loaded the dashboard a second time.
    router.replace(next);
  }

  // Sent here by the admin area for the code: check there is a signed-in
  // session that still needs it; otherwise start from the password.
  useEffect(() => {
    if (!startAtCode) return;
    void (async () => {
      const { data } = await createClient().auth.mfa.getAuthenticatorAssuranceLevel();
      if (!data?.currentLevel) setStep("password");
      else if (data.nextLevel !== "aal2" || data.currentLevel === "aal2") router.replace(next);
    })();
  }, [startAtCode, next, router]);

  async function handleCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const digits = code.replace(/\D/g, "");
    if (digits.length !== 6) return setError("Enter the 6-digit code from your authenticator app.");
    setPending(true);
    setError(null);
    const supabase = createClient();
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const factor = factors?.totp?.[0];
    if (!factor) {
      setPending(false);
      return setError("No authenticator app is set up for this account.");
    }
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code: digits });
    if (error) {
      setPending(false);
      return setError("That code did not match. Wait for the next code and try again.");
    }
    router.replace(next);
  }

  async function switchAccount() {
    await createClient().auth.signOut();
    setCode("");
    setError(null);
    setStep("password");
  }

  if (step === "code") {
    return (
      <form onSubmit={handleCode} noValidate className="w-full">
        <p className="mb-3 text-center text-sm text-gray-600">Open your authenticator app and enter the 6-digit code for Al Saqr admin.</p>
        <label className="block">
          <span className="sr-only">6-digit code</span>
          <input
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            maxLength={7}
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 text-center font-mono text-2xl tracking-[0.4em] text-black placeholder:text-gray-300 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
        </label>
        <p role={error ? "alert" : undefined} className="mt-2 min-h-5 text-sm text-red-500">
          {error}
        </p>
        <button
          type="submit"
          disabled={pending}
          className="mb-2 mt-2 w-full cursor-pointer rounded-xl bg-gradient-to-b from-gray-700 to-gray-900 py-2.5 font-medium text-white shadow transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? "Checking…" : "Verify and continue"}
        </button>
        <button type="button" onClick={() => void switchAccount()} className="w-full text-center text-xs font-medium text-gray-500 hover:text-black hover:underline">
          Use a different account
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full">
      <div className="mb-2 flex w-full flex-col gap-3">
        <label className="relative block">
          <span className="sr-only">Email</span>
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-10 6L2 7" />
            </svg>
          </span>
          <input
            name="email"
            type="email"
            autoComplete="username"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-[16px] text-black placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-200 sm:text-sm"
          />
        </label>
        <label className="relative block">
          <span className="sr-only">Password</span>
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-16 text-[16px] text-black placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-200 sm:text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 select-none text-xs font-medium text-gray-500 hover:text-black"
            aria-pressed={showPassword}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </label>
        <div className="flex w-full items-start justify-between gap-3">
          <p role={error ? "alert" : undefined} className="min-h-5 text-left text-sm text-red-500">
            {error}
          </p>
          <button type="button" onClick={() => setShowHelp((v) => !v)} className="flex-none text-xs font-medium text-black hover:underline">
            Forgot password?
          </button>
        </div>
        {showHelp ? (
          <p className="rounded-xl border border-orange-100 bg-orange-50 px-3 py-2 text-xs leading-relaxed text-gray-700">
            Ask an admin to reset it: Supabase → Authentication → Users → your email → <strong>Send password recovery</strong>,
            or set a new password there.
          </p>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="mb-2 mt-2 w-full cursor-pointer rounded-xl bg-gradient-to-b from-gray-700 to-gray-900 py-2.5 font-medium text-white shadow transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
