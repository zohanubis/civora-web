import Link from "next/link";
import { redirect } from "next/navigation";

import { createOrganizationAction } from "@/features/organizations/actions";
import { listOrganizations } from "@/features/organizations/organizations";
import { createClient } from "@/lib/supabase/server";

export default async function OrganizationsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    redirect("/sign-in?next=/organizations");
  }

  const organizations = await listOrganizations();

  return (
    <main className="mx-auto min-h-screen max-w-5xl space-y-8 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-neutral-500">Civora</p>
          <h1 className="text-3xl font-semibold tracking-tight">Organizations</h1>
          <p className="mt-2 text-neutral-600">Your tenant-isolated community workspaces.</p>
        </div>
        <form action="/auth/sign-out" method="post">
          <button className="rounded-lg border px-4 py-2 text-sm">Sign out</button>
        </form>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {organizations.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-neutral-600">
            No organization yet. Create your first community workspace below.
          </div>
        ) : (
          organizations.map((organization) => (
            <Link
              key={organization.id}
              href={`/organizations/${organization.id}`}
              className="rounded-xl border p-5 transition hover:bg-neutral-50"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold">{organization.name}</h2>
                <span className="rounded-full border px-2 py-1 text-xs">{organization.role}</span>
              </div>
              <p className="mt-2 text-sm text-neutral-500">/{organization.slug}</p>
              <p className="mt-3 text-sm text-neutral-600">{organization.description || "No description"}</p>
            </Link>
          ))
        )}
      </section>

      <section className="rounded-xl border p-6">
        <h2 className="text-lg font-semibold">Create organization</h2>
        <form action={createOrganizationAction} className="mt-4 grid gap-4">
          <label className="grid gap-1 text-sm">
            Name
            <input name="name" required maxLength={160} className="rounded-lg border px-3 py-2" />
          </label>
          <label className="grid gap-1 text-sm">
            Slug <span className="text-neutral-500">optional — generated from name</span>
            <input name="slug" minLength={3} maxLength={80} className="rounded-lg border px-3 py-2" />
          </label>
          <label className="grid gap-1 text-sm">
            Description
            <textarea name="description" maxLength={4000} rows={4} className="rounded-lg border px-3 py-2" />
          </label>
          <button className="w-fit rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white">
            Create organization
          </button>
        </form>
      </section>
    </main>
  );
}
