"use client"

import { ChatbotUISVG } from "@/components/icons/chatbotui-svg"
import { IconArrowRight } from "@tabler/icons-react"
import { useTheme } from "next-themes"
import { useTranslation } from "react-i18next"
import { getEnvVarOrEdgeConfigValue } from "@/utils/getEnvVarOrEdgeConfigValue"
import { FC, useEffect, useState } from "react"

import Link from "next/link"

export default function HomePage() {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const [siteName, setSiteName] = useState("ChatbotUI")

  useEffect(() => {
    const fetchEnvVar = async () => {
      const envValue = await getEnvVarOrEdgeConfigValue("NEXT_PUBLIC_SITE_NAME")
      if (envValue) {
        setSiteName(envValue)
      }
    }

    fetchEnvVar()
  }, [])
  return (
    <div className="flex size-full flex-col items-center justify-center">
      <div>
        <ChatbotUISVG theme={theme === "dark" ? "dark" : "light"} scale={0.3} />
      </div>

      <div className="mt-2 text-4xl font-bold">{siteName}</div>

      <Link
        className="mt-4 flex w-[200px] items-center justify-center rounded-md bg-blue-500 p-2 font-semibold"
        href="/login"
      >
        {t("Start")}
        {/* <IconArrowRight className="ml-1" size={20} /> */}
      </Link>
    </div>
  )
}
