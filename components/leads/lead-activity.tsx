"use client"

import {
  ArrowRightIcon,
  BellIcon,
  Loader2Icon,
  MessageCircleIcon,
  MessageSquareIcon,
  PaperclipIcon,
  PlusIcon,
  TagIcon,
  UserPlusIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { formatRelativeTime } from "@/lib/utils/formatters"
import { createClient } from "@/lib/supabase/client"

type ActivityRow = {
  id: string
  type: string
  metadata: Record<string, unknown> | null
  created_at: string
  user_id: string | null
  user_name: string | null
}

type ActivityConfig = {
  icon: React.ReactNode
  dotColor: string
  label: (meta: Record<string, unknown> | null, userName: string | null) => string
}

const ACTIVITY_CONFIG: Record<string, ActivityConfig> = {
  lead_created: {
    icon: <PlusIcon className="size-3.5" />,
    dotColor: "bg-green-500 text-white",
    label: (_meta, user) => user ? `${user} criou o lead` : "Lead criado",
  },
  lead_updated: {
    icon: <PencilIcon className="size-3.5" />,
    dotColor: "bg-zinc-400 text-white",
    label: (_meta, user) => user ? `${user} atualizou o lead` : "Lead atualizado",
  },
  lead_moved: {
    icon: <ArrowRightIcon className="size-3.5" />,
    dotColor: "bg-blue-500 text-white",
    label: (meta, user) => {
      const from = (meta?.from_stage ?? meta?.from_stage_name) as string | undefined
      const to = (meta?.to_stage ?? meta?.to_stage_name) as string | undefined
      const prefix = user ?? "Lead"
      if (from && to) return `${prefix} moveu de "${from}" para "${to}"`
      return `${prefix} moveu o lead`
    },
  },
  lead_assigned: {
    icon: <UserPlusIcon className="size-3.5" />,
    dotColor: "bg-blue-500 text-white",
    label: (meta, user) => {
      const assignee = meta?.assigned_to_name as string | undefined
      const prefix = user ?? "Sistema"
      if (assignee) return `${prefix} atribuiu para ${assignee}`
      return `${prefix} reatribuiu o lead`
    },
  },
  lead_deleted: {
    icon: <Trash2Icon className="size-3.5" />,
    dotColor: "bg-red-500 text-white",
    label: (_meta, user) => user ? `${user} excluiu o lead` : "Lead excluído",
  },
  note_added: {
    icon: <MessageSquareIcon className="size-3.5" />,
    dotColor: "bg-zinc-400 text-white",
    label: (_meta, user) => user ? `${user} adicionou uma nota` : "Nota adicionada",
  },
  tag_added: {
    icon: <TagIcon className="size-3.5" />,
    dotColor: "bg-zinc-400 text-white",
    label: (meta, user) => {
      const tag = meta?.tag_name as string | undefined
      const prefix = user ?? "Sistema"
      return tag ? `${prefix} adicionou a tag "${tag}"` : `${prefix} adicionou uma tag`
    },
  },
  tag_removed: {
    icon: <TagIcon className="size-3.5" />,
    dotColor: "bg-zinc-400 text-white",
    label: (meta, user) => {
      const tag = meta?.tag_name as string | undefined
      const prefix = user ?? "Sistema"
      return tag ? `${prefix} removeu a tag "${tag}"` : `${prefix} removeu uma tag`
    },
  },
  reminder_created: {
    icon: <BellIcon className="size-3.5" />,
    dotColor: "bg-amber-500 text-white",
    label: (meta, user) => {
      const title = meta?.title as string | undefined
      const prefix = user ?? "Sistema"
      return title ? `${prefix} criou lembrete "${title}"` : `${prefix} criou um lembrete`
    },
  },
  reminder_completed: {
    icon: <BellIcon className="size-3.5" />,
    dotColor: "bg-amber-500 text-white",
    label: (meta, user) => {
      const title = meta?.title as string | undefined
      const prefix = user ?? "Sistema"
      return title
        ? `${prefix} concluiu lembrete "${title}"`
        : `${prefix} concluiu um lembrete`
    },
  },
  attachment_added: {
    icon: <PaperclipIcon className="size-3.5" />,
    dotColor: "bg-zinc-400 text-white",
    label: (meta, user) => {
      const name = meta?.file_name as string | undefined
      const prefix = user ?? "Sistema"
      return name ? `${prefix} anexou "${name}"` : `${prefix} adicionou um anexo`
    },
  },
  attachment_removed: {
    icon: <PaperclipIcon className="size-3.5" />,
    dotColor: "bg-zinc-400 text-white",
    label: (meta, user) => {
      const name = meta?.file_name as string | undefined
      const prefix = user ?? "Sistema"
      return name ? `${prefix} removeu "${name}"` : `${prefix} removeu um anexo`
    },
  },
  message_received: {
    icon: <MessageCircleIcon className="size-3.5" />,
    dotColor: "bg-green-500 text-white",
    label: (_meta, _user) => "Nova mensagem do WhatsApp",
  },
}

const FALLBACK_CONFIG: ActivityConfig = {
  icon: <PlusIcon className="size-3.5" />,
  dotColor: "bg-zinc-300 text-white",
  label: (_meta, user) => user ? `${user} realizou uma ação` : "Ação do sistema",
}

type LeadActivityProps = {
  leadId: string
}

export function LeadActivity({ leadId }: LeadActivityProps) {
  const [activities, setActivities] = useState<ActivityRow[]>([])
  const [loading, setLoading] = useState(true)

  const fetchActivities = useCallback(async () => {
    const supabase = createClient()

    // Fetch activities with user names
    const { data: rows, error } = await supabase
      .from("activities")
      .select("id, type, metadata, created_at, user_id")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error || !rows) {
      setLoading(false)
      return
    }

    // Collect unique user IDs to fetch names
    const userIds = [...new Set(
      rows
        .map((r) => r.user_id as string | null)
        .filter((id): id is string => id !== null)
    )]

    let userMap: Record<string, string> = {}
    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from("users")
        .select("id, full_name")
        .in("id", userIds)

      if (users) {
        userMap = Object.fromEntries(
          users.map((u) => [u.id as string, u.full_name as string])
        )
      }
    }

    setActivities(
      rows.map((r) => ({
        id: r.id as string,
        type: r.type as string,
        metadata: (r.metadata as Record<string, unknown> | null) ?? null,
        created_at: r.created_at as string,
        user_id: r.user_id as string | null,
        user_name: r.user_id ? (userMap[r.user_id as string] ?? null) : null,
      }))
    )
    setLoading(false)
  }, [leadId])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-zinc-400">
        <Loader2Icon className="size-4 animate-spin" />
        Carregando atividades…
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <p className="py-4 text-sm text-zinc-400">
        Nenhuma atividade registrada.
      </p>
    )
  }

  return (
    <div className="relative mt-4">
      {/* Vertical line */}
      <div className="absolute left-[11px] top-2 bottom-2 w-px bg-zinc-200" />

      <ul className="space-y-4">
        {activities.map((act) => {
          const config = ACTIVITY_CONFIG[act.type] ?? FALLBACK_CONFIG
          const label = config.label(act.metadata, act.user_name)

          return (
            <li key={act.id} className="relative flex gap-3 pl-0">
              {/* Dot */}
              <div
                className={`relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full ${config.dotColor}`}
              >
                {config.icon}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm text-zinc-700">{label}</p>
                <p className="text-xs text-zinc-400">
                  {formatRelativeTime(act.created_at)}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
