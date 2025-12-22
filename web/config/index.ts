// config/index.ts

let _supabasePublicUrl: string | null = null
function getDynamicHostUrl(): string {
  try {
    // 仅服务端请求中 headers() 可用
    const headersList = require('next/headers').headers
    const headers = headersList()
    const protocol = headers.get('x-forwarded-proto') || 'http'
    const host = headers.get('host') || 'localhost:3000'
    const ipPortReg = /^(\d{1,3}\.){3}\d{1,3}:\d+$/
    const localhostPortReg = /^localhost:\d+$/

    if (protocol === 'http') {
      if (ipPortReg.test(host)) {
        // IP:端口，转为 http://IP:8000
        const ip = host.split(':')[0]
        return `http://${ip}:8000`
      } else if (localhostPortReg.test(host)) {
        // localhost:端口，保留端口
        return `http://${host}`
      }
    }
    // 其他情况 fallback
    return 'http://localhost:8000'
  } catch {
    // fallback: 构建时或非请求上下文
    return 'http://localhost:8000'
  }
}

function getSupabasePublicUrl(): string {
  if (_supabasePublicUrl !== null) return _supabasePublicUrl

  if (process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_URL) {
    _supabasePublicUrl = process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_URL
  } else {
    _supabasePublicUrl = getDynamicHostUrl()
  }
  return _supabasePublicUrl
}

const SUPABASE_SERVER_URL: string =
  process.env.NEXT_PUBLIC_SUPABASE_SERVER_URL || 'http://kong:8000'

const OLLAMA_URL: string = process.env.NEXT_PUBLIC_OLLAMA_URL || ''
const OLLAMA_API_KEY: string = process.env.NEXT_PUBLIC_OLLAMA_API_KEY || ''
const SUPABASE_PUBLIC_URL: string = getSupabasePublicUrl()

const SUPABASE_ANON_KEY: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SUPABASE_SERVICE_ROLE_KEY: string = process.env.SUPABASE_SERVICE_ROLE_KEY!

export {
  OLLAMA_URL,
  OLLAMA_API_KEY,
  SUPABASE_SERVER_URL,
  SUPABASE_PUBLIC_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
}

// HOW TO USE:
// import { SUPABASE_SERVER_URL, SUPABASE_PUBLIC_URL } from '@/config'