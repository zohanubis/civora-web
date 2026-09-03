"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { signIn, signUp } from "@/features/auth/api/auth";

const authSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must contain at least 8 characters."),
});

type AuthValues = z.infer<typeof authSchema>;

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string>();
  const [serverError, setServerError] = useState<string>();
  const form = useForm<AuthValues>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: AuthValues) {
    setMessage(undefined);
    setServerError(undefined);

    const result =
      mode === "sign-in"
        ? await signIn(values.email, values.password)
        : await signUp(values.email, values.password);

    if (result.error) {
      setServerError(result.error.message);
      return;
    }

    if (mode === "sign-up" && !result.data.session) {
      setMessage("Check your email to confirm your account, then continue to Civora.");
      return;
    }

    router.replace("/app");
    router.refresh();
  }

  const isSignIn = mode === "sign-in";

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="mt-1 w-full rounded-lg border px-3 py-2"
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="mt-1 text-sm text-red-700">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete={isSignIn ? "current-password" : "new-password"}
          className="mt-1 w-full rounded-lg border px-3 py-2"
          {...form.register("password")}
        />
        {form.formState.errors.password && (
          <p className="mt-1 text-sm text-red-700">{form.formState.errors.password.message}</p>
        )}
      </div>

      {serverError && <p className="text-sm text-red-700">{serverError}</p>}
      {message && <p className="text-sm text-emerald-700">{message}</p>}

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="w-full rounded-lg bg-neutral-950 px-4 py-2 text-white disabled:opacity-50"
      >
        {form.formState.isSubmitting ? "Please wait…" : isSignIn ? "Sign in" : "Create account"}
      </button>

      <div className="flex justify-between text-sm">
        <Link className="underline" href={isSignIn ? "/sign-up" : "/sign-in"}>
          {isSignIn ? "Create an account" : "Already have an account?"}
        </Link>
        {isSignIn && (
          <Link className="underline" href="/forgot-password">
            Forgot password?
          </Link>
        )}
      </div>
    </form>
  );
}
