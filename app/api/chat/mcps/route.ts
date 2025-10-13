import { mcpserverToMCP } from "@/lib/mcpserver-conversion"
import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { Tables } from "@/supabase/types"
import { ChatSettings } from "@/types"
import { OpenAIStream, StreamingTextResponse } from "ai"
import OpenAI from "openai"
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs"
import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import packageJson from "@/package.json"
import { LLM } from "@/types"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import {
  StreamableHTTPClientTransport,
  StreamableHTTPClientTransportOptions
} from "@modelcontextprotocol/sdk/client/streamableHttp.js"
import {
  SSEClientTransport,
  SSEClientTransportOptions
} from "@modelcontextprotocol/sdk/client/sse.js"

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages, selectedMcps, modelData } = json as {
    chatSettings: ChatSettings
    messages: any[]
    selectedMcps: Tables<"mcps">[]
    modelData: LLM
  }

  // 用于管理 MCP 客户端连接
  let mcpClient: Client | null = null
  let transports: Transport[] = []

  try {
    const profile = await getServerProfile()
    checkApiKey(profile.openai_api_key, "OpenAI")

    let modelBaseUrl = ""
    let modelApiKey = ""
    let modelName = chatSettings.model
    const provider =
      modelData.provider === "openai" && profile.use_azure_openai
        ? "azure"
        : modelData.provider
    const model_tool_call = modelData.toolCall

    if (model_tool_call === false) {
      return new Response(
        JSON.stringify({
          message:
            "This model does not support tool calling, please switch to another model"
        }),
        { status: 400 }
      )
    }

    // 配置模型提供商
    if (provider === "azure") {
      const AzureOpenaiENDPOINT = profile.azure_openai_endpoint
      const AzureOpenaiKEY = profile.azure_openai_api_key
      let AzureOpenaiDEPLOYMENT_ID = ""

      switch (chatSettings.model) {
        case "gpt-3.5-turbo":
          AzureOpenaiDEPLOYMENT_ID = profile.azure_openai_35_turbo_id || ""
          break
        case "gpt-4-turbo-preview":
          AzureOpenaiDEPLOYMENT_ID = profile.azure_openai_45_turbo_id || ""
          break
        case "gpt-4-vision-preview":
          AzureOpenaiDEPLOYMENT_ID = profile.azure_openai_45_vision_id || ""
          break
        default:
          return new Response(JSON.stringify({ message: "Model not found" }), {
            status: 400
          })
      }

      if (
        !AzureOpenaiENDPOINT ||
        !AzureOpenaiKEY ||
        !AzureOpenaiDEPLOYMENT_ID
      ) {
        return new Response(
          JSON.stringify({ message: "Azure resources not found" }),
          { status: 400 }
        )
      }

      modelBaseUrl = `${AzureOpenaiENDPOINT}/openai/deployments/${AzureOpenaiDEPLOYMENT_ID}`
      modelApiKey = AzureOpenaiKEY
    } else if (provider === "openai") {
      modelBaseUrl = "https://api.openai.com/v1"
      modelApiKey = profile.openai_api_key || ""
    } else if (provider === "openrouter") {
      modelBaseUrl = "https://openrouter.ai/api/v1"
      modelApiKey = profile.openrouter_api_key || ""
    } else if (provider === "anthropic") {
      return new Response(
        JSON.stringify({
          message:
            "Anthropic tool calling not yet supported, please wait for fix"
        }),
        { status: 400 }
      )
    } else if (provider === "custom") {
      if (model_tool_call === true) {
        const cookieStore = cookies()
        const supabaseAdmin = createClient(cookieStore)
        const { data: customModel, error } = await supabaseAdmin
          .from("models")
          .select("*")
          .eq("model_id", modelData.modelId)
          .single()

        if (!customModel && error) {
          throw new Error(error.message)
        }
        modelName = customModel.model_id
        modelBaseUrl = customModel.base_url
        modelApiKey = customModel.api_key || ""
      } else {
        return new Response(
          JSON.stringify({
            message:
              "This model does not support tool calling, please switch to another model"
          }),
          { status: 400 }
        )
      }
    } else {
      return new Response(
        JSON.stringify({
          message: "Other models not yet supported, please wait for fix"
        }),
        { status: 400 }
      )
    }

    console.log("modelName", modelName)
    console.log("modelBaseUrl", modelBaseUrl)
    console.log("modelApiKey", modelApiKey?.substring(0, 4) + "****")

    const openai = new OpenAI({
      baseURL: modelBaseUrl,
      apiKey: modelApiKey
    })

    let allTools: OpenAI.Chat.Completions.ChatCompletionTool[] = []
    mcpClient = new Client({
      name: "chatbot-ui-mcp-client",
      version: packageJson.version
    })

    let schemaDetails: Array<{
      name: string
      description: string
      url: string
      headers?: any
    }> = []

    // 连接所有 MCP 服务器
    for (const selectedMcp of selectedMcps) {
      try {
        const convertedSchema = await mcpserverToMCP(
          JSON.parse(selectedMcp.schema as string)
        )
        const serverUrl = convertedSchema.mcpserver.url
        const transportType = convertedSchema.mcpserver.type

        console.log(
          "Connecting to MCP Server:",
          serverUrl,
          "Type:",
          transportType
        )

        const headers: HeadersInit = {}
        const requestHeaders = { ...headers }
        let transportOptions:
          | StreamableHTTPClientTransportOptions
          | SSEClientTransportOptions

        switch (transportType) {
          case "sse":
            requestHeaders["Accept"] = "text/event-stream"
            requestHeaders["content-type"] = "application/json"
            transportOptions = {
              fetch: async (
                url: string | URL | globalThis.Request,
                init?: RequestInit
              ) => {
                const response = await fetch(url, {
                  ...init,
                  headers: requestHeaders
                })
                return response
              },
              requestInit: {
                headers: requestHeaders
              }
            }
            break
          case "streamable-http":
            transportOptions = {
              fetch: async (
                url: string | URL | globalThis.Request,
                init?: RequestInit
              ) => {
                requestHeaders["Accept"] = "text/event-stream, application/json"
                requestHeaders["Content-Type"] = "application/json"
                const response = await fetch(url, {
                  headers: requestHeaders,
                  ...init
                })
                return response
              },
              requestInit: {
                headers: requestHeaders
              },
              reconnectionOptions: {
                maxReconnectionDelay: 30000,
                initialReconnectionDelay: 1000,
                reconnectionDelayGrowFactor: 1.5,
                maxRetries: 2
              }
            }
            break
          default:
            throw new Error(`Unsupported transport type: ${transportType}`)
        }

        const transport =
          transportType === "streamable-http"
            ? new StreamableHTTPClientTransport(serverUrl, {
                sessionId: undefined,
                ...transportOptions
              })
            : new SSEClientTransport(serverUrl, transportOptions)

        await mcpClient.connect(transport as Transport)
        transports.push(transport as Transport)

        schemaDetails.push({
          name: convertedSchema.mcpserver.name,
          description: selectedMcp.description || "",
          url: convertedSchema.mcpserver.url.toString(),
          headers: selectedMcp.custom_headers
        })

        console.log("Successfully connected to MCP Server:", serverUrl)
      } catch (error: any) {
        console.error("Error connecting to MCP server:", error)
        throw new Error(`Failed to connect to MCP server: ${error.message}`)
      }
    }

    // 获取所有可用工具
    const toolsResult = await mcpClient?.listTools()
    for (const tool of toolsResult?.tools || []) {
      const mcp_tool = {
        type: "function",
        function: {
          name: tool.name,
          description: tool.description || "No description provided",
          parameters: tool.inputSchema
        }
      } as OpenAI.Chat.Completions.ChatCompletionTool
      allTools.push(mcp_tool)
    }

    console.log("Available tools:", allTools.length)

    // 第一次调用 - 获取工具调用
    const firstResponse = await openai.chat.completions.create({
      model: modelName as ChatCompletionCreateParamsBase["model"],
      messages,
      tools: allTools.length > 0 ? allTools : undefined,
      tool_choice: allTools.length > 0 ? "auto" : undefined
    })

    const message = firstResponse.choices[0].message
    messages.push(message)
    const toolCalls = message.tool_calls || []

    // 如果没有工具调用，直接返回
    if (toolCalls.length === 0) {
      await cleanupMCPConnections(mcpClient, transports)
      return new Response(message.content, {
        headers: {
          "Content-Type": "text/plain"
        }
      })
    }

    // 创建流式响应
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 输出工具调用信息
          for (const toolCall of toolCalls) {
            const functionCall = toolCall.function
            const functionName = functionCall.name
            const argumentsString = toolCall.function.arguments.trim()
            const parsedArgs = JSON.parse(argumentsString)

            // 流式输出工具调用开始信息
            const toolCallStartMessage = `\n🔧 **Calling Tool**: ${functionName}\n📝 **Arguments**: ${JSON.stringify(parsedArgs, null, 2)}\n\n`
            controller.enqueue(encoder.encode(toolCallStartMessage))

            try {
              // 调用工具
              const result = await mcpClient?.callTool({
                name: functionName,
                arguments: parsedArgs
              })

              // 流式输出工具调用结果
              const resultContent = JSON.stringify(
                result?.content || {},
                null,
                2
              )
              const toolCallResultMessage = `✅ **Tool Result**:\n\`\`\`json\n${resultContent}\n\`\`\`\n\n`
              controller.enqueue(encoder.encode(toolCallResultMessage))

              // 添加到消息历史
              messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                name: functionName,
                content: JSON.stringify(result?.content || "")
              })
            } catch (toolError: any) {
              const errorMessage = `❌ **Tool Error**: ${toolError.message}\n\n`
              controller.enqueue(encoder.encode(errorMessage))
              console.error(`Error calling tool ${functionName}:`, toolError)
            }
          }

          // 输出分隔符
          controller.enqueue(encoder.encode("\n---\n\n💬 **AI Response**:\n\n"))

          // 第二次调用 - 获取最终响应
          const secondResponse = await openai.chat.completions.create({
            model: modelName as ChatCompletionCreateParamsBase["model"],
            messages,
            stream: true
          })

          // 流式输出最终响应
          for await (const chunk of secondResponse) {
            const content = chunk.choices[0]?.delta?.content || ""
            if (content) {
              controller.enqueue(encoder.encode(content))
            }
          }

          controller.close()
        } catch (error: any) {
          console.error("Stream error:", error)
          controller.error(error)
        } finally {
          // 清理 MCP 连接
          await cleanupMCPConnections(mcpClient, transports)
        }
      },
      cancel() {
        // 当客户端取消流时清理连接
        cleanupMCPConnections(mcpClient, transports)
      }
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked"
      }
    })
  } catch (error: any) {
    console.error("Error in POST handler:", error)

    // 确保清理连接
    await cleanupMCPConnections(mcpClient, transports)

    const errorMessage = error?.message || "An unexpected error occurred"
    const errorCode = error.status || 500
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode,
      headers: {
        "Content-Type": "application/json"
      }
    })
  }
}

/**
 * 优雅地关闭 MCP 连接
 */
async function cleanupMCPConnections(
  mcpClient: Client | null,
  transports: Transport[]
) {
  try {
    if (mcpClient) {
      console.log("Closing MCP client connections...")

      // 关闭客户端
      await mcpClient.close()

      // 关闭所有传输层
      for (const transport of transports) {
        try {
          await transport.close()
        } catch (err) {
          console.error("Error closing transport:", err)
        }
      }

      console.log("MCP connections closed successfully")
    }
  } catch (error) {
    console.error("Error during MCP cleanup:", error)
  }
}
