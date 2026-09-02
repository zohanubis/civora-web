"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  archiveOrganization,
  createOrganization,
  updateOrganization,
} from "./organizations";

export async function createOrganizationAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const organization = await createOrganization({
    name,
    slug: slug || undefined,
    description: description || undefined,
  });
  revalidatePath("/organizations");
  redirect(`/organizations/${organization.id}`);
}

export async function updateOrganizationAction(id: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  await updateOrganization(id, {
    name: name || undefined,
    description,
  });
  revalidatePath(`/organizations/${id}`);
  revalidatePath("/organizations");
}

export async function archiveOrganizationAction(id: string) {
  await archiveOrganization(id);
  revalidatePath(`/organizations/${id}`);
  revalidatePath("/organizations");
}
