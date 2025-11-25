import { FC, useEffect, useState } from "react"
import { getEnvVarOrEdgeConfigValue } from "@/utils/getEnvVarOrEdgeConfigValue"

interface FinishStepProps {
  displayName: string
}

export const FinishStep: FC<FinishStepProps> = ({ displayName }) => {
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
    <div className="space-y-4">
      <div>
        Welcome to {siteName}
        {displayName.length > 0 ? `, ${displayName.split(" ")[0]}` : null}!
      </div>

      <div>Click next to start chatting.</div>
    </div>
  )
}
