import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { ChatbotUIContext } from "@/context/context"
import { IconInfoCircle, IconMessagePlus } from "@tabler/icons-react"
import { FC, useContext } from "react"
import { WithTooltip } from "../ui/with-tooltip"
import { useTranslation } from "react-i18next"

interface ChatSecondaryButtonsProps {}

export const ChatSecondaryButtons: FC<ChatSecondaryButtonsProps> = ({}) => {
  const { selectedChat } = useContext(ChatbotUIContext)
  const { t } = useTranslation()
  const { handleNewChat } = useChatHandler()

  return (
    <>
      {selectedChat && (
        <div className="flex items-center space-x-2">
          {/* Chat Info Tooltip */}
          <WithTooltip
            delayDuration={200}
            display={
              <div className="p-3 text-sm leading-relaxed">
                <div className="text-lg font-semibold">{t("Chat Info")}</div>

                <div className="mt-2 max-w-xs space-y-2 sm:max-w-sm md:max-w-md lg:max-w-lg">
                  <div>
                    {t("Model")}:{" "}
                    <span className="font-medium">{selectedChat.model}</span>
                  </div>
                  <div>
                    {t("Prompt")}:{" "}
                    <span className="font-medium">{selectedChat.prompt}</span>
                  </div>
                  <div>
                    {t("Temperature")}:{" "}
                    <span className="font-medium">
                      {selectedChat.temperature}
                    </span>
                  </div>
                  <div>
                    {t("Context Length")}:{" "}
                    <span className="font-medium">
                      {selectedChat.context_length}
                    </span>
                  </div>
                  <div>
                    {t("Profile Context")}:{" "}
                    <span className="font-medium">
                      {selectedChat.include_profile_context
                        ? t("Enabled")
                        : t("Disabled")}
                    </span>
                  </div>
                  <div>
                    {t("Workspace Instructions")}:{" "}
                    <span className="font-medium">
                      {selectedChat.include_workspace_instructions
                        ? t("Enabled")
                        : t("Disabled")}
                    </span>
                  </div>
                  <div>
                    {t("Embeddings Provider")}:{" "}
                    <span className="font-medium">
                      {selectedChat.embeddings_provider}
                    </span>
                  </div>
                </div>
              </div>
            }
            trigger={
              <div className="cursor-pointer transition-opacity duration-200 hover:opacity-60">
                <IconInfoCircle size={24} />
              </div>
            }
          />

          {/* New Chat Button */}
          <WithTooltip
            delayDuration={200}
            display={t("Start a new chat")}
            trigger={
              <div
                className="cursor-pointer transition-opacity duration-200 hover:opacity-60"
                onClick={handleNewChat}
              >
                <IconMessagePlus size={24} />
              </div>
            }
          />
        </div>
      )}
    </>
  )
}
