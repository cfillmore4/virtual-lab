import { useState } from 'react'
import { useLabStore } from '../../store/labStore'
import { EXPERIMENT_CONFIGS } from '../../types/experiment'
import type { ExperimentType } from '../../types/experiment'

const EXPERIMENTS: ExperimentType[] = ['amplicon', 'rnaseq', 'scrna', 'massspec']

export default function RequestPanel() {
  const [selected, setSelected] = useState<ExperimentType | null>(null)
  const { requestExperiment, closeRequestPanel } = useLabStore()

  function handleConfirm() {
    if (!selected) return
    requestExperiment(selected)
  }

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      background: 'rgba(2,8,16,0.6)',
      backdropFilter: 'blur(4px)',
      zIndex: 10,
    }}
      onClick={(e) => { if (e.target === e.currentTarget) closeRequestPanel() }}
    >
      <div style={{
        width: '100%',
        maxWidth: 860,
        background: 'rgba(4,9,18,0.95)',
        border: '1px solid #1a2940',
        borderBottom: 'none',
        borderRadius: '16px 16px 0 0',
        padding: '28px 28px 36px',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 -12px 48px rgba(0,0,0,0.7)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 9, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.22em', color: '#00d4ff', marginBottom: 4 }}>
              New Experiment Request
            </div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'white' }}>
              Select Experiment Type
            </h2>
          </div>
          <button
            onClick={closeRequestPanel}
            style={{
              background: 'none', border: '1px solid #1a2940', borderRadius: 6,
              color: '#475569', fontFamily: 'monospace', fontSize: 11,
              padding: '5px 12px', cursor: 'pointer',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#334155' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#1a2940' }}
          >
            ✕ Cancel
          </button>
        </div>

        {/* Experiment cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 20,
        }}>
          {EXPERIMENTS.map((type) => {
            const cfg = EXPERIMENT_CONFIGS[type]
            const isSelected = selected === type
            return (
              <button
                key={type}
                onClick={() => setSelected(type)}
                style={{
                  background: isSelected ? `${cfg.accentColor}12` : 'rgba(8,16,28,0.8)',
                  border: `1px solid ${isSelected ? cfg.accentColor : '#1a2940'}`,
                  borderRadius: 10,
                  padding: '14px 14px 16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                  boxShadow: isSelected ? `0 0 20px ${cfg.accentColor}25, inset 0 0 16px ${cfg.accentColor}08` : 'none',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = `${cfg.accentColor}66`
                    e.currentTarget.style.background = `${cfg.accentColor}08`
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#1a2940'
                    e.currentTarget.style.background = 'rgba(8,16,28,0.8)'
                  }
                }}
              >
                {/* Accent left border on selection */}
                {isSelected && (
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                    background: cfg.accentColor,
                    boxShadow: `0 0 8px ${cfg.accentColor}`,
                    borderRadius: '10px 0 0 10px',
                  }} />
                )}

                <div style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: isSelected ? cfg.accentColor : '#94a3b8',
                  marginBottom: 6,
                  transition: 'color 0.15s',
                }}>
                  {cfg.shortName}
                </div>
                <div style={{
                  fontSize: 10,
                  color: '#475569',
                  lineHeight: 1.45,
                  marginBottom: 10,
                }}>
                  {cfg.description}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 9, fontFamily: 'monospace',
                    color: isSelected ? cfg.accentColor : '#334155',
                    background: isSelected ? `${cfg.accentColor}18` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isSelected ? cfg.accentColor + '44' : '#1a2940'}`,
                    borderRadius: 4,
                    padding: '2px 6px',
                    letterSpacing: '0.08em',
                  }}>
                    ⏱ {cfg.prepTime}
                  </span>
                  <span style={{
                    fontSize: 9, fontFamily: 'monospace',
                    color: '#334155',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid #1a2940',
                    borderRadius: 4,
                    padding: '2px 6px',
                    letterSpacing: '0.04em',
                  }}>
                    {cfg.outputType}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Instruments row */}
        {selected && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 9, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#334155', marginBottom: 8 }}>
              Instrument pipeline
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {EXPERIMENT_CONFIGS[selected].instruments.map((inst) => (
                <span key={inst} style={{
                  fontSize: 10, fontFamily: 'monospace',
                  color: '#64748b',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid #1a2940',
                  borderRadius: 5,
                  padding: '4px 10px',
                }}>
                  {inst}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Confirm button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleConfirm}
            disabled={!selected}
            style={{
              fontFamily: 'monospace',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: selected ? '#050a0f' : '#2a3a4a',
              background: selected
                ? `linear-gradient(135deg, ${EXPERIMENT_CONFIGS[selected].accentColor}, ${EXPERIMENT_CONFIGS[selected].accentColor}bb)`
                : '#0d1a2a',
              border: 'none',
              borderRadius: 7,
              padding: '10px 28px',
              cursor: selected ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              boxShadow: selected
                ? `0 0 20px ${EXPERIMENT_CONFIGS[selected].accentColor}44`
                : 'none',
            }}
          >
            Submit to Queue →
          </button>
        </div>
      </div>
    </div>
  )
}
