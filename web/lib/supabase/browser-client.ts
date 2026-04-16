import { Database } from "@/supabase/types"
import { createBrowserClient } from "@supabase/ssr"
import {
  SUPABASE_PUBLIC_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_AUTH_STORAGE_KEY
} from "@/config"

export const supabase = createBrowserClient<Database>(
  SUPABASE_PUBLIC_URL!,
  SUPABASE_ANON_KEY!,
  {
    cookies: {},
    auth: {
      storageKey: SUPABASE_AUTH_STORAGE_KEY
    }
  }
)
