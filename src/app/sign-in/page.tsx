import Link from "next/link";

import { signIn } from "@/features/auth/actions";

type SignInPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 space-y-2">
          <h1 className="text-2xl font-semibold">Sign in to Civora</h1>
          <p className="text-sm text-slate-600">Use the email address you registered with.</p>
        </div>

        {params.message === "check-email" ? (
          <p className="mb-4 rounded-lg bg-slate-50 p-3 text-sm">
            Check your email and confirm your account before signing in.
          </p>
        ) : null}
        {params.error ? (
          <p className="mb-4 rounded-lg bg-slate-50 p-3 text-sm">
            Sign-in failed. Check your details and try again.
          </p>
        ) : null}

        <form action={signIn} className="space-y-4">
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
          <label className="block space-y-1 text-sm">
            <span>Password</span>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              name="password"
              type="password"
              autoComplete="current-password"
              minLength={8}
              maxLength={128}
              required
            />
          </label>
          <button className="w-full rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white" type="submit">
            Sign in
          </button>
        </form>

        <div className="mt-6 flex justify-between text-sm">
          <Link className="underline" href="/forgot-password">
            Forgot password?
          </Link>
          <Link className="underline" href="/sign-up">
            Create account
          </Link>
        </div>
      </div>
    </main>
  );
}
