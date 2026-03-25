'use client'

/**
 * Pipeline drag-and-drop state + optimistic updates (implement with @dnd-kit).
 */
export function usePipeline() {
  return { stages: [] as unknown[], leadsByStage: {} as Record<string, unknown[]> }
}
