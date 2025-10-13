import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js"
import OpenAI from "openai"
import readline from "readline/promises"

const config = {
  apiKey: process.env.ALI_TONGYI_API_KEY,
  baseURL: process.env.ALI_TONGYI_BASE_URL,
  model: process.env.ALI_TONGYI_MODEL as string
}

class McpClient {
  client: OpenAI
  mcp: Client
  exitStack = [] as Array<() => Promise<void>>
  tools: any
  rl: readline.Interface

  constructor() {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL
    })
    this.mcp = new Client({ name: "mcp-client", version: "0.0.1" })

    /**
     * Run an interactive chat loop
     */
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
  }

  processQuery = async (query: string) => {
    const systemPrompt = [
      "You are a helpful assistant.",
      "You have the function of online search. ",
      "Please MUST call web_search tool to search the Internet content before answering.",
      "Please do not lose the user's question information when searching,",
      "and try to maintain the completeness of the question content as much as possible.",
      "When there is a date related question in the user's question,",
      "please use the search function directly to search and PROHIBIT inserting specific time."
    ]

    const messages: any = [
      { role: "system", content: systemPrompt.join("\n") },
      { role: "user", content: query }
    ]

    const completion = await this.client.chat.completions.create({
      model: config.model,
      messages,
      temperature: 0,
      tools: this.tools // 这里需要传入工具列表
    })

    const content = completion.choices[0]

    // console.log('log----------------', content.message);

    // python代码： messages.append(content.message.model_dump())
    // https://github.com/openai/openai-node/blob/master/helpers.md
    // 工具消息应该是对工具调用的直接响应，而不能独立存在或作为其他消息类型的响应。
    messages.push(content.message)

    if (content.finish_reason === "tool_calls") {
      // 如何是需要使用工具，就解析工具
      for (const toolCall of content.message.tool_calls!) {
        const toolName = toolCall.function.name
        const toolArgs = JSON.parse(toolCall.function.arguments)

        // 调用工具
        const result = await this.mcp.callTool({
          name: toolName,
          arguments: toolArgs
        })
        messages.push({
          role: "tool", // 工具消息的角色应该是 tool
          content: result.content, // 工具返回的结果
          tool_call_id: toolCall.id,
          name: toolName
        })
      }
    }

    //
    const response = await this.client.chat.completions.create({
      model: config.model,
      messages, // 这里需要传入工具调用的结果
      tools: this.tools // 这里需要传入工具列表，这里必填
    })

    return response.choices[0].message.content
  }

  connectToServer = async () => {
    // 通常用于实现基于标准输入输出（stdin/stdout）的客户端与服务器之间的通信
    const transport = new StdioClientTransport({
      // 这块直接调用了我的命令行
      command: "pnpm start-mcp-server",
      args: []
    })
    await this.mcp.connect(transport)

    const toolsResult = await this.mcp.listTools()
    this.tools = toolsResult.tools.map(tool => {
      return {
        type: "function", // 添加工具类型
        function: {
          name: tool.name,
          type: "function", // 添加工具类型
          description: tool.description,
          input_schema: tool.inputSchema,
          // openai的function参数格式，和mcp的inputSchema格式不同，需要转换
          parameters: tool.inputSchema.properties
        }
      }
    })
  }

  chatLoop = async () => {
    const rl = this.rl
    try {
      console.log("\nMCP Client Started!")
      console.log("Type your queries or 'quit' to exit.")

      const message = await rl.question("\nQuery: ")

      if (message.toLowerCase() === "quit") {
        rl.close()
        process.exit(0)
      }

      const response = await this.processQuery(message)

      console.log("\n======================================")
      console.log(response)
      console.log("======================================\n")
      this.chatLoop()
    } finally {
      // process.exit(0);
    }
  }

  cleanup = async () => {
    for (const exit of this.exitStack) {
      await exit()
    }
  }
}

const main = async () => {
  const mcp = new McpClient()

  try {
    await mcp.connectToServer()
    await mcp.chatLoop()
  } catch (error) {
    console.error("Error:", error)
    await mcp.cleanup()
  }
}
