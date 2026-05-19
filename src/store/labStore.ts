import { create } from 'zustand'
import type { ExperimentType } from '../types/experiment'
import { EXPERIMENT_CONFIGS } from '../types/experiment'
import type { ProgramPhaseId, Program, PhaseResults } from '../types/program'
import { createPCSK9Program, PHASE1_GENES, PHASE2_GUIDES } from '../types/program'

export type RobotId = 'A' | 'B' | 'C'
export type ScientistId = 'A' | 'B' | 'C'
export type RobotStatus = 'idle' | 'running'
export type ExperimentStatus = 'pending' | 'running' | 'complete'
export type ScientistTaskType = 'pcr' | 'sequencing' | 'analysis' | 'sample-prep'

export interface ScientistTask {
  type: ScientistTaskType
  label: string
  workstationX: number
  workstationZ: number
  facingY: number
  accentColor: string
}

export interface ScientistState {
  id: ScientistId
  task: ScientistTask | null
}

export const SCIENTIST_TASK_DEFS: Record<ScientistTaskType, { label: string; accentColor: string }> = {
  pcr:           { label: 'PCR Amplification',  accentColor: '#00d4ff' },
  sequencing:    { label: 'Sequencing Run',      accentColor: '#7c3aed' },
  analysis:      { label: 'Data Analysis',       accentColor: '#10b981' },
  'sample-prep': { label: 'Sample Preparation',  accentColor: '#ff6b35' },
}

const TASK_WORKSTATIONS: Record<ScientistTaskType, { x: number; z: number; facingY: number }> = {
  pcr:           { x: -14, z: -9, facingY:  Math.PI },
  sequencing:    { x:  14, z: -9, facingY:  Math.PI },
  analysis:      { x:  28, z:  0, facingY: -Math.PI / 2 },
  'sample-prep': { x: -28, z:  0, facingY:  Math.PI / 2 },
}

export interface ExperimentRequest {
  id: string
  type: ExperimentType
  requestedAt: number
  robotId: RobotId | null
  status: ExperimentStatus
  accentColor: string
  programPhaseId?: ProgramPhaseId
  label?: string
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
  scientists: ScientistState[]
  selectedScientistId: ScientistId | null

  // Program state
  program: Program | null
  programPanelOpen: boolean
  resultsPhaseId: ProgramPhaseId | null

  openRequestPanel: () => void
  closeRequestPanel: () => void
  requestExperiment: (type: ExperimentType) => void
  robotComplete: (robotId: RobotId) => void
  selectScientist: (id: ScientistId | null) => void
  assignTask: (scientistId: ScientistId, taskType: ScientistTaskType) => void
  clearTask: (scientistId: ScientistId) => void

  // Program actions
  openProgramPanel: () => void
  closeProgramPanel: () => void
  startProgram: () => void
  startPhase: (phaseId: ProgramPhaseId) => void
  confirmPhaseResults: (phaseId: ProgramPhaseId, selectedValue: string) => void
  closeResults: () => void
}

const INITIAL_ROBOTS: RobotState[] = [
  { id: 'A', status: 'idle', experimentId: null },
  { id: 'B', status: 'idle', experimentId: null },
  { id: 'C', status: 'idle', experimentId: null },
]

const INITIAL_SCIENTISTS: ScientistState[] = [
  { id: 'A', task: null },
  { id: 'B', task: null },
  { id: 'C', task: null },
]

function makeId(): string {
  return `${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

function assignToRobot(
  robots: RobotState[],
  queue: ExperimentRequest[],
  newRequest: ExperimentRequest,
): { queue: ExperimentRequest[]; robots: RobotState[] } {
  const idleRobot = robots.find((r) => r.status === 'idle')
  if (idleRobot) {
    const running = { ...newRequest, robotId: idleRobot.id, status: 'running' as ExperimentStatus }
    return {
      queue: [...queue, running],
      robots: robots.map((r) =>
        r.id === idleRobot.id ? { ...r, status: 'running' as RobotStatus, experimentId: newRequest.id } : r
      ),
    }
  }
  return { queue: [...queue, newRequest], robots }
}

export const useLabStore = create<LabStore>((set, get) => ({
  robots: INITIAL_ROBOTS,
  queue: [],
  requestPanelOpen: false,
  scientists: INITIAL_SCIENTISTS,
  selectedScientistId: null,
  program: null,
  programPanelOpen: false,
  resultsPhaseId: null,

  openRequestPanel: () => set({ requestPanelOpen: true }),
  closeRequestPanel: () => set({ requestPanelOpen: false }),

  openProgramPanel: () => set({ programPanelOpen: true }),
  closeProgramPanel: () => set({ programPanelOpen: false }),

  closeResults: () => set({ resultsPhaseId: null }),

  selectScientist: (id) => set({ selectedScientistId: id }),

  assignTask: (scientistId, taskType) => {
    const ws  = TASK_WORKSTATIONS[taskType]
    const def = SCIENTIST_TASK_DEFS[taskType]
    const task: ScientistTask = { type: taskType, label: def.label, accentColor: def.accentColor, workstationX: ws.x, workstationZ: ws.z, facingY: ws.facingY }
    set((s) => ({
      scientists: s.scientists.map((sc) =>
        sc.id === scientistId ? { ...sc, task } : sc
      ),
      selectedScientistId: null,
    }))
  },

  clearTask: (scientistId) => {
    set((s) => ({
      scientists: s.scientists.map((sc) =>
        sc.id === scientistId ? { ...sc, task: null } : sc
      ),
      selectedScientistId: null,
    }))
  },

  startProgram: () => {
    set({ program: createPCSK9Program(), programPanelOpen: true })
  },

  startPhase: (phaseId) => {
    const { program, robots, queue } = get()
    if (!program) return

    const phase = program.phases.find((p) => p.id === phaseId)
    if (!phase || phase.status !== 'unlocked') return

    const id = makeId()
    const newRequest: ExperimentRequest = {
      id,
      type: phase.experimentType,
      requestedAt: Date.now(),
      robotId: null,
      status: 'pending',
      accentColor: phase.accentColor,
      programPhaseId: phaseId,
      label: `Phase ${phase.phaseNumber}: ${phase.name}`,
    }

    const assigned = assignToRobot(robots, queue, newRequest)

    const updatedProgram: Program = {
      ...program,
      phases: program.phases.map((p) =>
        p.id === phaseId ? { ...p, status: 'running' } : p
      ),
    }

    set({ ...assigned, program: updatedProgram, programPanelOpen: false })
  },

  confirmPhaseResults: (phaseId, selectedValue) => {
    set((s) => {
      if (!s.program) return s

      let results: PhaseResults | undefined
      if (phaseId === 'target-validation') {
        results = { kind: 'target-validation', genes: PHASE1_GENES, selectedTarget: selectedValue }
      } else if (phaseId === 'guide-screen') {
        results = { kind: 'guide-screen', guides: PHASE2_GUIDES, selectedGuide: selectedValue }
      }

      // Map of which phase unlocks after each phase completes
      const NEXT_PHASE: Partial<Record<ProgramPhaseId, ProgramPhaseId>> = {
        'target-validation':   'guide-screen',
        'guide-screen':        'delivery-opt',
        'delivery-opt':        'functional-validation',
        'functional-validation': 'safety-screen',
      }
      const nextId = NEXT_PHASE[phaseId]

      const updatedPhases = s.program.phases.map((p) => {
        if (p.id === phaseId)  return { ...p, status: 'complete' as const, results }
        if (p.id === nextId)   return { ...p, status: 'unlocked' as const }
        return p
      })

      return {
        program: {
          ...s.program,
          targetGene:    phaseId === 'target-validation' ? selectedValue : s.program.targetGene,
          selectedGuide: phaseId === 'guide-screen'      ? selectedValue : s.program.selectedGuide,
          phases: updatedPhases,
        },
        resultsPhaseId: null,
      }
    })
  },

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

    const { robots, queue } = get()
    const assigned = assignToRobot(robots, queue, newRequest)
    set({ ...assigned, requestPanelOpen: false })
  },

  robotComplete: (robotId) => {
    set((s) => {
      const robot = s.robots.find((r) => r.id === robotId)
      if (!robot) return s

      const completingExp = s.queue.find((e) => e.id === robot.experimentId)
      const programPhaseId = completingExp?.programPhaseId

      const updatedQueue = s.queue.map((e) =>
        e.id === robot.experimentId ? { ...e, status: 'complete' as ExperimentStatus } : e
      )

      const nextPending = updatedQueue.find((e) => e.status === 'pending')

      // If this was a program experiment, mark the phase as awaiting results
      // and open the results drawer
      let updatedProgram = s.program
      let newResultsPhaseId = s.resultsPhaseId

      if (programPhaseId && s.program) {
        updatedProgram = {
          ...s.program,
          phases: s.program.phases.map((p) =>
            p.id === programPhaseId ? { ...p, status: 'awaiting-results' } : p
          ),
        }
        newResultsPhaseId = programPhaseId
      }

      if (nextPending) {
        return {
          queue: updatedQueue.map((e) =>
            e.id === nextPending.id
              ? { ...e, robotId, status: 'running' as ExperimentStatus }
              : e
          ),
          robots: s.robots.map((r) =>
            r.id === robotId ? { ...r, experimentId: nextPending.id } : r
          ),
          program: updatedProgram,
          resultsPhaseId: newResultsPhaseId,
        }
      } else {
        return {
          queue: updatedQueue,
          robots: s.robots.map((r) =>
            r.id === robotId ? { ...r, status: 'idle' as RobotStatus, experimentId: null } : r
          ),
          program: updatedProgram,
          resultsPhaseId: newResultsPhaseId,
        }
      }
    })
  },
}))
