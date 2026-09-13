"use client";

import { FormEvent, useEffect, useState } from "react";

import type { Organization } from "@/features/organizations/api/organizations";
import {
  type UpdateOrganizationInput,
  updateOrganizationSchema,
} from "@/features/organizations/schemas/organization";
import {
  isUnauthorized,
  organizationErrorMessage,
} from "@/features/organizations/utils/errors";

type OrganizationCardProps = {
  organization: Organization;
  selected: boolean;
  updating: boolean;
  archiving: boolean;
  onUpdate: (input: UpdateOrganizationInput) => Promise<void>;
  onArchive: () => Promise<void>;
};

export function OrganizationCard({
  organization,
  selected,
  updating,
  archiving,
  onUpdate,
  onArchive,
}: OrganizationCardProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(organization.name);
  const [description, setDescription] = useState(organization.description ?? "");
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!editing) {
      setName(organization.name);
      setDescription(organization.description ?? "");
    }
  }, [editing, organization.description, organization.name]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);

    const parsed = updateOrganizationSchema.safeParse({ name, description });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Organization details are invalid.");
      return;
    }

    try {
      await onUpdate(parsed.data);
      setEditing(false);
    } catch (caught) {
      if (!isUnauthorized(caught)) {
        setError(organizationErrorMessage(caught));
      }
    }
  }

  async function archive() {
    if (!window.confirm(`Archive ${organization.name}?`)) {
      return;
    }

    setError(undefined);
    try {
      await onArchive();
    } catch (caught) {
      if (!isUnauthorized(caught)) {
        setError(organizationErrorMessage(caught));
      }
    }
  }

  return (
    <article aria-current={selected ? "true" : undefined} className="rounded-2xl border p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="break-words font-semibold">{organization.name}</h3>
            {selected && (
              <span className="rounded-full border px-2 py-0.5 text-xs">Current context</span>
            )}
          </div>
          <p className="break-all text-sm text-neutral-500">/{organization.slug}</p>
          <p className="mt-2 break-words text-sm text-neutral-600">
            {organization.description || "No description"}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-1 text-xs">
          {organization.status}
        </span>
      </div>

      {organization.status === "ACTIVE" && (
        <div className="mt-4">
          {!editing ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg border px-3 py-1.5 text-sm"
                onClick={() => setEditing(true)}
              >
                Edit
              </button>
              <button
                type="button"
                className="rounded-lg border px-3 py-1.5 text-sm"
                disabled={archiving}
                onClick={archive}
              >
                {archiving ? "Archiving…" : "Archive"}
              </button>
            </div>
          ) : (
            <form className="space-y-3" onSubmit={submit} noValidate>
              <input
                aria-label="Organization name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-lg border px-3 py-2"
              />
              <textarea
                aria-label="Organization description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full rounded-lg border px-3 py-2"
                rows={3}
              />
              {error && (
                <p role="alert" className="text-sm text-red-700">
                  {error}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <button
                  className="rounded-lg bg-neutral-950 px-3 py-1.5 text-sm text-white"
                  disabled={updating}
                >
                  {updating ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  className="rounded-lg border px-3 py-1.5 text-sm"
                  onClick={() => {
                    setError(undefined);
                    setEditing(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
          {error && !editing && (
            <p role="alert" className="mt-2 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>
      )}
    </article>
  );
}
