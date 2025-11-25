import { ChatbotUIContext } from "@/context/context"
import { Tables } from "@/supabase/types"
import { MCP } from "@lobehub/icons"
import { FC, useContext, useEffect, useRef } from "react"
import { usePromptAndCommand } from "./chat-hooks/use-prompt-and-command"
import { useTranslation } from "react-i18next"

interface McpPickerProps {}

export const McpPicker: FC<McpPickerProps> = ({}) => {
  const { mcps, focusMcp, mcpCommand, isMcpPickerOpen, setIsMcpPickerOpen } =
    useContext(ChatbotUIContext)

  const { handleSelectMcp } = usePromptAndCommand()

  const itemsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (focusMcp && itemsRef.current[0]) {
      itemsRef.current[0].focus()
    }
  }, [focusMcp])

  const filteredMcps = mcps.filter(mcp =>
    mcp.name.toLowerCase().includes(mcpCommand.toLowerCase())
  )

  const handleOpenChange = (isOpen: boolean) => {
    setIsMcpPickerOpen(isOpen)
  }

  const callSelectMcp = (mcp: Tables<"mcps">) => {
    handleSelectMcp(mcp)
    handleOpenChange(false)
  }

  const getKeyDownHandler =
    (index: number) => (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Backspace") {
        e.preventDefault()
        handleOpenChange(false)
      } else if (e.key === "Enter") {
        e.preventDefault()
        callSelectMcp(filteredMcps[index])
      } else if (
        (e.key === "Tab" || e.key === "ArrowDown") &&
        !e.shiftKey &&
        index === filteredMcps.length - 1
      ) {
        e.preventDefault()
        itemsRef.current[0]?.focus()
      } else if (e.key === "ArrowUp" && !e.shiftKey && index === 0) {
        // go to last element if arrow up is pressed on first element
        e.preventDefault()
        itemsRef.current[itemsRef.current.length - 1]?.focus()
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        const prevIndex =
          index - 1 >= 0 ? index - 1 : itemsRef.current.length - 1
        itemsRef.current[prevIndex]?.focus()
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        const nextIndex = index + 1 < itemsRef.current.length ? index + 1 : 0
        itemsRef.current[nextIndex]?.focus()
      }
    }
  const { t } = useTranslation()
  return (
    <>
      {isMcpPickerOpen && (
        <div className="bg-background flex flex-col space-y-1 rounded-xl border-2 p-2 text-sm">
          {filteredMcps.length === 0 ? (
            <div className="text-md flex h-14 cursor-pointer items-center justify-center italic hover:opacity-50">
              {t("No matching mcps.")}
            </div>
          ) : (
            <>
              {filteredMcps.map((item, index) => (
                <div
                  key={item.id}
                  ref={ref => {
                    itemsRef.current[index] = ref
                  }}
                  tabIndex={0}
                  className="hover:bg-accent focus:bg-accent flex cursor-pointer items-center rounded p-2 focus:outline-none"
                  onClick={() => callSelectMcp(item as Tables<"mcps">)}
                  onKeyDown={getKeyDownHandler(index)}
                >
                  <MCP size={32} />

                  <div className="ml-3 flex flex-col">
                    <div className="font-bold">{item.name}</div>

                    <div className="truncate text-sm opacity-80">
                      {item.description || "No description."}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </>
  )
}
