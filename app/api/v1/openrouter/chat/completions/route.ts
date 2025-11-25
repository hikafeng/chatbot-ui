import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { Settings } from "@/types"
import { OpenAIStream, StreamingTextResponse } from "ai"
import { ServerRuntime } from "next"
import OpenAI from "openai"
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs"
import { getEnvVarOrEdgeConfigValue } from "@/utils/getEnvVarOrEdgeConfigValue"

export const runtime: ServerRuntime = "edge"

export async function POST(request: Request) {
  const json = await request.json()
  // 设置 temperature 和 max_tokens 的默认值
  const {
    model,
    messages,
    temperature = 0.7,
    max_tokens = 4096
  } = json as {
    model: string
    messages: any[]
    temperature: number
    max_tokens: number
  }
  const apiKey = request.headers.get("Authorization")?.replace("Bearer ", "")

  try {
    const NEXT_PUBLIC_SITE_URL_STR =
      (await getEnvVarOrEdgeConfigValue("NEXT_PUBLIC_SITE_URL")) ||
      "https://chat.hikafeng.com"

    const openai = new OpenAI({
      apiKey: apiKey || "",
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": NEXT_PUBLIC_SITE_URL_STR, // Optional, for including your app on openrouter.ai rankings.
        "X-Title": "Hikafeng Api Request" // Optional. Shows in rankings on openrouter.ai.
      }
    })

    const response = await openai.chat.completions.create({
      model: model as ChatCompletionCreateParamsBase["model"],
      messages: messages as ChatCompletionCreateParamsBase["messages"],
      temperature: temperature,
      max_tokens: max_tokens,
      stream: true
    })

    const stream = OpenAIStream(response)

    return new StreamingTextResponse(stream)
  } catch (error: any) {
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage =
        "OpenRouter API Key not found. Please set it in your profile settings."
    }

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
