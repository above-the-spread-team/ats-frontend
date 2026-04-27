function getMaintenanceBypassToken(): string | null {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)__ats_dev_pub=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function backendFetch(
  input: string,
  init?: RequestInit,
): Promise<Response> {
  const bypassToken = getMaintenanceBypassToken();
  if (!bypassToken) return fetch(input, init);

  const existingHeaders = new Headers(init?.headers);
  existingHeaders.set("X-Maintenance-Bypass", bypassToken);
  return fetch(input, { ...init, headers: existingHeaders });
}
