import { Brand } from "@/components/ui/brand"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SubmitButton } from "@/components/ui/submit-button"
import { SignInButton } from "@/components/ui/signin-button"
import { SignUpButton } from "@/components/ui/signup-button"
import { createClient } from "@/lib/supabase/server"
import { Database } from "@/supabase/types"
import { createServerClient } from "@supabase/ssr"
import { get } from "@vercel/edge-config"
import { Metadata } from "next"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import ResetPassword from "@/components/ui/resetpassword"
import { getEnvVarOrEdgeConfigValue } from "@/utils/getEnvVarOrEdgeConfigValue"
import { SUPABASE_SERVER_URL, SUPABASE_ANON_KEY } from "@/config"

export const metadata: Metadata = {
  title: "Login"
}

export default async function Login({
  searchParams
}: {
  searchParams: { message: string }
}) {
  const cookieStore = cookies()
  const supabase = createServerClient<Database>(
    SUPABASE_SERVER_URL!,
    SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        }
      }
    }
  )
  const session = (await supabase.auth.getSession()).data.session

  if (session) {
    const { data: homeWorkspace, error } = await supabase
      .from("workspaces")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("is_home", true)
      .single()

    if (!homeWorkspace) {
      throw new Error(error.message)
    }

    return redirect(`/${homeWorkspace.id}/c`)
  }

  const signIn = async (formData: FormData) => {
    "use server"

    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return redirect(`/login?message=${error.message}`)
    }

    const { data: homeWorkspace, error: homeWorkspaceError } = await supabase
      .from("workspaces")
      .select("*")
      .eq("user_id", data.user.id)
      .eq("is_home", true)
      .single()

    if (!homeWorkspace) {
      throw new Error(
        homeWorkspaceError?.message || "An unexpected error occurred"
      )
    }

    return redirect(`/${homeWorkspace.id}/c`)
  }

  const signUp = async (formData: FormData) => {
    "use server"

    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const emailDomainWhitelistPatternsString = await getEnvVarOrEdgeConfigValue(
      "EMAIL_DOMAIN_WHITELIST"
    )
    const emailDomainWhitelist = emailDomainWhitelistPatternsString?.trim()
      ? emailDomainWhitelistPatternsString?.split(",")
      : []
    const emailWhitelistPatternsString =
      await getEnvVarOrEdgeConfigValue("EMAIL_WHITELIST")
    const emailWhitelist = emailWhitelistPatternsString?.trim()
      ? emailWhitelistPatternsString?.split(",")
      : []

    // If there are whitelist patterns, check if the email is allowed to sign up
    if (emailDomainWhitelist.length > 0 || emailWhitelist.length > 0) {
      const domainMatch = emailDomainWhitelist?.includes(email.split("@")[1])
      const emailMatch = emailWhitelist?.includes(email)
      if (!domainMatch && !emailMatch) {
        return redirect(
          `/login?message=Email ${email} is not allowed to sign up.`
        )
      }
    }

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // USE IF YOU WANT TO SEND EMAIL VERIFICATION, ALSO CHANGE TOML FILE
        // emailRedirectTo: `${origin}/auth/callback`
      }
    })

    if (error) {
      console.error(error)
      return redirect(`/login?message=${error.message}`)
    }

    // return redirect("/setup")

    // USE IF YOU WANT TO SEND EMAIL VERIFICATION, ALSO CHANGE TOML FILE
    return redirect("/login?message=Check email to continue sign in process")
  }

  const handleResetPassword = async (formData: FormData) => {
    "use server"

    const origin = headers().get("origin")
    const email = formData.get("email") as string
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/login/password`
    })

    if (error) {
      return redirect(`/login?message=${error.message}`)
    }

    return redirect("/login?message=Check email to reset password")
  }

  return (
    <div className="flex w-full flex-1 flex-col justify-center px-8 py-8">
      <div className="w-full max-w-md mx-auto bg-card rounded-lg shadow-md p-6">
        <form
          className="animate-in text-foreground flex flex-col gap-6"
          action={signIn}
        >
          <div className="flex justify-center mb-4">
            <Brand />
          </div>
          <h1 className="text-2xl font-bold text-center">Login</h1>

          <div className="space-y-4">
            <div>
              <Label className="text-md" htmlFor="email" i18nKey="Email" />
              <Input
                className="mt-1 rounded-md border bg-inherit px-4 py-2 w-full"
                id="email"
                name="email"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <Label className="text-md" htmlFor="password" i18nKey="Password" />
              <Input
                className="mt-1 rounded-md border bg-inherit px-4 py-2 w-full"
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="space-y-2">
            <SignInButton className="w-full rounded-md bg-blue-700 px-4 py-2 text-white"></SignInButton>

            <SignUpButton
              formAction={signUp}
              className="w-full border-foreground/20 rounded-md border px-4 py-2"
            ></SignUpButton>
          </div>

          <ResetPassword handleResetPassword={handleResetPassword} />
          {searchParams?.message && (
            <p className="bg-foreground/10 text-foreground mt-4 p-4 text-center rounded-md">
              {searchParams.message}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
