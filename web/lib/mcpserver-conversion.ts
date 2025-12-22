import $RefParser from "@apidevtools/json-schema-ref-parser"

interface mcpServersData {
  mcpserver: {
    name: string
    type: string
    url: URL
  }
}

export const validateMcpServer = async (mcpserverSpec: any) => {
  if (
    !mcpserverSpec.mcpServers ||
    typeof mcpserverSpec.mcpServers !== "object" ||
    Array.isArray(mcpserverSpec.mcpServers)
  ) {
    throw new Error("('mcpServers'): field required and must be an object")
  }

  const serverNames = Object.keys(mcpserverSpec.mcpServers)
  if (serverNames.length === 0) {
    throw new Error("mcpServers must have at least one server")
  }

  for (const serverName of serverNames) {
    if (!serverName.trim()) {
      throw new Error("Server name must not be empty")
    }
    const server = mcpserverSpec.mcpServers[serverName]
    if (
      !server.type ||
      typeof server.type !== "string" ||
      !server.type.trim()
    ) {
      throw new Error(`Server '${serverName}' must have a non-empty type`)
    }
    if (!server.url || typeof server.url !== "string" || !server.url.trim()) {
      throw new Error(`Server '${serverName}' must have a valid url`)
    }
  }
}

export const mcpserverToMCP = async (
  mcpserverSpec: any
): Promise<mcpServersData> => {
  const serverNames = Object.keys(mcpserverSpec.mcpServers)
  const serverName = serverNames[0]
  const server = mcpserverSpec.mcpServers[serverName]
  return {
    mcpserver: {
      name: serverName,
      type: server.type,
      url: new URL(server.url)
    }
  }
}
