"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface AlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface AlertDialogContentProps {
  className?: string
  children: React.ReactNode
}

interface AlertDialogHeaderProps {
  className?: string
  children: React.ReactNode
}

interface AlertDialogFooterProps {
  className?: string
  children: React.ReactNode
}

interface AlertDialogTitleProps {
  className?: string
  children: React.ReactNode
}

interface AlertDialogDescriptionProps {
  className?: string
  children: React.ReactNode
}

interface AlertDialogActionProps {
  className?: string
  onClick?: () => void
  children: React.ReactNode
}

interface AlertDialogCancelProps {
  className?: string
  onClick?: () => void
  children: React.ReactNode
}

const AlertDialog = ({ open, onOpenChange, children }: AlertDialogProps) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-lg max-w-lg w-full">
        {children}
      </div>
    </div>
  )
}

const AlertDialogContent = ({ className, children }: AlertDialogContentProps) => (
  <div className={cn("p-6", className)}>
    {children}
  </div>
)

const AlertDialogHeader = ({ className, children }: AlertDialogHeaderProps) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left mb-4", className)}>
    {children}
  </div>
)

const AlertDialogFooter = ({ className, children }: AlertDialogFooterProps) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}>
    {children}
  </div>
)

const AlertDialogTitle = ({ className, children }: AlertDialogTitleProps) => (
  <h2 className={cn("text-lg font-semibold", className)}>
    {children}
  </h2>
)

const AlertDialogDescription = ({ className, children }: AlertDialogDescriptionProps) => (
  <p className={cn("text-sm text-gray-500", className)}>
    {children}
  </p>
)

const AlertDialogAction = ({ className, onClick, children }: AlertDialogActionProps) => (
  <Button className={cn("", className)} onClick={onClick}>
    {children}
  </Button>
)

const AlertDialogCancel = ({ className, onClick, children }: AlertDialogCancelProps) => (
  <Button variant="outline" className={cn("mt-2 sm:mt-0", className)} onClick={onClick}>
    {children}
  </Button>
)

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}