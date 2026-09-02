import { ApiStatus } from "@/components/platform/api-status";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center gap-6 px-6 py-16">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wider text-neutral-500">Civora</p>
        <h1 className="text-4xl font-semibold tracking-tight">Platform foundation</h1>
        <p className="max-w-2xl text-neutral-600">
          The shared web shell is ready for Civora business modules. Domain features are implemented by their owning modules.
        </p>
      </div>
      <ApiStatus />
    </main>
  );
}
