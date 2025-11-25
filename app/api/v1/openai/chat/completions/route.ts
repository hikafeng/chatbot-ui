import { OpenAIStream, StreamingTextResponse } from "ai"
import { ServerRuntime } from "next"
import OpenAI from "openai"
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs"

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

  try {
    const apiKey = request.headers.get("Authorization")?.replace("Bearer ", "")

    const openai = new OpenAI({
      apiKey: apiKey || ""
    })

    const response = await openai.chat.completions.create({
      model: model as ChatCompletionCreateParamsBase["model"],
      messages: messages as ChatCompletionCreateParamsBase["messages"],
      temperature, // 使用默认值或请求中提供的值
      max_tokens, // 使用默认值或请求中提供的值
      stream: true
    })

    const stream = OpenAIStream(response)

    return new StreamingTextResponse(stream)
  } catch (error: any) {
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage = "OpenAI API Key not found."
    } else if (errorMessage.toLowerCase().includes("incorrect api key")) {
      errorMessage = "OpenAI API Key is incorrect."
    }

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
