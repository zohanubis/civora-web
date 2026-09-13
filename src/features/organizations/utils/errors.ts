import { ApiError } from "@/lib/api/client";

export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

export function organizationErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.problem && typeof error.problem === "object") {
    const detail = "detail" in error.problem ? error.problem.detail : undefined;
    if (typeof detail === "string") {
      return detail;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error.";
}
