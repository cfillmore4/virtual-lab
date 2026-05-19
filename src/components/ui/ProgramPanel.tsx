import { useEffect, useState } from 'react'
import { useLabStore } from '../../store/labStore'
import type { ProgramPhaseId } from '../../types/program'

const PHASE_ICONS: Record<ProgramPhaseId, string> = {
  'target-validation':    '🔬',
  'guide-screen':         '🧬',
  'delivery-opt':         '💉',
  'functional-validation':'⚗️',
  'safety-screen':        '🛡️',
}

const STATUS_LABEL: Record<string, string> = {
  locked:           'LOCKED',
  unlocked:         'READY',
  running:          'RUNNING',
  'awaiting-results': 'ANALYZING',
  complete:         'COMPLETE',
}

export default function ProgramPanel() {
  const { program, closeProgramPanel, startProgram, startPhase } = useLabStore()
  const [visible, setVisible] = useState(false)
  const [selectedPhaseId, setSelectedPhaseId] = useState<ProgramPhaseId | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30)
    return () => clearTimeout(t)
  }, [])

  // Auto-select the first non-locked phase
  useEffect(() => {
    if (!program) return
    const first = program.phases.find((p) => p.status !== 'locked')
    if (first && !selectedPhaseId) setSelectedPhaseId(first.id)
  }, [program, selectedPhaseId])

  function handleClose() {
    setVisible(false)
    setTimeout(closeProgramPanel, 260)
  }

  function handleStart() {
    if (!program) {
      startProgram()
      return
    }
    if (selectedPhaseId) startPhase(selectedPhaseId)
  }

  const selectedPhase = program?.phases.find((p) => p.id === selectedPhaseId)

  const canStart =
    selectedPhase?.status === 'unlocked' ||
    (!program)

  return (
    <div
      style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      paddingBottom: 24,
        background: 'rgba(2,8,16,0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 20,
        transition: 'opacity 0.25s',
        opacity: visible ? 1 : 0,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div style={{
        width: '100%',
        maxWidth: 900,
        maxHeight: 'calc(88vh - 40px)',
        overflowY: 'auto',
        background: 'rgba(4,9,18,0.97)',
        border: '1px solid #1a2940',
        borderRadius: 16,
        padding: '28px 28px 36px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 -16px 60px rgba(0,0,0,0.75)',
        transform: visible ? 'translateY(0)' : 'translateY(40px)',
        transition: 'transform 0.28s cubic-bezier(0.22,1,0.36,1)',
      }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 9, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.22em', color: '#ff6b35', marginBottom: 4 }}>
              Research Program
            </div>
            <h2 style={{ margin: '0 0 2px', fontSize: 18, fontWeight: 700, color: 'white' }}>
              {program ? program.name : 'PCSK9 Gene Editing Program'}
            </h2>
            <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#475569', letterSpacing: '0.08em' }}>
              {program ? program.diseaseArea : 'Cardiovascular — Hypercholesterolemia'}
              {program?.targetGene && (
                <span style={{ color: '#ff6b35', marginLeft: 10 }}>
                  TARGET: {program.targetGene}
                </span>
              )}
              {program?.selectedGuide && (
                <span style={{ color: '#00d4ff', marginLeft: 10 }}>
                  GUIDE: {program.selectedGuide}
                </span>
              )}
              {program?.selectedFormulation && (
                <span style={{ color: '#a855f7', marginLeft: 10 }}>
                  FORM: {program.selectedFormulation}
                </span>
              )}
              {program?.safetyCleared && (
                <span style={{ color: '#f59e0b', marginLeft: 10 }}>
                  ✓ SAFETY
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'none', border: '1px solid #1a2940', borderRadius: 6,
              color: '#475569', fontFamily: 'monospace', fontSize: 11,
              padding: '5px 12px', cursor: 'pointer',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#334155' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#1a2940' }}
          >
            ✕ Close
          </button>
        </div>

        {/* ── Phase timeline cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 22 }}>
          {(program?.phases ?? placeholderPhases).map((phase, i) => {
            const isSelected = selectedPhaseId === phase.id
            const isLocked = phase.status === 'locked'
            const isComplete = phase.status === 'complete'
            const color = phase.accentColor

            return (
              <button
                key={phase.id}
                onClick={() => !isLocked && setSelectedPhaseId(phase.id as ProgramPhaseId)}
                style={{
                  background: isSelected
                    ? `${color}14`
                    : isComplete ? 'rgba(16,185,129,0.06)' : 'rgba(8,16,28,0.8)',
                  border: `1px solid ${isSelected ? color : isComplete ? '#10b98144' : '#1a2940'}`,
                  borderRadius: 10,
                  padding: '12px 12px 14px',
                  cursor: isLocked ? 'default' : 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                  opacity: isLocked ? 0.45 : 1,
                  boxShadow: isSelected ? `0 0 18px ${color}22` : 'none',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  if (!isLocked && !isSelected)
                    e.currentTarget.style.borderColor = `${color}55`
                }}
                onMouseLeave={(e) => {
                  if (!isLocked && !isSelected)
                    e.currentTarget.style.borderColor = isComplete ? '#10b98144' : '#1a2940'
                }}
              >
                {isSelected && (
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                    background: color, boxShadow: `0 0 8px ${color}`,
                    borderRadius: '10px 0 0 10px',
                  }} />
                )}

                {/* Phase number + connector line */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: isComplete ? '#10b981' : isSelected ? color : '#0d1a2a',
                    border: `1px solid ${isComplete ? '#10b981' : isSelected ? color : '#1a2940'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontFamily: 'monospace', fontWeight: 700,
                    color: isComplete ? '#050a0f' : isSelected ? '#050a0f' : '#334155',
                    flexShrink: 0,
                  }}>
                    {isComplete ? '✓' : phase.phaseNumber}
                  </div>
                  {i < 4 && (
                    <div style={{
                      flex: 1, height: 1,
                      background: isComplete ? '#10b98144' : '#1a2940',
                    }} />
                  )}
                </div>

                <div style={{ fontSize: 10, fontWeight: 700, color: isSelected ? color : '#94a3b8', marginBottom: 4, letterSpacing: '0.04em' }}>
                  {PHASE_ICONS[phase.id as ProgramPhaseId]} {phase.name}
                </div>
                <div style={{
                  fontSize: 8, fontFamily: 'monospace', letterSpacing: '0.12em',
                  color: isComplete ? '#10b981' : phase.status === 'running' ? color : '#334155',
                  background: isComplete ? 'rgba(16,185,129,0.12)' : phase.status === 'running' ? `${color}18` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isComplete ? '#10b98133' : phase.status === 'running' ? `${color}44` : '#1a2940'}`,
                  borderRadius: 3,
                  padding: '2px 5px',
                  display: 'inline-block',
                }}>
                  {STATUS_LABEL[phase.status] ?? 'LOCKED'}
                </div>
              </button>
            )
          })}
        </div>

        {/* ── Selected phase detail ── */}
        {selectedPhase && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 24,
            borderTop: '1px solid #0d1a2a',
            paddingTop: 20,
          }}>
            {/* Left: objective + detail */}
            <div>
              <div style={{ fontSize: 9, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.18em', color: '#334155', marginBottom: 6 }}>
                Phase {selectedPhase.phaseNumber} · {selectedPhase.name} · {selectedPhase.experimentType.toUpperCase()}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'white', marginBottom: 8, lineHeight: 1.4 }}>
                {selectedPhase.objective}
              </div>
              <div style={{ fontSize: 10, color: '#475569', lineHeight: 1.55, marginBottom: 12, maxWidth: 520 }}>
                {selectedPhase.detail}
              </div>

              {/* Instrument pipeline */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['Hamilton STAR', ...getInstruments(selectedPhase.experimentType)].map((inst) => (
                  <span key={inst} style={{
                    fontSize: 9, fontFamily: 'monospace', color: '#64748b',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid #1a2940',
                    borderRadius: 4, padding: '2px 8px',
                  }}>
                    {inst}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: plate map + CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14, minWidth: 220 }}>
              {selectedPhase.plateSamples.length > 0 && (
                <div>
                  <div style={{ fontSize: 9, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#334155', marginBottom: 8, textAlign: 'right' }}>
                    96-Well Plate Map
                  </div>
                  <PlateMap samples={selectedPhase.plateSamples} accentColor={selectedPhase.accentColor} />
                  {/* Legend */}
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
                    {selectedPhase.plateSamples.map((s) => (
                      <div key={s.group} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, opacity: 0.8 }} />
                        <span style={{ fontSize: 8, fontFamily: 'monospace', color: '#475569' }}>{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <button
                onClick={handleStart}
                disabled={!canStart}
                style={{
                  fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.16em', textTransform: 'uppercase',
                  color: canStart ? '#050a0f' : '#2a3a4a',
                  background: canStart
                    ? `linear-gradient(135deg, ${selectedPhase.accentColor}, ${selectedPhase.accentColor}bb)`
                    : '#0d1a2a',
                  border: 'none', borderRadius: 7,
                  padding: '10px 22px', cursor: canStart ? 'pointer' : 'not-allowed',
                  boxShadow: canStart ? `0 0 20px ${selectedPhase.accentColor}44` : 'none',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >
                {selectedPhase.status === 'complete' ? '✓ Phase Complete' :
                 selectedPhase.status === 'running' ? '⟳ In Progress' :
                 selectedPhase.status === 'awaiting-results' ? '⟳ Analyzing...' :
                 selectedPhase.status === 'unlocked' ? `▶ Start Phase ${selectedPhase.phaseNumber} →` :
                 '🔒 Locked'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Mini plate map ────────────────────────────────────────────────────────────

function PlateMap({ samples, accentColor }: { samples: { cols: number[]; color: string; group: string }[]; accentColor: string }) {
  const colColorMap: Record<number, string> = {}
  for (const s of samples) {
    for (const col of s.cols) colColorMap[col] = s.color
  }

  const ROWS = 8
  const COLS = 12
  const CELL = 11
  const GAP = 2

  return (
    <svg
      width={COLS * (CELL + GAP) - GAP}
      height={ROWS * (CELL + GAP) - GAP}
      style={{ display: 'block' }}
    >
      {Array.from({ length: ROWS }, (_, row) =>
        Array.from({ length: COLS }, (_, col) => {
          const colNum = col + 1
          const color = colColorMap[colNum] ?? '#0d1a2a'
          const hasColor = !!colColorMap[colNum]
          return (
            <rect
              key={`${row}-${col}`}
              x={col * (CELL + GAP)}
              y={row * (CELL + GAP)}
              width={CELL}
              height={CELL}
              rx={2}
              fill={hasColor ? color : '#0d1a2a'}
              opacity={hasColor ? 0.75 : 1}
              stroke={hasColor ? color : '#1a2940'}
              strokeWidth={0.5}
            />
          )
        })
      )}
    </svg>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInstruments(type: string): string[] {
  const MAP: Record<string, string[]> = {
    rnaseq:   ['Agilent TapeStation', 'Illumina NovaSeq'],
    amplicon: ['BioRad C1000', 'Illumina MiSeq'],
    scrna:    ['10x Chromium X', 'Illumina NovaSeq X'],
    massspec: ['Thermo SpeedVac', 'Orbitrap Eclipse'],
  }
  return MAP[type] ?? []
}

// Placeholder for when program hasn't been created yet
const placeholderPhases = [
  { id: 'target-validation' as ProgramPhaseId, phaseNumber: 1, name: 'Target Validation',    accentColor: '#ff6b35', status: 'unlocked' as const },
  { id: 'guide-screen'      as ProgramPhaseId, phaseNumber: 2, name: 'Guide Screen',          accentColor: '#00d4ff', status: 'locked'   as const },
  { id: 'delivery-opt'      as ProgramPhaseId, phaseNumber: 3, name: 'Delivery Optimization', accentColor: '#a855f7', status: 'locked'   as const },
  { id: 'functional-validation' as ProgramPhaseId, phaseNumber: 4, name: 'Functional Validation', accentColor: '#10b981', status: 'locked' as const },
  { id: 'safety-screen'     as ProgramPhaseId, phaseNumber: 5, name: 'Off-Target Safety',     accentColor: '#f59e0b', status: 'locked'   as const },
]
