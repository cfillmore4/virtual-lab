import { useLabStore } from '../../store/labStore'
import { EXPERIMENT_CONFIGS } from '../../types/experiment'
import type { ExperimentRequest } from '../../store/labStore'

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60)  return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60)  return `${m}m ago`
  return `${Math.floor(m / 60)}h ago`
}

function ExperimentRow({ exp }: { exp: ExperimentRequest }) {
  const cfg = EXPERIMENT_CONFIGS[exp.type]
  const isPending  = exp.status === 'pending'
  const isRunning  = exp.status === 'running'
  const isComplete = exp.status === 'complete'

  const statusColor = isRunning ? cfg.accentColor : isComplete ? '#10b981' : '#475569'
  const statusLabel = isRunning
    ? (exp.robotId ? `ROBOT ${exp.robotId}` : 'STARTING')
    : isComplete
    ? 'COMPLETE'
    : 'QUEUED'

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 10px',
      borderRadius: 8,
      background: isRunning
        ? `${cfg.accentColor}0c`
        : isComplete
        ? 'rgba(16,185,129,0.05)'
        : 'rgba(255,255,255,0.02)',
      border: `1px solid ${isRunning ? cfg.accentColor + '30' : '#111e2e'}`,
      marginBottom: 6,
      transition: 'background 0.3s',
    }}>
      {/* Status dot */}
      <div style={{
        width: 7,
        height: 7,
        borderRadius: '50%',
        flexShrink: 0,
        background: statusColor,
        boxShadow: isRunning ? `0 0 8px ${statusColor}` : 'none',
        animation: isRunning ? 'none' : undefined,
      }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          color: isRunning ? cfg.accentColor : isComplete ? '#10b981' : '#64748b',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {cfg.shortName}
        </div>
        <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#334155', marginTop: 1 }}>
          {timeAgo(exp.requestedAt)}
        </div>
      </div>

      <div style={{
        fontSize: 8,
        fontFamily: 'monospace',
        letterSpacing: '0.12em',
        color: statusColor,
        background: `${statusColor}15`,
        border: `1px solid ${statusColor}30`,
        borderRadius: 4,
        padding: '2px 6px',
        whiteSpace: 'nowrap',
      }}>
        {statusLabel}
      </div>
    </div>
  )
}

export default function QueueSidebar() {
  const queue  = useLabStore((s) => s.queue)
  const robots = useLabStore((s) => s.robots)

  const running  = queue.filter((e) => e.status === 'running')
  const pending  = queue.filter((e) => e.status === 'pending')
  const recent   = queue.filter((e) => e.status === 'complete').slice(-4).reverse()

  const idleCount    = robots.filter((r) => r.status === 'idle').length
  const runningCount = robots.filter((r) => r.status === 'running').length

  if (queue.length === 0) {
    return (
      <div style={{
        position: 'absolute', top: 20, right: 20,
        background: 'rgba(4,9,18,0.75)',
        border: '1px solid #111e2e',
        borderRadius: 10,
        padding: '10px 14px',
        backdropFilter: 'blur(10px)',
        pointerEvents: 'none',
      }}>
        <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#2a3a4a', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          All robots standby
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          {['A', 'B', 'C'].map((id) => (
            <span key={id} style={{
              fontSize: 9, fontFamily: 'monospace', color: '#3a5a7a',
              background: 'rgba(0,212,255,0.05)', border: '1px solid #1a2940',
              borderRadius: 4, padding: '2px 7px',
            }}>
              {id}
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'absolute', top: 20, right: 20,
      width: 220,
      background: 'rgba(4,9,18,0.88)',
      border: '1px solid #1a2940',
      borderRadius: 12,
      padding: '14px 14px 10px',
      backdropFilter: 'blur(14px)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      maxHeight: 'calc(100vh - 40px)',
      overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 9, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.18em', color: '#00d4ff', marginBottom: 5 }}>
          Lab Status
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#10b981' }}>
            {runningCount} running
          </span>
          <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#475569' }}>·</span>
          <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#475569' }}>
            {idleCount} idle
          </span>
          {pending.length > 0 && (
            <>
              <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#475569' }}>·</span>
              <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#f59e0b' }}>
                {pending.length} queued
              </span>
            </>
          )}
        </div>
      </div>

      {/* Running */}
      {running.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 8, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#1a3a5a', marginBottom: 6 }}>
            Active
          </div>
          {running.map((e) => <ExperimentRow key={e.id} exp={e} />)}
        </div>
      )}

      {/* Pending queue */}
      {pending.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 8, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#1a3a5a', marginBottom: 6 }}>
            Queue ({pending.length})
          </div>
          {pending.map((e) => <ExperimentRow key={e.id} exp={e} />)}
        </div>
      )}

      {/* Recent completed */}
      {recent.length > 0 && (
        <div>
          <div style={{ fontSize: 8, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#1a3a5a', marginBottom: 6 }}>
            Recent
          </div>
          {recent.map((e) => <ExperimentRow key={e.id} exp={e} />)}
        </div>
      )}
    </div>
  )
}
