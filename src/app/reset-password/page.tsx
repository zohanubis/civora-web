import { redirect } from "next/navigation";

import { resetPassword } from "@/features/auth/actions";
import { createClient } from "@/lib/supabase/server";

type ResetPasswordPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/error?code=invalid-recovery-session");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 space-y-2">
          <h1 className="text-2xl font-semibold">Choose a new password</h1>
          <p className="text-sm text-slate-600">Use at least 8 characters.</p>
        </div>

        {params.error ? (
          <p className="mb-4 rounded-lg bg-slate-50 p-3 text-sm">
            We could not update the password. Try again.
          </p>
        ) : null}

        <form action={resetPassword} className="space-y-4">
          <label className="block space-y-1 text-sm">
            <span>New password</span>
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
            Update password
          </button>
        </form>
      </div>
    </main>
  );
}
