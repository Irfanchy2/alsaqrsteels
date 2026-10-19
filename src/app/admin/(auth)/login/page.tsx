import type { Metadata } from "next";
import Image from "next/image";
import LoginForm from "./LoginForm";

export const preferredRegion = "hnd1";

export const metadata: Metadata = { title: "Staff sign in", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const { error, next } = await searchParams;
  return (
    <main className="drawing-grid flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm border-2 border-ink bg-card p-8">
        <Image src="/brand/logo-horizontal.png" alt="Al Saqr Al Ahmar" width={419} height={182} className="h-12 w-auto" />
        <h1 className="mt-6 text-2xl font-bold">Staff sign in</h1>
        <p className="mt-1 text-sm text-steel-text">Content management and enquiry review.</p>
        {error === "not-staff" ? (
          <p role="alert" className="mt-5 border-s-4 border-danger bg-danger-bg px-3 py-2 text-sm">
            This account is not on the staff list. Ask an administrator to add you (see the setup guide).
          </p>
        ) : null}
        <div className="mt-6">
          <LoginForm next={next && next.startsWith("/admin") ? next : "/admin"} />
        </div>
      </div>
    </main>
  );
}
