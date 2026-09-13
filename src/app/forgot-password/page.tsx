import Link from "next/link";

import { ForgotPasswordForm } from "@/features/auth/components/password-recovery-form";

type ForgotPasswordPageProps = {
  searchParams: Promise<{ error?: string | string[] }>;
};

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const params = await searchParams;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6 py-12">
      <section className="w-full rounded-2xl border border-neutral-200 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Reset password</h1>
        <p className="mb-6 mt-2 text-sm text-neutral-600">
          We will send a secure recovery link to your email.
        </p>
        {error === "invalid-recovery-session" && (
          <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            That recovery session is missing or expired. Request a new password reset link.
          </p>
        )}
        <ForgotPasswordForm />
        <Link className="mt-4 inline-block text-sm underline" href="/sign-in">
          Back to sign in
        </Link>
      </section>
    </main>
  );
}
