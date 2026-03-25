"use client"

import { useTransition } from "react"
import { Menu } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

import { NotificationBell } from "./notification-bell"
import { WhatsAppStatus } from "./whatsapp-status"

export type HeaderProps = {
  email: string
  fullName: string
  avatarUrl: string | null
  organizationId: string | null
  role: "admin" | "user"
  onMenuClick: () => void
  className?: string
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

export function Header({
  email,
  fullName,
  avatarUrl,
  organizationId,
  role,
  onMenuClick,
  className,
}: HeaderProps) {
  const [pending, startTransition] = useTransition()

  async function handleSignOut() {
    startTransition(async () => {
      const supabase = createClient()
      await supabase.auth.signOut()
      window.location.href = "/login"
    })
  }

  return (
    <header
      className={cn(
        "flex h-16 shrink-0 items-center gap-3 border-b border-zinc-200 bg-white px-4",
        className
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="md:hidden"
        onClick={onMenuClick}
        aria-label="Abrir menu"
      >
        <Menu className="size-5" />
      </Button>

      <WhatsAppStatus
        organizationId={organizationId}
        role={role}
        className="hidden sm:flex"
      />

      <div className="flex flex-1" />

      <NotificationBell />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-full"
              aria-label="Menu da conta"
            />
          }
        >
          <Avatar size="sm">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt="" />
            ) : null}
            <AvatarFallback className="text-xs font-medium">
              {initials(fullName)}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-0.5">
              <span className="font-medium text-zinc-900">{fullName}</span>
              <span className="text-xs font-normal text-zinc-500">
                {email}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={pending}
            onClick={() => {
              void handleSignOut()
            }}
          >
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
