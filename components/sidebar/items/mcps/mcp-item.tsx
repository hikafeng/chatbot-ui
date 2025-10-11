import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TextareaAutosize } from "@/components/ui/textarea-autosize"
import { MCP_DESCRIPTION_MAX, MCP_NAME_MAX } from "@/db/limits"
import { validateMcpServer } from "@/lib/mcpserver-conversion"
import { Tables } from "@/supabase/types"
import { MCP } from "@lobehub/icons"
import { FC, useState } from "react"
import { SidebarItem } from "../all/sidebar-display-item"
interface McpItemProps {
  mcp: Tables<"mcps">
}

export const McpItem: FC<McpItemProps> = ({ mcp }) => {
  const [name, setName] = useState(mcp.name)
  const [isTyping, setIsTyping] = useState(false)
  const [description, setDescription] = useState(mcp.description)
  const [url, setUrl] = useState(mcp.url)
  const [customHeaders, setCustomHeaders] = useState(
    mcp.custom_headers as string
  )
  const [schema, setSchema] = useState(mcp.schema as string)
  const [schemaError, setSchemaError] = useState("")

  return (
    <SidebarItem
      item={mcp}
      isTyping={isTyping}
      contentType="mcps"
      icon={<MCP size={30} />}
      updateState={{
        name,
        description,
        url,
        custom_headers: customHeaders,
        schema
      }}
      renderInputs={() => (
        <>
          <div className="space-y-1">
            <Label>Name</Label>

            <Input
              placeholder="Mcp name..."
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={MCP_NAME_MAX}
            />
          </div>

          <div className="space-y-1">
            <Label>Description</Label>

            <Input
              placeholder="Mcp description..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={MCP_DESCRIPTION_MAX}
            />
          </div>

          {/* <div className="space-y-1">
            <Label>URL</Label>

            <Input
              placeholder="Mcp url..."
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
          </div> */}

          {/* <div className="space-y-3 pt-4 pb-3">
            <div className="space-x-2 flex items-center">
              <Checkbox />

              <Label>Web Browsing</Label>
            </div>

            <div className="space-x-2 flex items-center">
              <Checkbox />

              <Label>Image Generation</Label>
            </div>

            <div className="space-x-2 flex items-center">
              <Checkbox />

              <Label>Code Interpreter</Label>
            </div>
          </div> */}

          <div className="space-y-1">
            <Label>Custom Headers</Label>

            <TextareaAutosize
              placeholder={`{"X-api-key": "1234567890"}`}
              value={customHeaders}
              onValueChange={setCustomHeaders}
              minRows={1}
            />
          </div>

          <div className="space-y-1">
            <Label>Schema</Label>

            <TextareaAutosize
              placeholder={`{
  "mcpServers": {
      "mcp-name": {
        "type": "sse",
        "url": "https://mcp.example.com/sse"
      }
    }
}`}
              value={schema}
              onValueChange={value => {
                setSchema(value)

                try {
                  const parsedSchema = JSON.parse(value)
                  validateMcpServer(parsedSchema)
                    .then(() => setSchemaError("")) // Clear error if validation is successful
                    .catch(error => setSchemaError(error.message)) // Set specific validation error message
                } catch (error) {
                  setSchemaError("Invalid JSON format") // Set error for invalid JSON format
                }
              }}
              minRows={8}
            />

            <div className="text-xs text-red-500">{schemaError}</div>
          </div>
        </>
      )}
    />
  )
}
