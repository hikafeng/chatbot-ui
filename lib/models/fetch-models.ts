import { Tables } from "@/supabase/types"
import { LLM, LLMID, OpenRouterLLM, DeepSeekLLM } from "@/types"
import { toast } from "sonner"
import { LLM_LIST_MAP } from "./llm/llm-list"
import { get } from "@vercel/edge-config"
import { OLLAMA_URL, OLLAMA_API_KEY } from "@/config"

// import {getEnvVarOrEdgeConfigValue} from "@/utils/getEnvVarOrEdgeConfigValue"
export const fetchHostedModels = async (profile: Tables<"profiles">) => {
  try {
    const providers = ["google", "anthropic", "mistral", "groq", "perplexity"]

    if (profile.use_azure_openai) {
      providers.push("azure")
    } else {
      providers.push("openai")
    }

    const response = await fetch("/api/keys")

    if (!response.ok) {
      throw new Error(`Server is not responding.`)
    }

    const data = await response.json()

    let modelsToAdd: LLM[] = []

    for (const provider of providers) {
      let providerKey: keyof typeof profile

      if (provider === "google") {
        providerKey = "google_gemini_api_key"
      } else if (provider === "azure") {
        providerKey = "azure_openai_api_key"
      } else {
        providerKey = `${provider}_api_key` as keyof typeof profile
      }

      if (profile?.[providerKey] || data.isUsingEnvKeyMap[provider]) {
        const models = LLM_LIST_MAP[provider]

        if (Array.isArray(models)) {
          modelsToAdd.push(...models)
        }
      }
    }

    return {
      envKeyMap: data.isUsingEnvKeyMap,
      hostedModels: modelsToAdd
    }
  } catch (error) {
    console.warn("Error fetching hosted models: " + error)
  }
}

export const fetchOllamaModels = async () => {
  try {
    const getEnvVarOrEdgeConfigValue = async (name: string) => {
      if (process.env.EDGE_CONFIG) {
        return await get<string>(name)
      }
      return process.env[name] || ""
    }
    const OLLAMA_AUTH_TOKEN = OLLAMA_API_KEY
    var myHeaders = new Headers()
    myHeaders.append("Authorization", `Bearer ${OLLAMA_AUTH_TOKEN}`)
    const response = await fetch(OLLAMA_URL + "/api/tags", {
      headers: myHeaders
    })

    if (!response.ok) {
      throw new Error(`Ollama server is not responding.`)
    }

    const data = await response.json()

    const localModels: LLM[] = data.models.map((model: any) => ({
      modelId: model.name as LLMID,
      modelName: model.name,
      provider: "ollama",
      hostedId: model.name,
      platformLink: "https://ollama.ai/library",
      imageInput: false
    }))

    return localModels
  } catch (error) {
    console.warn("Error fetching Ollama models: " + error)
  }
}
export const fetchOpenRouterModels = async (openrouter_api_key: any) => {
  let data = []
  if (!openrouter_api_key || openrouter_api_key.length !== 73) {
    return []
  }
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models")

    if (response.ok) {
      const result = await response.json()
      data = result.data
    } else {
      console.warn("Failed to fetch from remote, trying local file...")
    }
  } catch (error) {
    console.error("Error fetching from remote: " + error)
    console.warn("Falling back to local file...")
  }

  // 如果数据仍然为空，则尝试读取本地文件
  if (data.length === 0) {
    try {
      const localResponse = await fetch("/model/openrouter.json")
      const localResult = await localResponse.json()
      data = localResult.data
    } catch (error) {
      console.error("Error fetching local file: " + error)
      toast.error("Error fetching local file: " + error)
      return [] // 返回空数组以防止后续处理错误
    }
  }

  const openRouterModels = data.map(
    (model: {
      id: string
      name: string
      context_length: number
    }): OpenRouterLLM => ({
      modelId: model.id as LLMID,
      modelName: model.id,
      provider: "openrouter",
      hostedId: model.name,
      platformLink: "https://openrouter.dev",
      imageInput: false,
      maxContext: model.context_length
    })
  )

  return openRouterModels
}

export const fetchDeepSeekModels = async (deepseek_api_key: any) => {
  if (!deepseek_api_key || deepseek_api_key.length !== 35) {
    return []
  }
  let myHeaders = new Headers()
  myHeaders.append("Authorization", `Bearer ${deepseek_api_key}`)

  let requestOptions: RequestInit = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  }

  let data = []

  try {
    const response = await fetch(
      "https://api.deepseek.com/models",
      requestOptions
    )

    if (response.ok) {
      const result = await response.json()
      if (result && Array.isArray(result.data)) {
        data = result.data
      }
    } else {
      console.warn("Failed to fetch from remote, trying local file...")
    }
  } catch (error) {
    console.error("Error fetching from remote:", error)
    console.warn("Falling back to local file...")
  }

  // 如果数据仍然为空,则尝试读取本地文件
  if (data.length === 0) {
    try {
      const localResponse = await fetch("/model/deepseek.json")
      if (localResponse.ok) {
        const localResult = await localResponse.json()
        if (localResult && Array.isArray(localResult.data)) {
          data = localResult.data
        }
      }
    } catch (error) {
      console.error("Error fetching local file:", error)
      if (typeof toast !== "undefined") {
        toast.error("Error fetching local file: " + error)
      }
      return [] // 返回空数组以防止后续处理错误
    }
  }

  const deepSeekModels = data.map(
    (model: { id: string; object: string; owned_by: string }): DeepSeekLLM => ({
      modelId: model.id as LLMID,
      modelName: model.id,
      provider: "deepseek",
      hostedId: model.id,
      platformLink: "https://api.deepseek.com",
      imageInput: true,
      maxContext: 65536
    })
  )

  return deepSeekModels
}
