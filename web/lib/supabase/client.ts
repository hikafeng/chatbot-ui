import { createBrowserClient } from "@supabase/ssr"
import { SUPABASE_PUBLIC_URL, SUPABASE_ANON_KEY } from "@/config"
export const createClient = () =>
  createBrowserClient(SUPABASE_PUBLIC_URL!, SUPABASE_ANON_KEY!)
