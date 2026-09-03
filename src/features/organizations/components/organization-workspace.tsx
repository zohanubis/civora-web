"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { signOut } from "@/features/auth/api/auth";
import {
  archiveOrganization,
  createOrganization,
  getCurrentUser,
  listOrganizations,
  type Organization,
  updateOrganization,
} from "@/features/organizations/api/organizations";
import { CreateOrganizationForm } from "@/features/organizations/components/create-organization-form";
import type {
  CreateOrganizationInput,
  UpdateOrganizationInput,
} from "@/features/organizations/schemas/organization";
import { ApiError } from "@/lib/api/client";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function OrganizationWorkspace() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [accessToken, setAccessToken] = useState<string>();
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    void supabase.auth.getSession().then(({ data }) => {
      setAccessToken(data.session?.access_token);
      setSessionReady(true);
      if (!data.session) {
        router.replace("/sign-in");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAccessToken(session?.access_token);
      if (!session) {
        router.replace("/sign-in");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const currentUserQuery = useQuery({
    queryKey: ["identity", "me"],
    queryFn: () => getCurrentUser(accessToken!),
    enabled: Boolean(accessToken),
  });

  const organizationsQuery = useQuery({
    queryKey: ["organizations"],
    queryFn: () => listOrganizations(accessToken!),
    enabled: Boolean(accessToken),
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateOrganizationInput) => createOrganization(accessToken!, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateOrganizationInput }) =>
      updateOrganization(accessToken!, id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => archiveOrganization(accessToken!, id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

  async function handleSignOut() {
    await signOut();
    router.replace("/sign-in");
    router.refresh();
  }

  if (!sessionReady || !accessToken) {
    return <p className="text-sm text-neutral-600">Loading your secure session…</p>;
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-neutral-500">Civora workspace</p>
          <h1 className="text-2xl font-semibold">Organizations</h1>
          {currentUserQuery.data && (
            <p className="mt-1 text-xs text-neutral-500">Civora user {currentUserQuery.data.id}</p>
          )}
        </div>
        <button className="rounded-lg border px-3 py-2 text-sm" onClick={handleSignOut}>Sign out</button>
      </header>

      {currentUserQuery.isError && (
        <ErrorNotice title="Unable to provision your Civora profile" error={currentUserQuery.error} />
      )}

      <CreateOrganizationForm
        onCreate={(input) => createMutation.mutateAsync(input).then(() => undefined)}
        disabled={!currentUserQuery.data || createMutation.isPending}
        error={createMutation.error ? errorMessage(createMutation.error) : undefined}
      />

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Your organizations</h2>
          <p className="text-sm text-neutral-600">Only active memberships returned by the API appear here.</p>
        </div>

        {organizationsQuery.isPending && <p className="text-sm text-neutral-600">Loading organizations…</p>}
        {organizationsQuery.isError && <ErrorNotice title="Unable to load organizations" error={organizationsQuery.error} />}
        {organizationsQuery.data?.length === 0 && (
          <p className="rounded-xl border border-dashed p-5 text-sm text-neutral-600">No organizations yet. Create your first one above.</p>
        )}
        <div className="grid gap-4 lg:grid-cols-2">
          {organizationsQuery.data?.map((organization) => (
            <OrganizationCard
              key={organization.id}
              organization={organization}
              updating={updateMutation.isPending}
              archiving={archiveMutation.isPending}
              onUpdate={(input) => updateMutation.mutateAsync({ id: organization.id, input }).then(() => undefined)}
              onArchive={() => archiveMutation.mutateAsync(organization.id).then(() => undefined)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

type OrganizationCardProps = {
  organization: Organization;
  updating: boolean;
  archiving: boolean;
  onUpdate: (input: UpdateOrganizationInput) => Promise<void>;
  onArchive: () => Promise<void>;
};

function OrganizationCard({ organization, updating, archiving, onUpdate, onArchive }: OrganizationCardProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(organization.name);
  const [description, setDescription] = useState(organization.description ?? "");
  const [error, setError] = useState<string>();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    const normalizedName = name.trim();
    if (!normalizedName || normalizedName.length > 160) {
      setError("Organization name must be 1-160 characters.");
      return;
    }
    try {
      await onUpdate({ name: normalizedName, description });
      setEditing(false);
    } catch (caught) {
      setError(errorMessage(caught));
    }
  }

  async function archive() {
    if (!window.confirm(`Archive ${organization.name}?`)) return;
    try {
      await onArchive();
    } catch (caught) {
      setError(errorMessage(caught));
    }
  }

  return (
    <article className="rounded-2xl border p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{organization.name}</h3>
          <p className="text-sm text-neutral-500">/{organization.slug}</p>
          <p className="mt-2 text-sm text-neutral-600">{organization.description || "No description"}</p>
        </div>
        <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs">{organization.status}</span>
      </div>

      {organization.status === "ACTIVE" && (
        <div className="mt-4">
          {!editing ? (
            <div className="flex gap-2">
              <button className="rounded-lg border px-3 py-1.5 text-sm" onClick={() => setEditing(true)}>Edit</button>
              <button className="rounded-lg border px-3 py-1.5 text-sm" disabled={archiving} onClick={archive}>Archive</button>
            </div>
          ) : (
            <form className="space-y-3" onSubmit={submit}>
              <input aria-label="Organization name" value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-lg border px-3 py-2" />
              <textarea aria-label="Organization description" value={description} onChange={(event) => setDescription(event.target.value)} className="w-full rounded-lg border px-3 py-2" rows={3} />
              {error && <p className="text-sm text-red-700">{error}</p>}
              <div className="flex gap-2">
                <button className="rounded-lg bg-neutral-950 px-3 py-1.5 text-sm text-white" disabled={updating}>{updating ? "Saving…" : "Save"}</button>
                <button type="button" className="rounded-lg border px-3 py-1.5 text-sm" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          )}
          {error && !editing && <p className="mt-2 text-sm text-red-700">{error}</p>}
        </div>
      )}
    </article>
  );
}

function ErrorNotice({ title, error }: { title: string; error: unknown }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <p className="font-medium">{title}</p>
      <p>{errorMessage(error)}</p>
    </div>
  );
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiError && error.problem && typeof error.problem === "object") {
    const detail = "detail" in error.problem ? error.problem.detail : undefined;
    if (typeof detail === "string") return detail;
  }
  if (error instanceof Error) return error.message;
  return "Unexpected error.";
}
