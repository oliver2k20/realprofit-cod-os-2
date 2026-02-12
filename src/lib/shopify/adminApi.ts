export async function shopifyRequest<T>(
  shopDomain: string,
  accessToken: string,
  path: string,
  init?: RequestInit
): Promise<T> {
  const url = `https://${shopDomain}/admin/api/2024-10${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "X-Shopify-Access-Token": accessToken,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify API error ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}
