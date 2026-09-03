import { z } from "zod";

const slugPattern = /^[A-Za-z0-9]+(-[A-Za-z0-9]+)*$/;

export const createOrganizationSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(3, "Slug must contain at least 3 characters.")
    .max(80, "Slug must contain at most 80 characters.")
    .regex(slugPattern, "Use letters, numbers, and single hyphens only."),
  name: z.string().trim().min(1, "Organization name is required.").max(160),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
});

export const updateOrganizationSchema = z.object({
  name: z.string().trim().min(1, "Organization name is required.").max(160),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
