import { SidebarCreateItem } from "@/components/sidebar/items/all/sidebar-create-item"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TextareaAutosize } from "@/components/ui/textarea-autosize"
import { ChatbotUIContext } from "@/context/context"
import { MCP_DESCRIPTION_MAX, MCP_NAME_MAX } from "@/db/limits"
import { validateMcpServer } from "@/lib/mcpserver-conversion"
import { TablesInsert } from "@/supabase/types"
import { FC, useContext, useState } from "react"

interface CreateMcpProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const CreateMcp: FC<CreateMcpProps> = ({ isOpen, onOpenChange }) => {
  const { profile, selectedWorkspace } = useContext(ChatbotUIContext)

  const [name, setName] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [description, setDescription] = useState("")
  const [url, setUrl] = useState("")
  const [customHeaders, setCustomHeaders] = useState("")
  const [schema, setSchema] = useState("")
  const [schemaError, setSchemaError] = useState("")

  if (!profile || !selectedWorkspace) return null

  return (
    <SidebarCreateItem
      contentType="mcps"
      createState={
        {
          user_id: profile.user_id,
          name,
          description,
          url,
          custom_headers: customHeaders,
          schema
        } as TablesInsert<"mcps">
      }
      isOpen={isOpen}
      isTyping={isTyping}
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
                  //   .then(() => setSchemaError("")) // Clear error if validation is successful
                  //   .catch(error => setSchemaError(error.message)) // Set specific validation error message
                } catch (error) {
                  setSchemaError("Invalid JSON format") // Set error for invalid JSON format
                }
              }}
              minRows={15}
            />

            <div className="text-xs text-red-500">{schemaError}</div>
          </div>
        </>
      )}
      onOpenChange={onOpenChange}
    />
  )
}
