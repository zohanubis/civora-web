"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  createOrganizationSchema,
  type CreateOrganizationInput,
} from "@/features/organizations/schemas/organization";

type CreateOrganizationFormProps = {
  onCreate: (input: CreateOrganizationInput) => Promise<void>;
  disabled?: boolean;
  error?: string;
};

export function CreateOrganizationForm({ onCreate, disabled, error }: CreateOrganizationFormProps) {
  const form = useForm<CreateOrganizationInput>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: { slug: "", name: "", description: "" },
  });

  async function submit(values: CreateOrganizationInput) {
    await onCreate(values);
    form.reset();
  }

  return (
    <form onSubmit={form.handleSubmit(submit)} className="space-y-4 rounded-2xl border p-5" noValidate>
      <div>
        <h2 className="text-lg font-semibold">Create organization</h2>
        <p className="text-sm text-neutral-600">Your account becomes the initial OWNER automatically.</p>
      </div>
      <div>
        <label htmlFor="organization-name" className="text-sm font-medium">Name</label>
        <input id="organization-name" className="mt-1 w-full rounded-lg border px-3 py-2" {...form.register("name")} />
        {form.formState.errors.name && <p className="mt-1 text-sm text-red-700">{form.formState.errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor="organization-slug" className="text-sm font-medium">Slug</label>
        <input id="organization-slug" className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="community-one" {...form.register("slug")} />
        {form.formState.errors.slug && <p className="mt-1 text-sm text-red-700">{form.formState.errors.slug.message}</p>}
      </div>
      <div>
        <label htmlFor="organization-description" className="text-sm font-medium">Description</label>
        <textarea id="organization-description" rows={3} className="mt-1 w-full rounded-lg border px-3 py-2" {...form.register("description")} />
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={disabled || form.formState.isSubmitting}
        className="rounded-lg bg-neutral-950 px-4 py-2 text-white disabled:opacity-50"
      >
        {form.formState.isSubmitting ? "Creating…" : "Create organization"}
      </button>
    </form>
  );
}
