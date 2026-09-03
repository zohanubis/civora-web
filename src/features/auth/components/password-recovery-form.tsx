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
    setPending(true);
    setError(undefined);
    setMessage(undefined);
    const result = await requestPasswordReset(email.trim());
    setPending(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    setMessage("If the account exists, a password reset email has been sent.");
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div>
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2"
        />
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      {message && <p className="text-sm text-emerald-700">{message}</p>}
      <button className="w-full rounded-lg bg-neutral-950 px-4 py-2 text-white disabled:opacity-50" disabled={pending}>
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
    const result = await updatePassword(password);
    setPending(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }

    router.replace("/app");
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div>
        <label htmlFor="password" className="text-sm font-medium">New password</label>
        <input
          id="password"
          type="password"
          minLength={8}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2"
        />
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button className="w-full rounded-lg bg-neutral-950 px-4 py-2 text-white disabled:opacity-50" disabled={pending}>
        {pending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
