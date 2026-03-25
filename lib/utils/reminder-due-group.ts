import { endOfDay, isAfter, isBefore, startOfDay } from "date-fns"

export type ReminderDueGroup = "overdue" | "today" | "upcoming"

export function reminderDueGroup(dueAt: Date, now: Date): ReminderDueGroup {
  const startToday = startOfDay(now)
  const endToday = endOfDay(now)
  if (isBefore(dueAt, startToday)) return "overdue"
  if (isAfter(dueAt, endToday)) return "upcoming"
  return "today"
}

/** Badge: atrasados + hoje (pendentes). */
export function reminderBellCount(
  items: { due_at: string }[],
  now: Date
): number {
  return items.filter((row) => {
    const g = reminderDueGroup(new Date(row.due_at), now)
    return g === "overdue" || g === "today"
  }).length
}
