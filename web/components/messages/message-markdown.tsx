import React, { FC, useState } from "react"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import ReactMarkdown, { Components } from "react-markdown"
import { MessageCodeBlock } from "./message-codeblock"
import "katex/dist/katex.min.css"
import { MessageMarkdownMemoized } from "./message-markdown-memoized"
interface MessageMarkdownProps {
  content: string
}

// 定义扩展的 Components 类型
type CustomComponents = Components & {
  ThinkBlock?: React.FC<{ children: React.ReactNode }>
}

const replaceMathDelimiters = (content: string) => {
  return content
    .replace(/\\\(/g, "$")
    .replace(/\\\)/g, "$")
    .replace(/\\\[/g, "\n$$")
    .replace(/\\\]/g, "$$\n")
}

// 替换 <think> 为 Markdown 兼容直接改成引用
const preprocessContent = (content: string): string => {
  // 只有当内容以 <think> 开头时,才进行处理
  if (!content.startsWith("<think>")) {
    return content
  }

  return content.replace(
    /<think>([\s\S]*?)<\/think>/g,
    (_, innerContent: string) =>
      innerContent
        .trim()
        .split("\n")
        .map((line: string) => `> ${line}`)
        .join("\n")
  )
}

export const MessageMarkdown: FC<MessageMarkdownProps> = ({ content }) => {
  const processedContent = preprocessContent(content) // 预处理内容

  return (
    <ReactMarkdown
      // <MessageMarkdownMemoized
      className="prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 min-w-full space-y-6 break-words"
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={
        {
          p({ children }) {
            return <p className="mb-2 last:mb-0">{children}</p>
          },
          img({ node, ...props }) {
            return (
              <img className="max-w-[67%]" alt="message images" {...props} />
            )
          },
          code({ node, className, children, ...props }) {
            const childArray = React.Children.toArray(children)
            const firstChild = childArray[0] as React.ReactElement
            const firstChildAsString = React.isValidElement(firstChild)
              ? (firstChild as React.ReactElement).props.children
              : firstChild

            if (firstChildAsString === "▍") {
              return (
                <span className="mt-1 animate-pulse cursor-default">▍</span>
              )
            }

            if (typeof firstChildAsString === "string") {
              childArray[0] = firstChildAsString.replace("▍", "▍")
            }

            const match = /language-(\w+)/.exec(className || "")

            if (
              typeof firstChildAsString === "string" &&
              !firstChildAsString.includes("\n")
            ) {
              return (
                <code className={className} {...props}>
                  {childArray}
                </code>
              )
            }

            return (
              <MessageCodeBlock
                key={className || ""} // 使用更稳定的 key
                language={(match && match[1]) || ""}
                value={String(childArray).replace(/\n$/, "")}
                {...props}
              />
            )
          }
        } as CustomComponents
      } // 使用扩展的类型
    >
      {replaceMathDelimiters(processedContent)}
    </ReactMarkdown>
    // {/* </MessageMarkdownMemoized> */}
  )
}
// import React, { FC } from "react"
// import remarkGfm from "remark-gfm"
// import remarkMath from "remark-math"
// import rehypeKatex from "rehype-katex"
// import { MessageCodeBlock } from "./message-codeblock"
// import { MessageMarkdownMemoized } from "./message-markdown-memoized"
// import "katex/dist/katex.min.css"

// interface MessageMarkdownProps {
//   content: string
// }

// const replaceMathDelimiters = (content: string) => {
//   return content
//     .replace(/\\\(/g, "$")
//     .replace(/\\\)/g, "$")
//     .replace(/\\\[/g, "\n$$")
//     .replace(/\\\]/g, "$$\n")
// }

// export const MessageMarkdown: FC<MessageMarkdownProps> = ({ content }) => {
//   return (
//     <MessageMarkdownMemoized
//       className="prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 min-w-full space-y-6 break-words"
//       remarkPlugins={[remarkGfm, remarkMath]}
//       rehypePlugins={[rehypeKatex]}
//       components={{
//         p({ children }) {
//           return <p className="mb-2 last:mb-0">{children}</p>
//         },
//         img({ node, ...props }) {
//           return <img className="max-w-[67%]" {...props} />
//         },
//         code({ node, className, children, ...props }) {
//           const childArray = React.Children.toArray(children)
//           const firstChild = childArray[0] as React.ReactElement
//           const firstChildAsString = React.isValidElement(firstChild)
//             ? (firstChild as React.ReactElement).props.children
//             : firstChild

//           if (firstChildAsString === "▍") {
//             return <span className="mt-1 animate-pulse cursor-default">▍</span>
//           }

//           if (typeof firstChildAsString === "string") {
//             childArray[0] = firstChildAsString.replace("▍", "▍")
//           }

//           const match = /language-(\w+)/.exec(className || "")

//           if (
//             typeof firstChildAsString === "string" &&
//             !firstChildAsString.includes("\n")
//           ) {
//             return (
//               <code className={className} {...props}>
//                 {childArray}
//               </code>
//             )
//           }

//           return (
//             <MessageCodeBlock
//               key={Math.random()}
//               language={(match && match[1]) || ""}
//               value={String(childArray).replace(/\n$/, "")}
//               {...props}
//             />
//           )
//         }
//       }}
//     >
//       {replaceMathDelimiters(content)}
//     </MessageMarkdownMemoized>
//   )
// }
// // import React, { FC } from "react"
// // import remarkGfm from "remark-gfm"
// // import remarkMath from "remark-math"
// // import { MessageCodeBlock } from "./message-codeblock"
// // import { MessageMarkdownMemoized } from "./message-markdown-memoized"

// // interface MessageMarkdownProps {
// //   content: string
// // }

// // export const MessageMarkdown: FC<MessageMarkdownProps> = ({ content }) => {
// //   return (
// //     <MessageMarkdownMemoized
// //       className="prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 min-w-full space-y-6 break-words"
// //       remarkPlugins={[remarkGfm, remarkMath]}
// //       components={{
// //         p({ children }) {
// //           return <p className="mb-2 last:mb-0">{children}</p>
// //         },
// //         img({ node, ...props }) {
// //           return <img className="max-w-[67%]" {...props} />
// //         },
// //         code({ node, className, children, ...props }) {
// //           const childArray = React.Children.toArray(children)
// //           const firstChild = childArray[0] as React.ReactElement
// //           const firstChildAsString = React.isValidElement(firstChild)
// //             ? (firstChild as React.ReactElement).props.children
// //             : firstChild

// //           if (firstChildAsString === "▍") {
// //             return <span className="mt-1 animate-pulse cursor-default">▍</span>
// //           }

// //           if (typeof firstChildAsString === "string") {
// //             childArray[0] = firstChildAsString.replace("`▍`", "▍")
// //           }

// //           const match = /language-(\w+)/.exec(className || "")

// //           if (
// //             typeof firstChildAsString === "string" &&
// //             !firstChildAsString.includes("\n")
// //           ) {
// //             return (
// //               <code className={className} {...props}>
// //                 {childArray}
// //               </code>
// //             )
// //           }

// //           return (
// //             <MessageCodeBlock
// //               key={Math.random()}
// //               language={(match && match[1]) || ""}
// //               value={String(childArray).replace(/\n$/, "")}
// //               {...props}
// //             />
// //           )
// //         }
// //       }}
// //     >
// //       {content}
// //     </MessageMarkdownMemoized>
// //   )
// // }
