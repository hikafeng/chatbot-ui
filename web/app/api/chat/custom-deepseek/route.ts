import { Database } from "@/supabase/types"
import { ChatSettings } from "@/types"
import { createClient } from "@/lib/supabase/server"
import { ServerRuntime } from "next"
import { cookies } from "next/headers"

// Constants
const MIMO_MODEL_KEYWORD = 'mimo'
const THINKING_ENABLED = 'enabled'
const THINKING_DISABLED = 'disable'

export const runtime: ServerRuntime = "edge"

interface RequestBody {
  model: string
  messages: any[]
  temperature: number
  max_tokens: number
  stream: boolean
  response_format: { type: string }
  thinking?: { type: string }
  chat_template_kwargs?: { enable_thinking: boolean }
}

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages, customModelId, isThinkingEnabled } = json as {
    chatSettings: ChatSettings
    messages: any[]
    customModelId: string
    isThinkingEnabled: boolean
  }

  try {
    const cookieStore = cookies()
    const supabaseAdmin = createClient(cookieStore)

    const { data: customModel, error } = await supabaseAdmin
      .from("models")
      .select("*")
      .eq("id", customModelId)
      .single()

    if (error || !customModel) {
      throw new Error(error?.message || "Custom model not found")
    }

    const apiUrl = customModel.base_url + "/chat/completions"
    const isMimoModel = chatSettings.model.toLowerCase().includes(MIMO_MODEL_KEYWORD)

    const requestBody: RequestBody = {
      model: chatSettings.model,
      messages: messages,
      temperature: chatSettings.temperature,
      max_tokens: chatSettings.contextLength,
      stream: true,
      response_format: { type: "text" }
    }

    if (isMimoModel) {
      requestBody.thinking = {
        type: isThinkingEnabled ? THINKING_ENABLED : THINKING_DISABLED
      }
    } else if (!isThinkingEnabled) {
      requestBody.chat_template_kwargs = { enable_thinking: false }
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customModel.api_key}`,
        Accept: "*/*"
      },
      body: JSON.stringify(requestBody),
      redirect: "follow"
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    const encoder = new TextEncoder()
    let lastSentTime = Date.now()
    let buffer = "" // Buffer for incomplete JSON fragments

    return new Response(
      new ReadableStream({
        async start(controller) {
          if (!reader) {
            controller.close()
            return
          }

          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              const text = new TextDecoder().decode(value)
              buffer += text

              const lines = buffer
                .split("\n")
                .filter(line => line.trim() !== "")
              buffer = ""

              for (const line of lines) {
                if (line.startsWith("data:")) {
                  const jsonData = line.slice(5).trim()

                  if (jsonData === "[DONE]") {
                    controller.close()
                    return
                  }

                  try {
                    const json = JSON.parse(jsonData)

                    if (json.choices && json.choices.length > 0) {
                      const delta = json.choices[0].delta
                      const chunks: string[] = []

                      if (delta.content != null) {
                        chunks.push(JSON.stringify({ content: delta.content }) + "\n")
                      }

                      if (delta.reasoning_content != null) {
                        chunks.push(JSON.stringify({ reasoning_content: delta.reasoning_content }) + "\n")
                      }

                      for (const chunk of chunks) {
                        controller.enqueue(encoder.encode(chunk))
                      }
                    }
                  } catch (parseError) {
                    // JSON might be split, store in buffer
                    console.warn("JSON parse error, storing in buffer:", jsonData)
                    buffer = jsonData
                  }
                }
              }

              // Send a keep-alive every 5 seconds to prevent Vercel timeout
              if (Date.now() - lastSentTime > 5000) {
                controller.enqueue(encoder.encode(" "))
                lastSentTime = Date.now()
              }
            }
          } catch (error) {
            console.error("Stream processing error:", error)
          } finally {
            controller.close()
          }
        }
      }),
      {
        headers: { "Content-Type": "application/json" }
      }
    )
  } catch (error: any) {
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage = "Custom API Key not found. Please set it in your profile settings."
    } else if (errorMessage.toLowerCase().includes("incorrect api key")) {
      errorMessage = "Custom API Key is incorrect. Please fix it in your profile settings."
    }

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
