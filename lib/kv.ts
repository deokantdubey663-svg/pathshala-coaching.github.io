import { kv } from "@vercel/kv"

const VERCEL_KV_ENABLED = Boolean(process.env.VERCEL_KV_URL && process.env.VERCEL_KV_TOKEN)
const UPSTASH_ENABLED = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
)

function getUpstashUrl(path: string) {
  return `${process.env.UPSTASH_REDIS_REST_URL}${path}`
}

async function upstashFetch(path: string, method: "GET" | "POST", body?: object) {
  const url = getUpstashUrl(path)
  const headers: Record<string, string> = {
    Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
    "Content-Type": "application/json",
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    throw new Error(`Upstash request failed: ${response.status}`)
  }

  return response.json()
}

export function isRemoteStorageEnabled() {
  return VERCEL_KV_ENABLED || UPSTASH_ENABLED
}

export async function getRemoteData<T>(key: string, fallback: T): Promise<T> {
  if (VERCEL_KV_ENABLED) {
    try {
      const value = await kv.get<T>(key)
      return (value ?? fallback) as T
    } catch {
      return fallback
    }
  }

  if (UPSTASH_ENABLED) {
    try {
      const result = await upstashFetch<{ result: string | null }>(`/get/${encodeURIComponent(key)}`, "GET")
      if (!result?.result) {
        return fallback
      }
      return JSON.parse(result.result) as T
    } catch {
      return fallback
    }
  }

  return fallback
}

export async function setRemoteData<T>(key: string, value: T): Promise<boolean> {
  if (VERCEL_KV_ENABLED) {
    try {
      await kv.set(key, value)
      return true
    } catch {
      return false
    }
  }

  if (UPSTASH_ENABLED) {
    try {
      const payload = { value: JSON.stringify(value) }
      await upstashFetch(`/set/${encodeURIComponent(key)}`, "POST", payload)
      return true
    } catch {
      return false
    }
  }

  return false
}
