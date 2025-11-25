"use client"

import Link from "next/link"
import { FC, useEffect, useState } from "react"
import { ChatbotUISVG } from "../icons/chatbotui-svg"
import { getEnvVarOrEdgeConfigValue } from "@/utils/getEnvVarOrEdgeConfigValue"

interface BrandProps {
  theme?: "dark" | "light"
}

export const Brand: FC<BrandProps> = ({ theme = "dark" }) => {
  const [siteUrl, setSiteUrl] = useState("https://chat.hikafeng.com")

  useEffect(() => {
    const fetchEnvVar = async () => {
      const envValue = await getEnvVarOrEdgeConfigValue("NEXT_PUBLIC_SITE_URL")
      if (envValue) {
        setSiteUrl(envValue)
      }
    }

    fetchEnvVar()
  }, [])

  return (
    <Link
      className="flex cursor-pointer flex-col items-center hover:opacity-50"
      href={siteUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="mb-2">
        <ChatbotUISVG theme={theme === "dark" ? "dark" : "light"} scale={0.3} />
      </div>
    </Link>
  )
}
