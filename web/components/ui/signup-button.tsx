"use client"

import React from "react"
import { useFormStatus } from "react-dom"
import { Button, ButtonProps } from "./button"
import { useTranslation } from "react-i18next"

const SignUpButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { pending } = useFormStatus()
    const { t } = useTranslation() // ✅ 确保 `useTranslation` 在组件内部

    return (
      <Button disabled={pending} ref={ref} {...props}>
        {t("Sign Up")} {/* ✅ 正确地放置翻译文本 */}
      </Button>
    )
  }
)

SignUpButton.displayName = "SignUpButton"

export { SignUpButton }
