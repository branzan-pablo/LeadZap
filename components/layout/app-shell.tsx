"use client"

import { useState } from "react"

import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet"

import { Header } from "./header"
import { Sidebar } from "./sidebar"

export type AppShellProps = {
  email: string
  fullName: string
  avatarUrl: string | null
  organizationId: string | null
  role: "admin" | "user"
  children: React.ReactNode
}

export function AppShell({
  email,
  fullName,
  avatarUrl,
  organizationId,
  role,
  children,
}: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-white">
      <aside className="hidden w-60 shrink-0 border-r border-zinc-200 bg-zinc-50 md:flex md:flex-col">
        <Sidebar role={role} className="min-h-screen" />
      </aside>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent
          side="left"
          showCloseButton
          className="w-[240px] max-w-[85vw] border-zinc-200 bg-zinc-50 p-0 sm:max-w-[240px]"
        >
          <Sidebar
            role={role}
            onNavigate={() => setMobileNavOpen(false)}
            className="min-h-full"
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          email={email}
          fullName={fullName}
          avatarUrl={avatarUrl}
          organizationId={organizationId}
          role={role}
          onMenuClick={() => setMobileNavOpen(true)}
        />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
