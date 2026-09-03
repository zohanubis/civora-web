import { apiFetch } from "@/lib/api/client";
import type {
  CreateOrganizationInput,
  UpdateOrganizationInput,
} from "@/features/organizations/schemas/organization";

export type CurrentUser = {
  id: string;
  displayName: string | null;
  status: "ACTIVE";
};

export type Organization = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  status: "ACTIVE" | "ARCHIVED";
};

export function getCurrentUser(accessToken: string) {
  return apiFetch<CurrentUser>("/api/v1/me", { accessToken });
}

export function listOrganizations(accessToken: string) {
  return apiFetch<Organization[]>("/api/v1/organizations", { accessToken });
}

export function createOrganization(accessToken: string, input: CreateOrganizationInput) {
  return apiFetch<Organization>("/api/v1/organizations", {
    method: "POST",
    accessToken,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      slug: input.slug,
      name: input.name,
      description: input.description || null,
    }),
  });
}

export function updateOrganization(
  accessToken: string,
  organizationId: string,
  input: UpdateOrganizationInput,
) {
  return apiFetch<Organization>(`/api/v1/organizations/${organizationId}`, {
    method: "PATCH",
    accessToken,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: input.name,
      description: input.description || null,
    }),
  });
}

export function archiveOrganization(accessToken: string, organizationId: string) {
  return apiFetch<void>(`/api/v1/organizations/${organizationId}/archive`, {
    method: "POST",
    accessToken,
  });
}
