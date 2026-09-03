import { AuthForm } from "@/features/auth/components/auth-form";

export default function SignInPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6 py-12">
      <section className="w-full rounded-2xl border border-neutral-200 p-6 shadow-sm">
        <p className="text-sm text-neutral-500">Civora</p>
        <h1 className="mt-1 text-2xl font-semibold">Sign in</h1>
        <p className="mb-6 mt-2 text-sm text-neutral-600">Continue to your community workspace.</p>
        <AuthForm mode="sign-in" />
      </section>
    </main>
  );
}
