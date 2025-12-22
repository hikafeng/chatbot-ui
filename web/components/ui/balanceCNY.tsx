// Balance.tsx
import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva } from "class-variance-authority"

// 定义样式变体
const balanceLabelVariants = cva(
  "text-xs font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

// 定义容器的样式，使用Flex布局
// const containerStyle = cva("flex justify-between")
const containerStyle = cva("flex justify-between")

// 定义Balance组件接收的props类型
interface BalanceDeepseekProps {
  total: number
  granted: number
  topped_up: number
}
import { useTranslation } from "react-i18next"

const BalanceCNY: React.FC<BalanceDeepseekProps> = ({
  total,
  granted,
  topped_up
}) => {
  const { t } = useTranslation()

  // 使用LabelPrimitive.Root来创建标签，这里直接应用了样式变体
  return (
    <div className={containerStyle()}>
      <LabelPrimitive.Root className={balanceLabelVariants()}>
        {t("Total")}
        {`: ￥ ${total} `}
      </LabelPrimitive.Root>
      <LabelPrimitive.Root className={balanceLabelVariants()}>
        {t("Granted")}
        {`: ￥ ${granted} `}
      </LabelPrimitive.Root>
      <LabelPrimitive.Root className={balanceLabelVariants()}>
        {t("Topped_up")}
        {`: ￥ ${topped_up} `}
      </LabelPrimitive.Root>
    </div>
  )
}

export { BalanceCNY }
