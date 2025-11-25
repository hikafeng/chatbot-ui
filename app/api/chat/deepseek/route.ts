import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { ChatSettings } from "@/types"
import { ServerRuntime } from "next"

export const runtime: ServerRuntime = "nodejs"

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages } = json as {
    chatSettings: ChatSettings
    messages: any[]
  }

  try {
    const profile = await getServerProfile()
    checkApiKey(profile.deepseek_api_key, "DeepSeek")

    const apiUrl = "https://api.deepseek.com/chat/completions"

    const requestBody = {
      model: chatSettings.model,
      messages: messages,
      temperature: chatSettings.temperature,
      max_tokens: chatSettings.contextLength,
      stream: true,
      response_format: { type: "text" }
    }

    // console.log("requestBody", requestBody)

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${profile.deepseek_api_key}`,
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
                      let chunk = ""

                      if (delta.content === null) {
                        chunk =
                          JSON.stringify({
                            reasoning_content: delta.reasoning_content
                          }) + "\n"
                      } else {
                        chunk =
                          JSON.stringify({ content: delta.content }) + "\n"
                      }

                      controller.enqueue(encoder.encode(chunk))
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
        "DeepSeek API Key not found. Please set it in your profile settings."
    }

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
