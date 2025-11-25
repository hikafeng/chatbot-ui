"use client"

import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"
import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants> & {
      i18nKey?: string // 添加支持 i18n 翻译的 prop
    }
>(({ className, i18nKey, children, ...props }, ref) => {
  const { t } = useTranslation() // ✅ 使用 i18next 进行翻译

  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(labelVariants(), className)}
      {...props}
    >
      {i18nKey ? t(i18nKey) : children}{" "}
      {/* ✅ 如果提供了 `i18nKey`，则翻译，否则直接渲染 `children` */}
    </LabelPrimitive.Root>
  )
})

Label.displayName = LabelPrimitive.Root.displayName

export { Label }
