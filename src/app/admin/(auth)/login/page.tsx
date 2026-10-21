import type { Metadata } from "next";
import Image from "next/image";
import LoginForm from "./LoginForm";

export const preferredRegion = "hnd1";

export const metadata: Metadata = { title: "Staff sign in", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const { error, next } = await searchParams;
  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-white px-4 py-12">
      <div className="flex w-full max-w-sm flex-col items-center rounded-3xl border border-orange-100 bg-gradient-to-b from-orange-50/60 to-white p-8 text-black shadow-xl shadow-black/5">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg shadow-black/5">
          <Image src="/icon.png" alt="" width={36} height={36} className="h-9 w-9 object-contain" />
        </div>
        <h1 className="mb-2 text-center font-sans text-2xl font-semibold normal-case leading-tight tracking-normal [font-stretch:100%]">Sign in with email</h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          Al Saqr Al Ahmar staff area: website content, projects and enquiries.
        </p>
        {error === "not-staff" ? (
          <p role="alert" className="mb-4 w-full rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
            This account is not on the staff list yet. Ask an admin to add your email under Team &amp; roles.
          </p>
        ) : null}
        <LoginForm next={next && next.startsWith("/admin") ? next : "/admin"} />
        <div className="my-2 flex w-full items-center">
          <div className="flex-grow border-t border-dashed border-gray-200" />
          <span className="mx-2 text-xs text-gray-400">Staff only</span>
          <div className="flex-grow border-t border-dashed border-gray-200" />
        </div>
        <a href="/" className="mt-2 text-xs font-medium text-gray-500 hover:text-black hover:underline">
          ← Back to alsaqrsteels.com
        </a>
      </div>
    </main>
  );
}
