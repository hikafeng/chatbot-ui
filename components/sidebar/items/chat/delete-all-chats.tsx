import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { ChatbotUIContext } from "@/context/context"
import { deleteAllChats } from "@/db/chats"
import { Tables } from "@/supabase/types"
import { IconTrash } from "@tabler/icons-react"
import { FC, useContext, useRef, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

interface DeleteAllChatsProps {
  profile: Tables<"profiles">
}

export const DeleteAllChats: FC<DeleteAllChatsProps> = ({ profile }) => {
  const { t } = useTranslation()

  const { setChats, setChatMessages, setSelectedChat } =
    useContext(ChatbotUIContext)
  const { handleNewChat } = useChatHandler()

  const buttonRef = useRef<HTMLButtonElement>(null)
  const [showChatDialog, setShowChatDialog] = useState(false)

  const handleDeleteAllChats = async () => {
    if (!profile) return

    await deleteAllChats(profile.user_id)

    setChats([])
    setChatMessages([])
    setSelectedChat(null)

    handleNewChat()
    toast.success(t("All chats deleted!"))
  }

  return (
    <Dialog open={showChatDialog} onOpenChange={setShowChatDialog}>
      <DialogTrigger asChild>
        <IconTrash className="hover:opacity-50" size={32} />
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("Delete All Chats")}</DialogTitle>
          <DialogDescription>
            {t("Are you sure you want to delete all chats?")}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setShowChatDialog(false)}>
            {t("Cancel")}
          </Button>
          <Button
            ref={buttonRef}
            variant="destructive"
            onClick={handleDeleteAllChats}
          >
            {t("Delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
