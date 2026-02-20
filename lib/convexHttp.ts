const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

type ConvexResponse<T> = { value: T };

export async function convexQuery<T>(path: string, args: Record<string, unknown> = {}): Promise<T | null> {
  if (!CONVEX_URL) return null;
  try {
    const res = await fetch(`${CONVEX_URL}/api/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, args }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as ConvexResponse<T>;
    return data?.value ?? null;
  } catch {
    return null;
  }
}

export async function convexMutation<T>(path: string, args: Record<string, unknown> = {}): Promise<T | null> {
  if (!CONVEX_URL) return null;
  try {
    const res = await fetch(`${CONVEX_URL}/api/mutation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, args }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as ConvexResponse<T>;
    return data?.value ?? null;
  } catch {
    return null;
  }
}
