import Link from "next/link";

import { forgotPassword } from "@/features/auth/actions";

type ForgotPasswordPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const params = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 space-y-2">
          <h1 className="text-2xl font-semibold">Reset your password</h1>
          <p className="text-sm text-slate-600">
            Enter your email. If an account exists, we will send recovery instructions.
          </p>
        </div>

        {params.message === "check-email" ? (
          <p className="mb-4 rounded-lg bg-slate-50 p-3 text-sm">
            If an account exists for that email, a password reset message has been sent.
          </p>
        ) : null}
        {params.error ? (
          <p className="mb-4 rounded-lg bg-slate-50 p-3 text-sm">Enter a valid email address.</p>
        ) : null}

        <form action={forgotPassword} className="space-y-4">
          <label className="block space-y-1 text-sm">
            <span>Email</span>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </label>
          <button className="w-full rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white" type="submit">
            Send recovery email
          </button>
        </form>

        <Link className="mt-6 inline-block text-sm underline" href="/sign-in">
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
