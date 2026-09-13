"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { requestPasswordReset, updatePassword } from "@/features/auth/api/auth";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setError("Email is required.");
      return;
    }

    setPending(true);
    setError(undefined);
    setMessage(undefined);

    try {
      const result = await requestPasswordReset(normalizedEmail);
      if (result.error) {
        setError(result.error.message);
        return;
      }
      setMessage("If the account exists, a password reset email has been sent.");
    } catch {
      setError("Unable to reach the authentication service. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={submit} noValidate>
      <div>
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2"
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="text-sm text-emerald-700">
          {message}
        </p>
      )}
      <button
        className="w-full rounded-lg bg-neutral-950 px-4 py-2 text-white disabled:opacity-50"
        disabled={pending}
      >
        {pending ? "Sending…" : "Send reset email"}
      </button>
    </form>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setPending(true);
    setError(undefined);

    try {
      const result = await updatePassword(password);
      if (result.error) {
        setError(result.error.message);
        return;
      }

      router.replace("/app");
      router.refresh();
    } catch {
      setError("Unable to update the password right now. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={submit} noValidate>
      <div>
        <label htmlFor="password" className="text-sm font-medium">
          New password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2"
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <button
        className="w-full rounded-lg bg-neutral-950 px-4 py-2 text-white disabled:opacity-50"
        disabled={pending}
      >
        {pending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
