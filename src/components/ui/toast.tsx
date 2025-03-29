"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface ToastActionElement extends React.ReactElement {}

const Toast = React.forwardRef<
  HTMLDivElement,
  ToastProps & {
    title?: string;
    description?: string;
    action?: React.ReactNode;
  }
>(({ className, variant, onOpenChange, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(ToastVariants({ variant }), className)}
      {...props}
    >
      <div className="grid gap-1">
        {props.title && <div className="text-sm font-semibold">{props.title}</div>}
        {props.description && <div className="text-sm opacity-90">{props.description}</div>}
      </div>
      {props.action}
      <button
        className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
        onClick={() => {
          if (onOpenChange) {
            onOpenChange(false);
          }
        }}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  );
});

Toast.displayName = "Toast";

export { Toast, ToastVariants } 