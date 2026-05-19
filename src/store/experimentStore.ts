import { create } from 'zustand'
import type { AppScreen, ExperimentType, Well } from '../types/experiment'

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const COLS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

const GROUP_COLORS = [
  '#00d4ff', '#ff6b35', '#7c3aed', '#10b981',
  '#f59e0b', '#ec4899', '#06b6d4', '#84cc16',
]

function buildEmptyWells(): Well[] {
  const wells: Well[] = []
  for (const row of ROWS) {
    for (const col of COLS) {
      wells.push({
        id: `${row}${col}`,
        row,
        col,
        sampleName: '',
        groupColor: '#334155',
        filled: false,
      })
    }
  }
  return wells
}

interface ExperimentStore {
  screen: AppScreen
  experimentType: ExperimentType | null
  wells: Well[]
  animationStep: number
  animationComplete: boolean

  setScreen: (screen: AppScreen) => void
  setExperimentType: (type: ExperimentType) => void
  fillWells: (ids: string[], sampleName: string, colorIndex: number) => void
  clearWell: (id: string) => void
  resetWells: () => void
  setAnimationStep: (step: number) => void
  setAnimationComplete: (complete: boolean) => void
  reset: () => void
}

export const useExperimentStore = create<ExperimentStore>((set) => ({
  screen: 'landing',
  experimentType: null,
  wells: buildEmptyWells(),
  animationStep: 0,
  animationComplete: false,

  setScreen: (screen) => set({ screen }),
  setExperimentType: (experimentType) => set({ experimentType }),

  fillWells: (ids, sampleName, colorIndex) =>
    set((state) => ({
      wells: state.wells.map((w) => {
        if (!ids.includes(w.id)) return w
        // colorIndex === -1 means clear the well
        if (colorIndex === -1) return { ...w, filled: false, sampleName: '', groupColor: '#334155' }
        return { ...w, filled: true, sampleName, groupColor: GROUP_COLORS[colorIndex % GROUP_COLORS.length] }
      }),
    })),

  clearWell: (id) =>
    set((state) => ({
      wells: state.wells.map((w) =>
        w.id === id ? { ...w, filled: false, sampleName: '', groupColor: '#334155' } : w
      ),
    })),

  resetWells: () => set({ wells: buildEmptyWells() }),

  setAnimationStep: (animationStep) => set({ animationStep }),
  setAnimationComplete: (animationComplete) => set({ animationComplete }),

  reset: () =>
    set({
      screen: 'landing',
      experimentType: null,
      wells: buildEmptyWells(),
      animationStep: 0,
      animationComplete: false,
    }),
}))

export { GROUP_COLORS, ROWS, COLS }
