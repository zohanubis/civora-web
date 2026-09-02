import Link from "next/link";

import { signUp } from "@/features/auth/actions";

type SignUpPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 space-y-2">
          <h1 className="text-2xl font-semibold">Create your Civora account</h1>
          <p className="text-sm text-slate-600">
            You will need to confirm your email before the account can be used.
          </p>
        </div>

        {params.error ? (
          <p className="mb-4 rounded-lg bg-slate-50 p-3 text-sm">
            We could not create the account. Check your details and try again.
          </p>
        ) : null}

        <form action={signUp} className="space-y-4">
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
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
            />
          </label>
          <button className="w-full rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white" type="submit">
            Create account
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          Already registered?{" "}
          <Link className="font-medium text-slate-950 underline" href="/sign-in">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
