"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { createReminder } from "@/app/(app)/reminders/actions"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export type ReminderFormProps = {
  leadId: string
  onSuccess?: () => void
  className?: string
}

function combineDateAndTime(date: Date, timeHHmm: string): Date | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(timeHHmm.trim())
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  if (h < 0 || h > 23 || min < 0 || min > 59) return null
  const d = new Date(date)
  d.setHours(h, min, 0, 0)
  return d
}

export function ReminderForm({ leadId, onSuccess, className }: ReminderFormProps) {
  const [title, setTitle] = useState("")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [time, setTime] = useState("09:00")
  const [calOpen, setCalOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  const submit = () => {
    const t = title.trim()
    if (!t) {
      toast.error("Informe o título")
      return
    }
    if (!date) {
      toast.error("Selecione a data")
      return
    }
    const combined = combineDateAndTime(date, time)
    if (!combined) {
      toast.error("Hora inválida")
      return
    }
    startTransition(async () => {
      const res = await createReminder({
        leadId,
        title: t,
        dueAt: combined.toISOString(),
      })
      if (!res.ok) {
        toast.error(res.message)
        return
      }
      toast.success("Lembrete criado")
      setTitle("")
      setDate(undefined)
      setTime("09:00")
      onSuccess?.()
    })
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-1.5">
        <Label htmlFor="rf-title">Título</Label>
        <Input
          id="rf-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex.: Enviar orçamento"
          disabled={pending}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Data</Label>
          <Popover open={calOpen} onOpenChange={setCalOpen}>
            <PopoverTrigger>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start font-normal"
                disabled={pending}
              >
                <CalendarIcon className="mr-2 size-4 opacity-70" />
                {date
                  ? format(date, "PPP", { locale: ptBR })
                  : "Selecionar data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  setDate(d)
                  setCalOpen(false)
                }}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rf-time">Hora</Label>
          <Input
            id="rf-time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            disabled={pending}
          />
        </div>
      </div>
      <Button
        type="button"
        className="w-full sm:w-auto"
        disabled={pending || !title.trim() || !date}
        onClick={submit}
      >
        Criar lembrete
      </Button>
    </div>
  )
}
