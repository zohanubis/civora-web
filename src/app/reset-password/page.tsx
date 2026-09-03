import { ResetPasswordForm } from "@/features/auth/components/password-recovery-form";

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6 py-12">
      <section className="w-full rounded-2xl border border-neutral-200 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Choose a new password</h1>
        <p className="mb-6 mt-2 text-sm text-neutral-600">Your recovery session must be valid before this change is accepted.</p>
        <ResetPasswordForm />
      </section>
    </main>
  );
}
