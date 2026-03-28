"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, LayoutGrid, Settings, Users, Zap } from "lucide-react"

import { cn } from "@/lib/utils"

const navBase =
  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors"
const navInactive = "text-zinc-700 hover:bg-zinc-50"
const navActive = "bg-zinc-100 text-zinc-900"

export type SidebarProps = {
  role: "admin" | "user"
  onNavigate?: () => void
  className?: string
}

export function Sidebar({ role, onNavigate, className }: SidebarProps) {
  const pathname = usePathname()

  const items: {
    href: string
    label: string
    icon: typeof LayoutGrid
    adminOnly?: boolean
  }[] = [
      { href: "/pipeline", label: "Pipeline", icon: LayoutGrid },
      { href: "/leads", label: "Leads", icon: Users },
      { href: "/reminders", label: "Lembretes", icon: Bell },
      { href: "/settings", label: "Configurações", icon: Settings, adminOnly: true },
    ]

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="border-b border-zinc-200 px-4 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-1.5"
          onClick={onNavigate}
        >
          <Zap className="size-5 fill-green-500 text-green-500" />
          <span className="text-lg font-semibold text-zinc-900">LeadZap</span>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {items.map(({ href, label, icon: Icon, adminOnly }) => {
          if (adminOnly && role !== "admin") return null
          const active =
            pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(navBase, active ? navActive : navInactive)}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
