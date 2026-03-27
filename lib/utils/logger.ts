/**
 * Structured logger for server-side code.
 * - In production: emits newline-delimited JSON (compatible with Vercel Log Drains)
 * - In development: delegates to console for readable output
 *
 * Server-side only — do not import from client components.
 */

type LogLevel = "info" | "warn" | "error"

type LogContext = Record<string, unknown>

function emit(level: LogLevel, message: string, context?: LogContext) {
  if (process.env.NODE_ENV === "production") {
    // Structured JSON for log aggregation pipelines
    process.stdout.write(
      JSON.stringify({
        level,
        timestamp: new Date().toISOString(),
        message,
        ...context,
      }) + "\n"
    )
  } else {
    const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.log
    fn(`[${level.toUpperCase()}] ${message}`, context ?? "")
  }
}

export const logger = {
  info: (message: string, context?: LogContext) => emit("info", message, context),
  warn: (message: string, context?: LogContext) => emit("warn", message, context),
  error: (message: string, context?: LogContext) => emit("error", message, context),
}
