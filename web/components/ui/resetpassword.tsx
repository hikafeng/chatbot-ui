// components/ui/ResetPassword.tsx
"use client"

import { useTranslation } from "react-i18next"

const ResetPassword = ({
  handleResetPassword
}: {
  handleResetPassword: (formData: FormData) => void
}) => {
  const { t } = useTranslation() // ✅ 确保 `useTranslation` 在组件内部

  return (
    <div className="text-muted-foreground mt-1 flex justify-center text-sm">
      <span className="mr-1">{t("Forgot your password?")}</span>
      <button
        formAction={handleResetPassword}
        className="text-primary ml-1 underline hover:opacity-80"
      >
        {t("Reset")}
      </button>
    </div>
  )
}

export default ResetPassword
