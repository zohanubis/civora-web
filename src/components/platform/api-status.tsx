"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/client";

type SystemPing = {
  service: string;
  status: string;
  timestamp: string;
};

export function ApiStatus() {
  const query = useQuery({
    queryKey: ["platform", "api-status"],
    queryFn: () => apiFetch<SystemPing>("/api/v1/system/ping"),
  });

  return (
    <section className="rounded-xl border border-neutral-200 p-5">
      <h2 className="font-medium">API connection</h2>
      {query.isPending && <p className="mt-2 text-sm text-neutral-500">Checking civora-api…</p>}
      {query.isError && (
        <p className="mt-2 text-sm text-neutral-600">
          API is not reachable. Start civora-api locally and verify NEXT_PUBLIC_API_URL.
        </p>
      )}
      {query.data && (
        <div className="mt-2 text-sm text-neutral-600">
          <p>Status: {query.data.status}</p>
          <p>Service: {query.data.service}</p>
        </div>
      )}
    </section>
  );
}
