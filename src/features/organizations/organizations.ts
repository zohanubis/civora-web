import { authenticatedApiFetch } from "@/lib/api/authenticated-client";

export type Organization = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  status: "ACTIVE" | "ARCHIVED";
  role: "OWNER" | "ADMIN" | "MEMBER";
  createdAt: string;
  updatedAt: string;
};

export async function listOrganizations(): Promise<Organization[]> {
  return authenticatedApiFetch<Organization[]>("/api/v1/organizations");
}

export async function getOrganization(id: string): Promise<Organization> {
  return authenticatedApiFetch<Organization>(`/api/v1/organizations/${id}`);
}

export async function createOrganization(input: {
  name: string;
  slug?: string;
  description?: string;
}): Promise<Organization> {
  return authenticatedApiFetch<Organization>("/api/v1/organizations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function updateOrganization(
  id: string,
  input: { name?: string; description?: string },
): Promise<Organization> {
  return authenticatedApiFetch<Organization>(`/api/v1/organizations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function archiveOrganization(id: string): Promise<Organization> {
  return authenticatedApiFetch<Organization>(`/api/v1/organizations/${id}/archive`, {
    method: "POST",
  });
}
