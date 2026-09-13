import { AuthForm } from "@/features/auth/components/auth-form";

type SignInPageProps = {
  searchParams: Promise<{
    reason?: string | string[];
    error?: string | string[];
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const reason = firstValue(params.reason);
  const error = firstValue(params.error);

  const notice =
    reason === "session-expired"
      ? "Your session is no longer valid. Sign in again to continue."
      : error === "auth-callback"
        ? "Civora could not complete the authentication callback. Please sign in again."
        : undefined;

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6 py-12">
      <section className="w-full rounded-2xl border border-neutral-200 p-6 shadow-sm">
        <p className="text-sm text-neutral-500">Civora</p>
        <h1 className="mt-1 text-2xl font-semibold">Sign in</h1>
        <p className="mb-6 mt-2 text-sm text-neutral-600">
          Continue to your community workspace.
        </p>
        {notice && (
          <p role="status" className="mb-4 rounded-lg border bg-neutral-50 p-3 text-sm text-neutral-700">
            {notice}
          </p>
        )}
        <AuthForm mode="sign-in" />
      </section>
    </main>
  );
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
