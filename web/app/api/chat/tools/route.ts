import { openapiToFunctions } from "@/lib/openapi-conversion"
import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { Tables } from "@/supabase/types"
import { ChatSettings } from "@/types"
import { OpenAIStream, StreamingTextResponse } from "ai"
import OpenAI from "openai"
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs"
import { LLM } from "@/types"
export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages, selectedTools, modelData } = json as {
    chatSettings: ChatSettings
    messages: any[]
    selectedTools: Tables<"tools">[]
    modelData: LLM
  }

  try {
    const profile = await getServerProfile()

    checkApiKey(profile.openai_api_key, "OpenAI")
    let modelBaseUrl = ""
    let modelApiKey = ""
    const provider =
      modelData.provider === "openai" && profile.use_azure_openai
        ? "azure"
        : modelData.provider

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
          {
            status: 400
          }
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
          message: "anthropic tool not support, please wait fix"
        }),
        {
          status: 400
        }
      )
    } else if (provider === "custom") {
      return new Response(
        JSON.stringify({ message: "custom tool not support, please wait fix" }),
        {
          status: 400
        }
      )
    } else {
      return new Response(
        JSON.stringify({ message: "other model not support, please wait fix" }),
        {
          status: 400
        }
      )
    }
    const openai = new OpenAI({
      baseURL: modelBaseUrl,
      apiKey: modelApiKey
    })

    let allTools: OpenAI.Chat.Completions.ChatCompletionTool[] = []
    let allRouteMaps = {}
    let schemaDetails = []

    for (const selectedTool of selectedTools) {
      try {
        const convertedSchema = await openapiToFunctions(
          JSON.parse(selectedTool.schema as string)
        )
        const tools = convertedSchema.functions || []
        allTools = allTools.concat(tools)

        const routeMap = convertedSchema.routes.reduce(
          (map: Record<string, string>, route) => {
            map[route.path.replace(/{(\w+)}/g, ":$1")] = route.operationId
            return map
          },
          {}
        )

        allRouteMaps = { ...allRouteMaps, ...routeMap }

        schemaDetails.push({
          title: convertedSchema.info.title,
          description: convertedSchema.info.description,
          url: convertedSchema.info.server,
          headers: selectedTool.custom_headers,
          routeMap,
          requestInBody: convertedSchema.routes[0].requestInBody
        })
      } catch (error: any) {
        console.error("Error converting schema", error)
      }
    }

    const firstResponse = await openai.chat.completions.create({
      model: chatSettings.model as ChatCompletionCreateParamsBase["model"],
      messages,
      tools: allTools.length > 0 ? allTools : undefined
    })

    const message = firstResponse.choices[0].message
    messages.push(message)
    const toolCalls = message.tool_calls || []

    if (toolCalls.length === 0) {
      return new Response(message.content, {
        headers: {
          "Content-Type": "application/json"
        }
      })
    }

    if (toolCalls.length > 0) {
      for (const toolCall of toolCalls) {
        const functionCall = toolCall.function
        const functionName = functionCall.name
        const argumentsString = toolCall.function.arguments.trim()
        const parsedArgs = JSON.parse(argumentsString)

        // Find the schema detail that contains the function name
        const schemaDetail = schemaDetails.find(detail =>
          Object.values(detail.routeMap).includes(functionName)
        )

        if (!schemaDetail) {
          throw new Error(`Function ${functionName} not found in any schema`)
        }

        const pathTemplate = Object.keys(schemaDetail.routeMap).find(
          key => schemaDetail.routeMap[key] === functionName
        )

        if (!pathTemplate) {
          throw new Error(`Path for function ${functionName} not found`)
        }

        const path = pathTemplate.replace(/:(\w+)/g, (_, paramName) => {
          const value = parsedArgs.parameters[paramName]
          if (!value) {
            throw new Error(
              `Parameter ${paramName} not found for function ${functionName}`
            )
          }
          return encodeURIComponent(value)
        })

        if (!path) {
          throw new Error(`Path for function ${functionName} not found`)
        }

        // Determine if the request should be in the body or as a query
        const isRequestInBody = schemaDetail.requestInBody
        let data = {}

        if (isRequestInBody) {
          // If the type is set to body
          let headers = {
            "Content-Type": "application/json"
          }

          // Check if custom headers are set
          const customHeaders = schemaDetail.headers // Moved this line up to the loop
          // Check if custom headers are set and are of type string
          if (customHeaders && typeof customHeaders === "string") {
            let parsedCustomHeaders = JSON.parse(customHeaders) as Record<
              string,
              string
            >

            headers = {
              ...headers,
              ...parsedCustomHeaders
            }
          }

          const fullUrl = schemaDetail.url + path

          const bodyContent = parsedArgs.requestBody || parsedArgs

          const requestInit = {
            method: "POST",
            headers,
            body: JSON.stringify(bodyContent) // Use the extracted requestBody or the entire parsedArgs
          }

          const response = await fetch(fullUrl, requestInit)

          if (!response.ok) {
            data = {
              error: response.statusText
            }
          } else {
            data = await response.json()
          }
        } else {
          // If the type is set to query
          const queryParams = new URLSearchParams(
            parsedArgs.parameters
          ).toString()
          const fullUrl =
            schemaDetail.url + path + (queryParams ? "?" + queryParams : "")

          let headers = {}

          // Check if custom headers are set
          const customHeaders = schemaDetail.headers
          if (customHeaders && typeof customHeaders === "string") {
            headers = JSON.parse(customHeaders)
          }

          const response = await fetch(fullUrl, {
            method: "GET",
            headers: headers
          })

          if (!response.ok) {
            data = {
              error: response.statusText
            }
          } else {
            data = await response.json()
          }
        }

        messages.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: JSON.stringify(data)
        })
      }
    }

    const secondResponse = await openai.chat.completions.create({
      model: chatSettings.model as ChatCompletionCreateParamsBase["model"],
      messages,
      stream: true
    })

    const stream = OpenAIStream(secondResponse)

    return new StreamingTextResponse(stream)
  } catch (error: any) {
    console.error(error)
    const errorMessage = error.error?.message || "An unexpected error occurred"
    const errorCode = error.status || 500
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
