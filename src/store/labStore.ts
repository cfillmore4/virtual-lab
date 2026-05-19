import { create } from 'zustand'
import type { ExperimentType } from '../types/experiment'
import { EXPERIMENT_CONFIGS } from '../types/experiment'

export type RobotId = 'A' | 'B' | 'C'
export type RobotStatus = 'idle' | 'running'
export type ExperimentStatus = 'pending' | 'running' | 'complete'

export interface ExperimentRequest {
  id: string
  type: ExperimentType
  requestedAt: number
  robotId: RobotId | null
  status: ExperimentStatus
  accentColor: string
}

export interface RobotState {
  id: RobotId
  status: RobotStatus
  experimentId: string | null
}

interface LabStore {
  robots: RobotState[]
  queue: ExperimentRequest[]
  requestPanelOpen: boolean

  openRequestPanel: () => void
  closeRequestPanel: () => void
  requestExperiment: (type: ExperimentType) => void
  robotComplete: (robotId: RobotId) => void
}

const INITIAL_ROBOTS: RobotState[] = [
  { id: 'A', status: 'idle', experimentId: null },
  { id: 'B', status: 'idle', experimentId: null },
  { id: 'C', status: 'idle', experimentId: null },
]

function makeId(): string {
  return `${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

export const useLabStore = create<LabStore>((set, get) => ({
  robots: INITIAL_ROBOTS,
  queue: [],
  requestPanelOpen: false,

  openRequestPanel: () => set({ requestPanelOpen: true }),
  closeRequestPanel: () => set({ requestPanelOpen: false }),

  requestExperiment: (type) => {
    const id = makeId()
    const cfg = EXPERIMENT_CONFIGS[type]
    const newRequest: ExperimentRequest = {
      id,
      type,
      requestedAt: Date.now(),
      robotId: null,
      status: 'pending',
      accentColor: cfg.accentColor,
    }

    const { robots } = get()
    const idleRobot = robots.find((r) => r.status === 'idle')

    if (idleRobot) {
      // Assign immediately to idle robot
      const updatedRequest = { ...newRequest, robotId: idleRobot.id, status: 'running' as ExperimentStatus }
      set((s) => ({
        queue: [...s.queue, updatedRequest],
        robots: s.robots.map((r) =>
          r.id === idleRobot.id ? { ...r, status: 'running' as RobotStatus, experimentId: id } : r
        ),
        requestPanelOpen: false,
      }))
    } else {
      // All busy — queue it
      set((s) => ({
        queue: [...s.queue, newRequest],
        requestPanelOpen: false,
      }))
    }
  },

  robotComplete: (robotId) => {
    set((s) => {
      // Mark the robot's current experiment as complete
      const robot = s.robots.find((r) => r.id === robotId)
      if (!robot) return s

      const updatedQueue = s.queue.map((e) =>
        e.id === robot.experimentId ? { ...e, status: 'complete' as ExperimentStatus } : e
      )

      // Check for next pending experiment
      const nextPending = updatedQueue.find((e) => e.status === 'pending')

      if (nextPending) {
        // Assign next experiment to this robot
        return {
          queue: updatedQueue.map((e) =>
            e.id === nextPending.id
              ? { ...e, robotId, status: 'running' as ExperimentStatus }
              : e
          ),
          robots: s.robots.map((r) =>
            r.id === robotId ? { ...r, experimentId: nextPending.id } : r
          ),
        }
      } else {
        // Robot goes idle
        return {
          queue: updatedQueue,
          robots: s.robots.map((r) =>
            r.id === robotId ? { ...r, status: 'idle' as RobotStatus, experimentId: null } : r
          ),
        }
      }
    })
  },
}))
