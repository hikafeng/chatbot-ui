import { Database } from "@/supabase/types"
import { createBrowserClient } from "@supabase/ssr"
import { SUPABASE_PUBLIC_URL, SUPABASE_ANON_KEY } from "@/config"

console.log("SUPABASE_PUBLIC_URL: ", SUPABASE_PUBLIC_URL)
export const supabase = createBrowserClient<Database>(
  SUPABASE_PUBLIC_URL!,
  SUPABASE_ANON_KEY!
)
