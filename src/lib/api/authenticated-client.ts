import { createClient } from "@/lib/supabase/server";

import { apiFetch } from "./client";

export class AuthenticationRequiredError extends Error {
  constructor() {
    super("A verified Civora authentication session is required");
    this.name = "AuthenticationRequiredError";
  }
}

export async function authenticatedApiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claimsData?.claims) {
    throw new AuthenticationRequiredError();
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (sessionError || !accessToken) {
    throw new AuthenticationRequiredError();
  }

  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);

  return apiFetch<T>(path, {
    ...init,
    headers: Object.fromEntries(headers.entries()),
  });
}
