import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  archiveOrganizationAction,
  updateOrganizationAction,
} from "@/features/organizations/actions";
import { getOrganization } from "@/features/organizations/organizations";
import { ApiError } from "@/lib/api/client";
import { createClient } from "@/lib/supabase/server";

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    redirect("/sign-in");
  }

  const { id } = await params;
  let organization;
  try {
    organization = await getOrganization(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const updateAction = updateOrganizationAction.bind(null, id);
  const archiveAction = archiveOrganizationAction.bind(null, id);

  return (
    <main className="mx-auto min-h-screen max-w-3xl space-y-8 px-6 py-10">
      <Link href="/organizations" className="text-sm text-neutral-600 underline">
        ← Organizations
      </Link>

      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold">{organization.name}</h1>
          <span className="rounded-full border px-2 py-1 text-xs">{organization.role}</span>
          <span className="rounded-full border px-2 py-1 text-xs">{organization.status}</span>
        </div>
        <p className="mt-2 text-sm text-neutral-500">/{organization.slug}</p>
      </header>

      {organization.role === "OWNER" && organization.status === "ACTIVE" ? (
        <section className="rounded-xl border p-6">
          <h2 className="font-semibold">Organization settings</h2>
          <form action={updateAction} className="mt-4 grid gap-4">
            <label className="grid gap-1 text-sm">
              Name
              <input
                name="name"
                defaultValue={organization.name}
                maxLength={160}
                className="rounded-lg border px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm">
              Description
              <textarea
                name="description"
                defaultValue={organization.description ?? ""}
                maxLength={4000}
                rows={5}
                className="rounded-lg border px-3 py-2"
              />
            </label>
            <button className="w-fit rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white">
              Save changes
            </button>
          </form>

          <form action={archiveAction} className="mt-8 border-t pt-6">
            <button className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700">
              Archive organization
            </button>
          </form>
        </section>
      ) : (
        <section className="rounded-xl border p-6 text-neutral-600">
          {organization.description || "No description"}
        </section>
      )}
    </main>
  );
}
