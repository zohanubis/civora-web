import { authenticatedApiFetch } from "@/lib/api/authenticated-client";

export type CurrentUser = {
  id: string;
  email: string;
  emailVerified: boolean;
};

export function getCurrentUser(): Promise<CurrentUser> {
  return authenticatedApiFetch<CurrentUser>("/api/v1/me");
}
