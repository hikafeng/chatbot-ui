// ChatMessage 类型定义
interface ChatMessage {
  role: string
  content:
    | string
    | (
        | { type: string; image_url: { url: string } }
        | { type: string; text: string }
      )[]
}

/**
 * 移除思考链标记及其内容
 * @param content 消息内容
 * @returns 清理后的内容
 */
function removeThoughtChain(content: string): string {
  const thinkPattern = /<think>[\s\S]*?<\/think>/g
  return content.replace(thinkPattern, "").trim()
}

/**
 * 处理消息列表，移除助手回复中的思考链
 * @param chatMessageList 原始消息列表
 * @returns 处理后的消息列表
 */
export function processRmCotMessages(
  chatMessageList: ChatMessage[]
): ChatMessage[] {
  return chatMessageList.map(chatMessage => {
    if (chatMessage.role !== "assistant") {
      return chatMessage
    }

    const processedContent =
      typeof chatMessage.content === "string"
        ? removeThoughtChain(chatMessage.content)
        : chatMessage.content

    return {
      role: chatMessage.role,
      content: processedContent
    }
  })
}
