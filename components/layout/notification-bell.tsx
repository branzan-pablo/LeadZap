"use client"

import { Bell } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type NotificationBellProps = {
  /** Placeholder count until notifications are wired */
  count?: number
  className?: string
}

export function NotificationBell({
  count = 3,
  className,
}: NotificationBellProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn("relative text-zinc-600", className)}
      aria-label="Notificações"
    >
      <Bell className="size-5" />
      <Badge
        variant="secondary"
        className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full p-0 text-[10px] font-medium"
      >
        {count > 9 ? "9+" : count}
      </Badge>
    </Button>
  )
}
