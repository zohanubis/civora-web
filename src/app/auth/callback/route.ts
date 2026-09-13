import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const CALLBACK_DESTINATIONS = new Set(["/app", "/reset-password"]);

function safeNextPath(candidate: string | null): string {
  return candidate && CALLBACK_DESTINATIONS.has(candidate) ? candidate : "/app";
}

function redirectWithoutCaching(target: URL) {
  const response = NextResponse.redirect(target);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNextPath(url.searchParams.get("next"));

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return redirectWithoutCaching(new URL(next, url.origin));
    }
  }

  return redirectWithoutCaching(new URL("/sign-in?error=auth-callback", url.origin));
}
