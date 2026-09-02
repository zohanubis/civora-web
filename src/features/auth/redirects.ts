export function safeLocalPath(value: string | null, fallback: string): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }

  try {
    const base = new URL("http://civora.local");
    const resolved = new URL(value, base);
    if (resolved.origin !== base.origin) {
      return fallback;
    }
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return fallback;
  }
}
