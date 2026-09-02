"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { emailSchema, resetPasswordSchema, signInSchema, signUpSchema } from "./schemas";

const DEFAULT_SITE_URL = "http://localhost:3000";

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL).replace(/\/$/, "");
}

function value(formData: FormData, key: string): string {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw : "";
}

export async function signIn(formData: FormData) {
  const parsed = signInSchema.safeParse({
    email: value(formData, "email"),
    password: value(formData, "password"),
  });
  if (!parsed.success) {
    redirect("/sign-in?error=invalid-input");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    redirect("/sign-in?error=invalid-credentials");
  }

  redirect("/account");
}

export async function signUp(formData: FormData) {
  const parsed = signUpSchema.safeParse({
    email: value(formData, "email"),
    password: value(formData, "password"),
  });
  if (!parsed.success) {
    redirect("/sign-up?error=invalid-input");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    ...parsed.data,
    options: {
      emailRedirectTo: `${siteUrl()}/auth/confirm`,
    },
  });
  if (error) {
    redirect("/sign-up?error=sign-up-failed");
  }

  redirect("/sign-in?message=check-email");
}

export async function forgotPassword(formData: FormData) {
  const parsed = emailSchema.safeParse(value(formData, "email"));
  if (!parsed.success) {
    redirect("/forgot-password?error=invalid-input");
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${siteUrl()}/auth/confirm?next=/reset-password`,
  });

  redirect("/forgot-password?message=check-email");
}

export async function resetPassword(formData: FormData) {
  const parsed = resetPasswordSchema.safeParse({
    password: value(formData, "password"),
  });
  if (!parsed.success) {
    redirect("/reset-password?error=invalid-input");
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claimsData?.claims) {
    redirect("/auth/error?code=invalid-recovery-session");
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    redirect("/reset-password?error=update-failed");
  }

  redirect("/account?message=password-updated");
}
