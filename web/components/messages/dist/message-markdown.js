"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
exports.MessageMarkdown = void 0;
var react_1 = require("react");
var remark_gfm_1 = require("remark-gfm");
var remark_math_1 = require("remark-math");
var rehype_katex_1 = require("rehype-katex");
var react_markdown_1 = require("react-markdown");
var message_codeblock_1 = require("./message-codeblock");
require("katex/dist/katex.min.css");
var replaceMathDelimiters = function (content) {
    return content
        .replace(/\\\(/g, "$")
        .replace(/\\\)/g, "$")
        .replace(/\\\[/g, "\n$$")
        .replace(/\\\]/g, "$$\n");
};
// 替换 <think> 为 Markdown 兼容直接改成引用
var preprocessContent = function (content) {
    // 只有当内容以 <think> 开头时,才进行处理
    if (!content.startsWith("<think>")) {
        return content;
    }
    return content.replace(/<think>([\s\S]*?)<\/think>/g, function (_, innerContent) {
        return innerContent
            .trim()
            .split("\n")
            .map(function (line) { return "> " + line; })
            .join("\n");
    });
};
exports.MessageMarkdown = function (_a) {
    var content = _a.content;
    var processedContent = preprocessContent(content); // 预处理内容
    return (react_1["default"].createElement(react_markdown_1["default"]
    // <MessageMarkdownMemoized
    , { 
        // <MessageMarkdownMemoized
        className: "prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 min-w-full space-y-6 break-words", remarkPlugins: [remark_gfm_1["default"], remark_math_1["default"]], rehypePlugins: [rehype_katex_1["default"]], components: {
            p: function (_a) {
                var children = _a.children;
                return react_1["default"].createElement("p", { className: "mb-2 last:mb-0" }, children);
            },
            img: function (_a) {
                var node = _a.node, props = __rest(_a, ["node"]);
                return (react_1["default"].createElement("img", __assign({ className: "max-w-[67%]", alt: "message images" }, props)));
            },
            code: function (_a) {
                var node = _a.node, className = _a.className, children = _a.children, props = __rest(_a, ["node", "className", "children"]);
                var childArray = react_1["default"].Children.toArray(children);
                var firstChild = childArray[0];
                var firstChildAsString = react_1["default"].isValidElement(firstChild)
                    ? firstChild.props.children
                    : firstChild;
                if (firstChildAsString === "▍") {
                    return (react_1["default"].createElement("span", { className: "mt-1 animate-pulse cursor-default" }, "\u258D"));
                }
                if (typeof firstChildAsString === "string") {
                    childArray[0] = firstChildAsString.replace("▍", "▍");
                }
                var match = /language-(\w+)/.exec(className || "");
                if (typeof firstChildAsString === "string" &&
                    !firstChildAsString.includes("\n")) {
                    return (react_1["default"].createElement("code", __assign({ className: className }, props), childArray));
                }
                return (react_1["default"].createElement(message_codeblock_1.MessageCodeBlock, __assign({ key: className || "", language: (match && match[1]) || "", value: String(childArray).replace(/\n$/, "") }, props)));
            }
        } }, replaceMathDelimiters(processedContent))
    // {/* </MessageMarkdownMemoized> */}
    );
};
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
