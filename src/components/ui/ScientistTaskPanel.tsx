import { useLabStore, SCIENTIST_TASK_DEFS } from '../../store/labStore'
import type { ScientistTaskType } from '../../store/labStore'

const TASK_ORDER: ScientistTaskType[] = ['pcr', 'sequencing', 'analysis', 'sample-prep']

export default function ScientistTaskPanel() {
  const selectedId       = useLabStore((s) => s.selectedScientistId)
  const scientists       = useLabStore((s) => s.scientists)
  const assignTask       = useLabStore((s) => s.assignTask)
  const clearTask        = useLabStore((s) => s.clearTask)
  const selectScientist  = useLabStore((s) => s.selectScientist)

  if (!selectedId) return null

  const scientist = scientists.find((s) => s.id === selectedId)
  if (!scientist) return null

  const routeLabel: Record<string, string> = { A: 'Scientist A', B: 'Scientist B', C: 'Scientist C' }

  return (
    <div style={{
      position: 'absolute',
      bottom: 80,
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(10,22,40,0.97)',
      border: '1px solid #1e4260',
      borderRadius: 14,
      padding: '16px 20px',
      minWidth: 290,
      backdropFilter: 'blur(16px)',
      boxShadow: '0 8px 40px rgba(0,0,0,0.65)',
      zIndex: 20,
    }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#7ab8cc', marginBottom: 2 }}>
            Task Assignment
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', letterSpacing: '0.05em' }}>
            {routeLabel[selectedId]}
          </div>
        </div>
        <button
          onClick={() => selectScientist(null)}
          style={{
            background: 'none', border: '1px solid #1e4260', borderRadius: 6,
            color: '#7ab8cc', cursor: 'pointer', fontSize: 13,
            lineHeight: 1, padding: '4px 8px', transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#b0cce0'; e.currentTarget.style.borderColor = '#5a9ab8' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#7ab8cc'; e.currentTarget.style.borderColor = '#1e4260' }}
        >
          ✕
        </button>
      </div>

      {/* Current task indicator */}
      {scientist.task && (
        <div style={{
          marginBottom: 12,
          padding: '8px 12px',
          background: `${scientist.task.accentColor}12`,
          border: `1px solid ${scientist.task.accentColor}40`,
          borderRadius: 8,
        }}>
          <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#7ab8cc', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 3 }}>
            Current Task
          </div>
          <div style={{ fontSize: 13, color: scientist.task.accentColor, fontWeight: 600 }}>
            {scientist.task.label}
          </div>
        </div>
      )}

      {/* Task grid */}
      <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#7ab8cc', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>
        {scientist.task ? 'Reassign Task' : 'Assign Task'}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {TASK_ORDER.map((type) => {
          const def      = SCIENTIST_TASK_DEFS[type]
          const isActive = scientist.task?.type === type
          return (
            <button
              key={type}
              onClick={() => assignTask(selectedId, type)}
              style={{
                background: isActive ? `${def.accentColor}22` : 'rgba(12,24,42,0.8)',
                border: `1px solid ${isActive ? def.accentColor : '#1e4260'}`,
                borderRadius: 8,
                padding: '9px 11px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.18s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${def.accentColor}1e`
                e.currentTarget.style.borderColor = def.accentColor
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isActive ? `${def.accentColor}22` : 'rgba(12,24,42,0.8)'
                e.currentTarget.style.borderColor = isActive ? def.accentColor : '#1e4260'
              }}
            >
              <div style={{
                fontSize: 11, fontWeight: 600,
                color: isActive ? def.accentColor : '#8ec8dc',
                fontFamily: 'monospace',
                letterSpacing: '0.04em',
                transition: 'color 0.18s',
              }}>
                {def.label}
              </div>
            </button>
          )
        })}
      </div>

      {/* Clear task */}
      {scientist.task && (
        <button
          onClick={() => clearTask(selectedId)}
          style={{
            width: '100%',
            marginTop: 10,
            padding: '8px',
            background: 'transparent',
            border: '1px solid #1e4260',
            borderRadius: 8,
            color: '#7ab8cc',
            fontFamily: 'monospace',
            fontSize: 9,
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
            cursor: 'pointer',
            transition: 'all 0.18s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#b0cce0'; e.currentTarget.style.borderColor = '#5a9ab8' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#7ab8cc'; e.currentTarget.style.borderColor = '#1e4260' }}
        >
          Clear Task — Resume Patrol
        </button>
      )}
    </div>
  )
}
