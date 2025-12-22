import { cn } from "@/lib/utils"
import mistral from "@/public/providers/mistral.png"
import groq from "@/public/providers/groq.png"
import perplexity from "@/public/providers/perplexity.png"
import { ModelProvider } from "@/types"
import { IconSparkles } from "@tabler/icons-react"
import { useTheme } from "next-themes"
import Image from "next/image"
import { FC, HTMLAttributes } from "react"
import {
  Anthropic,
  Gemini,
  OpenAI,
  DeepSeek,
  Ollama,
  Mistral,
  OpenRouter
} from "@lobehub/icons"
interface ModelIconProps extends HTMLAttributes<HTMLDivElement> {
  provider: ModelProvider
  height: number
  width: number
}

export const ModelIcon: FC<ModelIconProps> = ({
  provider,
  height,
  width,
  ...props
}) => {
  const { theme } = useTheme()

  switch (provider as ModelProvider) {
    case "openai":
      return (
        <OpenAI
          className={cn(
            "rounded-sm bg-white p-1 text-black",
            props.className,
            theme === "dark" ? "bg-white" : "border-DEFAULT border-black"
          )}
          width={width}
          height={height}
        />
      )
    case "openrouter":
      return (
        <OpenRouter
          className={cn(
            "rounded-sm bg-transparent ",
            props.className,
            theme === "dark" ? "text-white" : "text-black"
          )}
          width={width}
          height={height}
        />
      )
    case "deepseek":
      return (
        <DeepSeek.Color
          className={cn(
            "rounded-sm bg-transparent ",
            props.className,
            theme === "dark" ? "text-white" : "text-black"
          )}
          width={width}
          height={height}
        />
      )
    case "ollama":
      return (
        <Ollama
          className={cn(
            "rounded-sm bg-transparent ",
            props.className,
            theme === "dark" ? "text-white" : "text-black"
          )}
          width={width}
          height={height}
        />
      )
    case "mistral":
      return (
        <Mistral
          className={cn(
            "rounded-sm bg-white p-1 text-black",
            props.className,
            theme === "dark" ? "bg-white" : "border-DEFAULT border-black"
          )}
          width={width}
          height={height}
        />
      )
    case "groq":
      return (
        <Image
          className={cn(
            "rounded-sm p-0",
            theme === "dark" ? "bg-white" : "border-DEFAULT border-black"
          )}
          src={groq.src}
          alt="Groq"
          width={width}
          height={height}
        />
      )
    case "anthropic":
      return (
        <Anthropic
          className={cn(
            "rounded-sm bg-white p-1 text-black",
            props.className,
            theme === "dark" ? "bg-white" : "border-DEFAULT border-black"
          )}
          width={width}
          height={height}
        />
      )
    case "google":
      return (
        <Gemini
          className={cn(
            "rounded-sm bg-white p-1 text-black",
            props.className,
            theme === "dark" ? "bg-white" : "border-DEFAULT border-black"
          )}
          width={width}
          height={height}
        />
      )
    case "perplexity":
      return (
        <Image
          className={cn(
            "rounded-sm p-1",
            theme === "dark" ? "bg-white" : "border-DEFAULT border-black"
          )}
          src={perplexity.src}
          alt="Mistral"
          width={width}
          height={height}
        />
      )
    default:
      return <IconSparkles size={width} />
  }
}
