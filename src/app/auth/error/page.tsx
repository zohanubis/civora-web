import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Authentication link could not be verified</h1>
        <p className="text-sm text-slate-600">
          The link may be invalid or expired. Request a new sign-in or recovery flow and try again.
        </p>
      </div>
      <div className="flex gap-4 text-sm">
        <Link className="font-medium underline" href="/sign-in">
          Sign in
        </Link>
        <Link className="font-medium underline" href="/forgot-password">
          Reset password
        </Link>
      </div>
    </main>
  );
}
