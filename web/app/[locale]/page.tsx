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
  const [h1Content, setH1Content] = useState("The open source AI chat app for everyone.")
  useEffect(() => {
    const fetchEnvVar = async () => {
      const envValue = await getEnvVarOrEdgeConfigValue("NEXT_PUBLIC_SITE_NAME")
      if (envValue) {
        setSiteName(envValue)
      }
      const h1envValue = await getEnvVarOrEdgeConfigValue("NEXT_PUBLIC_SITE_H1CONTENT")
      console.log("h1envValue", h1envValue)
      console.log("process.env.NEXT_PUBLIC_SITE_H1CONTENT", process.env.NEXT_PUBLIC_SITE_H1CONTENT)
      if (h1envValue) {
        setH1Content(h1envValue)
      }
    }

    fetchEnvVar()
  }, [])
  return (
    <div className="flex size-full flex-col items-center justify-center p-8">
      <div>
        <ChatbotUISVG theme={theme === "dark" ? "dark" : "light"} scale={0.3} />
      </div>
      <div className="text-center">
        <div className="mt-4 text-4xl font-bold">{siteName}</div>
        <h1 className="mt-2 text-lg">{h1Content}</h1>
      </div>

      <Link
        className="mt-8 flex w-[200px] items-center justify-center rounded-md bg-blue-500 p-2 font-semibold"
        href="/login"
      >
        {t("Start")}
        {/* <IconArrowRight className="ml-1" size={20} /> */}
      </Link>
    </div>
  )
}
