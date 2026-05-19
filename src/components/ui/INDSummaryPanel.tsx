import { useEffect, useRef } from 'react'
import { useLabStore } from '../../store/labStore'

const GOLD   = '#f59e0b'
const GOLD2  = '#fbbf24'
const GREEN  = '#10b981'
const CYAN   = '#00d4ff'
const PURPLE = '#7c3aed'
const ORANGE = '#ff6b35'

const PHASE_ROWS = [
  { num: 1, label: 'Target Validation',     color: CYAN,   field: 'targetGene'          },
  { num: 2, label: 'Guide Screen',          color: PURPLE, field: 'selectedGuide'        },
  { num: 3, label: 'LNP Delivery Opt.',     color: ORANGE, field: 'selectedFormulation'  },
  { num: 4, label: 'Functional Validation', color: GREEN,  field: 'confirmedEfficacy'    },
  { num: 5, label: 'Off-Target Safety',     color: GOLD,   field: 'safetyCleared'        },
] as const

function phaseValue(program: ReturnType<typeof useLabStore.getState>['program'], field: string): string {
  if (!program) return '—'
  if (field === 'targetGene')         return program.targetGene         ?? '—'
  if (field === 'selectedGuide')      return program.selectedGuide      ?? '—'
  if (field === 'selectedFormulation') return program.selectedFormulation ?? '—'
  if (field === 'confirmedEfficacy')  return program.confirmedEfficacy  ? '≥30% LDL-C reduction confirmed' : '—'
  if (field === 'safetyCleared')      return program.safetyCleared      ? 'All 10 loci <1% editing' : '—'
  return '—'
}

export default function INDSummaryPanel() {
  const program      = useLabStore((s) => s.program)
  const closeIndPanel = useLabStore((s) => s.closeIndPanel)
  const panelRef     = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = panelRef.current
    if (!el) return
    el.style.opacity = '0'
    el.style.transform = 'scale(0.93) translateY(16px)'
    requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.45s ease, transform 0.45s ease'
      el.style.opacity = '1'
      el.style.transform = 'scale(1) translateY(0)'
    })
  }, [])

  if (!program) return null

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.72)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 30, padding: '24px 16px',
    }}>
      <div
        ref={panelRef}
        style={{
          background: 'linear-gradient(160deg, #0f2438 0%, #0a1c30 100%)',
          border: `1.5px solid ${GOLD}66`,
          borderRadius: 16,
          width: '100%', maxWidth: 840,
          maxHeight: '92vh', overflowY: 'auto',
          boxShadow: `0 0 80px ${GOLD}22, 0 24px 64px rgba(0,0,0,0.7)`,
          padding: '36px 40px 32px',
          fontFamily: 'monospace',
          color: '#e2e8f0',
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.35em', textTransform: 'uppercase', color: GOLD, marginBottom: 6 }}>
              Investigational New Drug Application · Pre-Filing Package
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: '0.08em', color: '#f8fafc', lineHeight: 1.1 }}>
              PCSK9 GENE EDITING<br />
              <span style={{ color: GOLD }}>PROGRAM SUMMARY</span>
            </div>
            <div style={{ marginTop: 10, fontSize: 10, color: '#8ec8dc', letterSpacing: '0.12em' }}>
              {program.name} · {program.diseaseArea}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              display: 'inline-block',
              background: `${GREEN}22`,
              border: `1px solid ${GREEN}88`,
              borderRadius: 8, padding: '8px 18px',
              color: GREEN, fontSize: 11, fontWeight: 700, letterSpacing: '0.2em',
              textTransform: 'uppercase', marginBottom: 8,
            }}>
              ✓ IND READY
            </div>
            <div style={{ fontSize: 9, color: '#7ab8cc', letterSpacing: '0.1em' }}>
              ALL PRECLINICAL<br />CRITERIA MET
            </div>
          </div>
        </div>

        <div style={{ borderTop: `1px solid #1e4260`, marginBottom: 28 }} />

        {/* ── Key Data Cards ──────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Target Gene',       value: program.targetGene ?? '—',         color: CYAN   },
            { label: 'Lead Guide RNA',    value: program.selectedGuide ?? '—',       color: PURPLE },
            { label: 'LNP Formulation',   value: program.selectedFormulation ?? '—', color: ORANGE },
            { label: 'Peak On-Target',    value: '84% indels',                       color: GREEN  },
          ].map((card) => (
            <div key={card.label} style={{
              background: '#0c2238',
              border: `1px solid ${card.color}33`,
              borderRadius: 10, padding: '14px 16px',
            }}>
              <div style={{ fontSize: 8, letterSpacing: '0.2em', color: '#8ec8dc', textTransform: 'uppercase', marginBottom: 6 }}>
                {card.label}
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: card.color, letterSpacing: '0.05em' }}>
                {card.value}
              </div>
            </div>
          ))}
        </div>

        {/* ── Phase Timeline ──────────────────────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#8ec8dc', marginBottom: 14 }}>
            Preclinical Program — Phase Completion Summary
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PHASE_ROWS.map((row) => (
              <div key={row.num} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: '#0c2238', borderRadius: 8, padding: '10px 16px',
                border: `1px solid ${row.color}22`,
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: `${row.color}22`, border: `1.5px solid ${row.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: row.color, flexShrink: 0,
                }}>
                  {row.num}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: '#b0cce0', letterSpacing: '0.08em' }}>{row.label}</div>
                </div>
                <div style={{ fontSize: 11, color: '#cbd5e1', letterSpacing: '0.04em' }}>
                  {phaseValue(program, row.field)}
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: GREEN,
                  background: `${GREEN}18`, borderRadius: 4, padding: '2px 8px',
                }}>
                  ✓ COMPLETE
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Regulatory Checklist ────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#8ec8dc', marginBottom: 12 }}>
              IND Filing Criteria — Preclinical
            </div>
            {[
              { text: 'Target biological rationale established', done: true  },
              { text: 'Lead therapeutic candidate selected',     done: true  },
              { text: 'In vitro efficacy demonstrated',         done: true  },
              { text: 'Genotoxicity / off-target profile clear', done: true  },
            ].map((item) => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ color: GREEN, fontSize: 12 }}>✓</span>
                <span style={{ fontSize: 11, color: '#b0cce0' }}>{item.text}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#8ec8dc', marginBottom: 12 }}>
              Next Steps — Before IND Submission
            </div>
            {[
              { text: 'GLP toxicology studies (rodent + non-human primate)', done: false },
              { text: 'CMC — GMP manufacturing & lot release',                done: false },
              { text: 'Pharmacokinetics & biodistribution profiling',          done: false },
            ].map((item) => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ color: '#7ab8cc', fontSize: 12 }}>○</span>
                <span style={{ fontSize: 11, color: '#7ab8cc' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Safety Highlight ────────────────────────────────────────── */}
        <div style={{
          background: `${GOLD}0f`,
          border: `1px solid ${GOLD}44`,
          borderRadius: 10, padding: '14px 18px',
          display: 'flex', alignItems: 'center', gap: 16,
          marginBottom: 28,
        }}>
          <div style={{ fontSize: 24 }}>⚡</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: GOLD2, marginBottom: 2 }}>
              AMP-seq Safety Screen Cleared
            </div>
            <div style={{ fontSize: 10, color: '#b0cce0', lineHeight: 1.6 }}>
              G7 guide RNA shows no clinically significant off-target editing across all 10 Cas-OFFinder-predicted loci.
              Maximum detected: 0.8% at OT-1 (CELSR2 intron 8, 2 mm) — well below the 2% regulatory concern threshold.
              The off-target profile supports progression to GLP in vivo studies.
            </div>
          </div>
        </div>

        {/* ── CTA ─────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            onClick={closeIndPanel}
            style={{
              fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.15em', textTransform: 'uppercase',
              color: '#8ec8dc',
              background: 'transparent',
              border: '1px solid #1e4260', borderRadius: 8,
              padding: '12px 24px', cursor: 'pointer',
            }}
          >
            Close
          </button>
          <button
            onClick={closeIndPanel}
            style={{
              fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.15em', textTransform: 'uppercase',
              color: '#050a0f',
              background: `linear-gradient(135deg, ${GOLD}, #d97706)`,
              border: 'none', borderRadius: 8,
              padding: '12px 28px', cursor: 'pointer',
              boxShadow: `0 0 28px ${GOLD}55, 0 4px 12px rgba(0,0,0,0.4)`,
            }}
          >
            ▶ Submit IND Application
          </button>
        </div>
      </div>
    </div>
  )
}
