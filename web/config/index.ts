// config/index.ts

const DEFAULT_SUPABASE_SERVER_URL = "http://kong:8000"
const DEFAULT_SUPABASE_PUBLIC_PATH = "/api/supabase"
const DEFAULT_PUBLIC_HOST = "http://localhost:3000"

let _supabasePublicUrl: string | null = null

function isBrowser(): boolean {
  return typeof window !== "undefined"
}

function getCurrentOrigin(): string {
  if (isBrowser()) {
    return window.location.origin
  }

  try {
    const headersList = require("next/headers").headers
    const headers = headersList()
    const protocol = headers.get("x-forwarded-proto") || "http"
    const host =
      headers.get("x-forwarded-host") ||
      headers.get("host") ||
      "localhost:3000"

    return `${protocol}://${host}`
  } catch {
    return DEFAULT_PUBLIC_HOST
  }
}

function normalizePublicUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url
  if (url.startsWith("/")) return `${getCurrentOrigin()}${url}`

  return `${getCurrentOrigin()}/${url.replace(/^\/+/, "")}`
}

function getSupabasePublicUrl(): string {
  if (_supabasePublicUrl !== null) return _supabasePublicUrl

  const configuredUrl =
    process.env.SUPABASE_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_URL

  _supabasePublicUrl = configuredUrl
    ? normalizePublicUrl(configuredUrl)
    : `${getCurrentOrigin()}${DEFAULT_SUPABASE_PUBLIC_PATH}`

  return _supabasePublicUrl
}

const SUPABASE_SERVER_URL: string =
  process.env.SUPABASE_SERVER_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_SERVER_URL ||
  DEFAULT_SUPABASE_SERVER_URL

const OLLAMA_URL: string = process.env.NEXT_PUBLIC_OLLAMA_URL || ""
const OLLAMA_API_KEY: string = process.env.NEXT_PUBLIC_OLLAMA_API_KEY || ""
const SUPABASE_PUBLIC_URL: string = getSupabasePublicUrl()
const SUPABASE_AUTH_STORAGE_KEY: string =
  process.env.NEXT_PUBLIC_SUPABASE_AUTH_STORAGE_KEY ||
  "sb-chatbot-ui-auth-token"

const SUPABASE_ANON_KEY: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SUPABASE_SERVICE_ROLE_KEY: string = process.env.SUPABASE_SERVICE_ROLE_KEY!

export {
  OLLAMA_URL,
  OLLAMA_API_KEY,
  SUPABASE_SERVER_URL,
  SUPABASE_PUBLIC_URL,
  SUPABASE_AUTH_STORAGE_KEY,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
}

// HOW TO USE:
// import { SUPABASE_SERVER_URL, SUPABASE_PUBLIC_URL } from '@/config'