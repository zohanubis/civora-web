import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export async function signIn(email: string, password: string) {
  return getSupabaseBrowserClient().auth.signInWithPassword({ email, password });
}

export async function signUp(email: string, password: string) {
  return getSupabaseBrowserClient().auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback?next=/app`,
    },
  });
}

export async function requestPasswordReset(email: string) {
  return getSupabaseBrowserClient().auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
  });
}

export async function updatePassword(password: string) {
  return getSupabaseBrowserClient().auth.updateUser({ password });
}

export async function signOut() {
  return getSupabaseBrowserClient().auth.signOut();
}
