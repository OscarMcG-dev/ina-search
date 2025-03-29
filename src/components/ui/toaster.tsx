"use client"

import {
  Toast,
  ToastProps
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast key={id} {...props}>
          {title && <div className="font-medium">{title}</div>}
          {description && <div className="mt-1 text-sm opacity-90">{description}</div>}
          {action}
        </Toast>
      ))}
    </div>
  )
} 