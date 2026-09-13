"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { signOut } from "@/features/auth/api/auth";
import {
  archiveOrganization,
  createOrganization,
  getCurrentUser,
  listOrganizations,
  updateOrganization,
} from "@/features/organizations/api/organizations";
import { CreateOrganizationForm } from "@/features/organizations/components/create-organization-form";
import { OrganizationCard } from "@/features/organizations/components/organization-card";
import { OrganizationSwitcher } from "@/features/organizations/components/organization-switcher";
import type {
  CreateOrganizationInput,
  UpdateOrganizationInput,
} from "@/features/organizations/schemas/organization";
import {
  isUnauthorized,
  organizationErrorMessage,
} from "@/features/organizations/utils/errors";
import { ApiError } from "@/lib/api/client";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function OrganizationWorkspace() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [accessToken, setAccessToken] = useState<string>();
  const [sessionReady, setSessionReady] = useState(false);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>();
  const authRecoveryStartedRef = useRef(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let active = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setAccessToken(data.session?.access_token);
      setSessionReady(true);
      if (!data.session) {
        router.replace("/sign-in");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setAccessToken(session?.access_token);
      setSessionReady(true);
      if (!session && !authRecoveryStartedRef.current) {
        router.replace("/sign-in");
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const recoverFromUnauthorized = useCallback(
    async (error: unknown) => {
      if (!(error instanceof ApiError) || error.status !== 401 || authRecoveryStartedRef.current) {
        return;
      }

      authRecoveryStartedRef.current = true;
      try {
        await signOut();
      } finally {
        queryClient.clear();
        setAccessToken(undefined);
        setSelectedOrganizationId(undefined);
        router.replace("/sign-in?reason=session-expired");
        router.refresh();
      }
    },
    [queryClient, router],
  );

  const currentUserQuery = useQuery({
    queryKey: ["identity", "me"],
    queryFn: () => getCurrentUser(accessToken!),
    enabled: Boolean(accessToken),
    retry: false,
  });

  const organizationsQuery = useQuery({
    queryKey: ["organizations"],
    queryFn: () => listOrganizations(accessToken!),
    enabled: Boolean(accessToken),
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateOrganizationInput) => createOrganization(accessToken!, input),
    onSuccess: async (organization) => {
      setSelectedOrganizationId(organization.id);
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: (error) => {
      void recoverFromUnauthorized(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateOrganizationInput }) =>
      updateOrganization(accessToken!, id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: (error) => {
      void recoverFromUnauthorized(error);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => archiveOrganization(accessToken!, id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: (error) => {
      void recoverFromUnauthorized(error);
    },
  });

  useEffect(() => {
    void recoverFromUnauthorized(currentUserQuery.error);
  }, [currentUserQuery.error, recoverFromUnauthorized]);

  useEffect(() => {
    void recoverFromUnauthorized(organizationsQuery.error);
  }, [organizationsQuery.error, recoverFromUnauthorized]);

  useEffect(() => {
    const organizations = organizationsQuery.data;
    if (!organizations || organizations.length === 0) {
      setSelectedOrganizationId(undefined);
      return;
    }

    if (!selectedOrganizationId || !organizations.some(({ id }) => id === selectedOrganizationId)) {
      const defaultOrganization =
        organizations.find(({ status }) => status === "ACTIVE") ?? organizations[0];
      setSelectedOrganizationId(defaultOrganization.id);
    }
  }, [organizationsQuery.data, selectedOrganizationId]);

  async function handleSignOut() {
    try {
      await signOut();
    } finally {
      queryClient.clear();
      setAccessToken(undefined);
      setSelectedOrganizationId(undefined);
      router.replace("/sign-in");
      router.refresh();
    }
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
            <p className="mt-1 break-all text-xs text-neutral-500">
              Civora user {currentUserQuery.data.id}
            </p>
          )}
        </div>
        <button
          type="button"
          className="rounded-lg border px-3 py-2 text-sm"
          onClick={handleSignOut}
        >
          Sign out
        </button>
      </header>

      {currentUserQuery.isError && !isUnauthorized(currentUserQuery.error) && (
        <ErrorNotice title="Unable to provision your Civora profile" error={currentUserQuery.error} />
      )}

      <CreateOrganizationForm
        onCreate={(input) => createMutation.mutateAsync(input).then(() => undefined)}
        disabled={!currentUserQuery.data || createMutation.isPending}
        error={
          createMutation.error && !isUnauthorized(createMutation.error)
            ? organizationErrorMessage(createMutation.error)
            : undefined
        }
      />

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Your organizations</h2>
            <p className="text-sm text-neutral-600">
              Only active memberships returned by the API appear here.
            </p>
          </div>
          <OrganizationSwitcher
            organizations={organizationsQuery.data ?? []}
            value={selectedOrganizationId}
            onChange={setSelectedOrganizationId}
          />
        </div>

        {organizationsQuery.isPending && (
          <p className="text-sm text-neutral-600">Loading organizations…</p>
        )}
        {organizationsQuery.isError && !isUnauthorized(organizationsQuery.error) && (
          <ErrorNotice title="Unable to load organizations" error={organizationsQuery.error} />
        )}
        {organizationsQuery.data?.length === 0 && (
          <p className="rounded-xl border border-dashed p-5 text-sm text-neutral-600">
            No organizations yet. Create your first one above.
          </p>
        )}
        <div className="grid gap-4 lg:grid-cols-2">
          {organizationsQuery.data?.map((organization) => (
            <OrganizationCard
              key={organization.id}
              organization={organization}
              selected={organization.id === selectedOrganizationId}
              updating={updateMutation.isPending}
              archiving={archiveMutation.isPending}
              onUpdate={(input) =>
                updateMutation.mutateAsync({ id: organization.id, input }).then(() => undefined)
              }
              onArchive={() => archiveMutation.mutateAsync(organization.id).then(() => undefined)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function ErrorNotice({ title, error }: { title: string; error: unknown }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <p className="font-medium">{title}</p>
      <p>{organizationErrorMessage(error)}</p>
    </div>
  );
}
