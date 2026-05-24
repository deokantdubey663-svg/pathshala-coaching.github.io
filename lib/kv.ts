import { kv } from "@vercel/kv"

const KV_ENABLED = Boolean(process.env.VERCEL_KV_URL && process.env.VERCEL_KV_TOKEN)

export function isRemoteStorageEnabled() {
  return KV_ENABLED
}

export async function getRemoteData<T>(key: string, fallback: T): Promise<T> {
  if (!KV_ENABLED) {
    return fallback
  }

  try {
    const value = await kv.get<T>(key)
    return (value ?? fallback) as T
  } catch {
    return fallback
  }
}

export async function setRemoteData<T>(key: string, value: T): Promise<boolean> {
  if (!KV_ENABLED) {
    return false
  }

  try {
    await kv.set(key, value)
    return true
  } catch {
    return false
  }
}
