import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function safeNextPath(candidate: string | null): string {
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return "/app";
  }
  return candidate;
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
