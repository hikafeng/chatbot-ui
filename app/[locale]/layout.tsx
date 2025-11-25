import { Toaster } from "@/components/ui/sonner"
import { GlobalState } from "@/components/utility/global-state"
import { Providers } from "@/components/utility/providers"
import TranslationsProvider from "@/components/utility/translations-provider"
import initTranslations from "@/lib/i18n"
import { Database } from "@/supabase/types"
import { createServerClient } from "@supabase/ssr"
import { Metadata, Viewport } from "next"
import localFont from "next/font/local"
import { cookies } from "next/headers"
import { ReactNode } from "react"
import "./globals.css"
import "katex/dist/katex.min.css"
import { Analytics } from "@vercel/analytics/react"
import { getEnvVarOrEdgeConfigValue } from "@/utils/getEnvVarOrEdgeConfigValue"
import { SUPABASE_SERVER_URL, SUPABASE_ANON_KEY } from "@/config"
const inter = localFont({
  src: "./fonts/Inter-Regular.woff2",
  display: "swap"
})
const NEXT_PUBLIC_SITE_URL_STR =
  (await getEnvVarOrEdgeConfigValue("NEXT_PUBLIC_SITE_URL")) ||
  "https://chat.hikafeng.com"
const NEXT_PUBLIC_SITE_NAME_STR =
  (await getEnvVarOrEdgeConfigValue("NEXT_PUBLIC_SITE_NAME")) || "ChatbotUI"
const ENALBE_VERCEL_ANALYTICS =
  (await getEnvVarOrEdgeConfigValue("ENALBE_VERCEL_ANALYTICS")) || "false"
const APP_NAME = NEXT_PUBLIC_SITE_NAME_STR
const APP_DEFAULT_TITLE = NEXT_PUBLIC_SITE_NAME_STR
const APP_TITLE_TEMPLATE = "%s - " + NEXT_PUBLIC_SITE_NAME_STR
const APP_DESCRIPTION = NEXT_PUBLIC_SITE_NAME_STR + " PWA!"

interface RootLayoutProps {
  children: ReactNode
  params: {
    locale: string
  }
}
export const metadata: Metadata = {
  metadataBase: new URL(NEXT_PUBLIC_SITE_URL_STR),
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black",
    title: APP_DEFAULT_TITLE
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE
    },
    description: APP_DESCRIPTION
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE
    },
    description: APP_DESCRIPTION
  }
}

export const viewport: Viewport = {
  themeColor: "#000000"
}

const i18nNamespaces = ["translation"]

export default async function RootLayout({
  children,
  params: { locale }
}: RootLayoutProps) {
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

  const { t, resources } = await initTranslations(locale, i18nNamespaces)
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {ENALBE_VERCEL_ANALYTICS === "true" && <Analytics />}
        <Providers attribute="class" defaultTheme="light">
          <TranslationsProvider
            namespaces={i18nNamespaces}
            locale={locale}
            resources={resources}
          >
            <Toaster richColors position="top-center" duration={3000} />
            <div className="bg-background text-foreground flex h-dvh flex-col items-center overflow-x-auto">
              {session ? <GlobalState>{children}</GlobalState> : children}
            </div>
          </TranslationsProvider>
        </Providers>
      </body>
    </html>
  )
}
