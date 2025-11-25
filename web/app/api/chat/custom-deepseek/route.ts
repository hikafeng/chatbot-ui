import { Database } from "@/supabase/types"
import { ChatSettings } from "@/types"
import { createClient } from "@/lib/supabase/server"
import { OpenAIStream, StreamingTextResponse } from "ai"
import { ServerRuntime } from "next"
import OpenAI from "openai"
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs"
import { SUPABASE_PUBLIC_URL, SUPABASE_ANON_KEY } from "@/config"

import { cookies, headers } from "next/headers"
export const runtime: ServerRuntime = "edge"

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
    // const supabaseAdmin = createClient<Database>(
    //   SUPABASE_PUBLIC_URL!,
    //   SUPABASE_ANON_KEY!
    // )

    const { data: customModel, error } = await supabaseAdmin
      .from("models")
      .select("*")
      .eq("id", customModelId)
      .single()

    if (!customModel && error) {
      throw new Error(error.message)
    }
    const apiUrl = customModel.base_url + "/chat/completions"
    const requestBody = {
      model: chatSettings.model,
      messages: messages,
      temperature: chatSettings.temperature,
      max_tokens: chatSettings.contextLength,
      stream: true,
      response_format: { type: "text" },
      ...(isThinkingEnabled === false
        ? { chat_template_kwargs: { enable_thinking: false } }
        : {})
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
    let buffer = "" // 用于存储未完整的 JSON 片段

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
              buffer += text // 追加到 buffer

              const lines = buffer
                .split("\n")
                .filter(line => line.trim() !== "")
              buffer = "" // 清空 buffer，准备重新存储未解析的数据

              for (const line of lines) {
                if (line.startsWith("data:")) {
                  let jsonData = line.slice(5).trim()

                  if (jsonData === "[DONE]") {
                    controller.close()
                    return
                  }

                  try {
                    // **尝试解析 JSON**
                    const json = JSON.parse(jsonData)

                    if (json.choices && json.choices.length > 0) {
                      const delta = json.choices[0].delta
                      console.log("Delta received:", delta)

                      let chunks = []

                      if (delta.content !== undefined) {
                        chunks.push(
                          JSON.stringify({ content: delta.content }) + "\n"
                        )
                      }

                      if (delta.reasoning_content !== undefined) {
                        chunks.push(
                          JSON.stringify({
                            reasoning_content: delta.reasoning_content
                          }) + "\n"
                        )
                      }

                      for (const chunk of chunks) {
                        controller.enqueue(encoder.encode(chunk))
                      }
                    }
                  } catch (error) {
                    // **解析失败，说明 JSON 可能是被拆分的，存入 buffer**
                    console.warn(
                      "JSON parse error, storing in buffer:",
                      jsonData
                    )
                    buffer = jsonData // 存入 buffer，等待下次拼接
                  }
                }
              }

              // **每 5 秒发送一个空数据包，防止 Vercel 误判超时**
              if (Date.now() - lastSentTime > 5000) {
                controller.enqueue(encoder.encode(" ")) // 发送一个空格，保持连接
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
      errorMessage =
        "Custom API Key not found. Please set it in your profile settings."
    } else if (errorMessage.toLowerCase().includes("incorrect api key")) {
      errorMessage =
        "Custom API Key is incorrect. Please fix it in your profile settings."
    }

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
