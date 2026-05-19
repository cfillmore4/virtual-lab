import { useEffect, useState } from 'react'
import { useLabStore } from '../../store/labStore'
import { PHASE1_GENES, PHASE1_BACKGROUND } from '../../types/program'
import type { DEGene } from '../../types/program'

// ── Volcano plot ──────────────────────────────────────────────────────────────

const W = 420
const H = 210
const ML = 38  // margin left
const MR = 14  // margin right
const MT = 14  // margin top
const MB = 34  // margin bottom

const PW = W - ML - MR  // plot width
const PH = H - MT - MB  // plot height

const FC_MIN = -5
const FC_MAX =  5
const P_MAX  = 10

function toX(fc: number) { return ML + (fc - FC_MIN) / (FC_MAX - FC_MIN) * PW }
function toY(p: number)  { return MT + PH - (p / P_MAX) * PH }

// significance thresholds
const P_THRESH  = 1.3  // -log10(0.05)
const FC_THRESH = 1.0  // |log2FC| > 1

function dotColor(gene: DEGene, isHovered: boolean): string {
  if (gene.isCandidate) return isHovered ? '#ffffff' : '#ff6b35'
  if (!gene.significant) return '#1e3050'
  if (gene.log2FC > FC_THRESH)  return '#60a5fa'
  if (gene.log2FC < -FC_THRESH) return '#818cf8'
  return '#1e3050'
}

function VolcanoPlot({ hoveredGene, onHover }: {
  hoveredGene: string | null
  onHover: (name: string | null) => void
}) {
  const threshY = toY(P_THRESH)
  const threshXL = toX(-FC_THRESH)
  const threshXR = toX(FC_THRESH)

  return (
    <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
      {/* Background */}
      <rect x={ML} y={MT} width={PW} height={PH} fill="#040912" rx={4} />

      {/* Quadrant fills */}
      <rect x={threshXR} y={MT} width={ML + PW - threshXR} height={threshY - MT}
        fill="rgba(96,165,250,0.04)" />
      <rect x={ML} y={MT} width={threshXL - ML} height={threshY - MT}
        fill="rgba(129,140,248,0.04)" />

      {/* Threshold lines */}
      <line x1={ML} y1={threshY} x2={ML + PW} y2={threshY}
        stroke="#1e3050" strokeWidth={1} strokeDasharray="4 3" />
      <line x1={threshXL} y1={MT} x2={threshXL} y2={MT + PH}
        stroke="#1e3050" strokeWidth={1} strokeDasharray="4 3" />
      <line x1={threshXR} y1={MT} x2={threshXR} y2={MT + PH}
        stroke="#1e3050" strokeWidth={1} strokeDasharray="4 3" />

      {/* Background scatter (anonymous genes) */}
      {PHASE1_BACKGROUND.map((g, i) => {
        const x = toX(Math.max(FC_MIN, Math.min(FC_MAX, g.log2FC)))
        const y = toY(Math.max(0, Math.min(P_MAX, g.negLog10P)))
        const sig = g.negLog10P > P_THRESH && Math.abs(g.log2FC) > FC_THRESH
        return (
          <circle key={i} cx={x} cy={y} r={2.2}
            fill={sig ? (g.log2FC > 0 ? 'rgba(96,165,250,0.4)' : 'rgba(129,140,248,0.4)') : '#132030'}
          />
        )
      })}

      {/* Named genes */}
      {PHASE1_GENES.map((gene) => {
        const x = toX(Math.max(FC_MIN, Math.min(FC_MAX, gene.log2FC)))
        const y = toY(Math.max(0, Math.min(P_MAX, gene.negLog10P)))
        const isHov = hoveredGene === gene.name
        const r = gene.isCandidate ? 5 : 3.5

        return (
          <g key={gene.name}
            onMouseEnter={() => onHover(gene.name)}
            onMouseLeave={() => onHover(null)}
            style={{ cursor: 'default' }}
          >
            {isHov && (
              <circle cx={x} cy={y} r={r + 4}
                fill="none" stroke={dotColor(gene, true)}
                strokeWidth={1} opacity={0.5} />
            )}
            <circle cx={x} cy={y} r={r}
              fill={dotColor(gene, isHov)}
              opacity={isHov ? 1 : gene.isCandidate ? 0.95 : 0.8}
            />
            {/* Label for candidate and notable genes */}
            {(gene.isCandidate || isHov) && (
              <text
                x={x + (gene.log2FC > 0 ? r + 3 : -(r + 3))}
                y={y - 3}
                fontSize={8}
                fontFamily="monospace"
                fill={gene.isCandidate ? '#ff6b35' : '#94a3b8'}
                textAnchor={gene.log2FC > 0 ? 'start' : 'end'}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {gene.name}
              </text>
            )}
          </g>
        )
      })}

      {/* Axes */}
      <line x1={ML} y1={MT + PH} x2={ML + PW} y2={MT + PH} stroke="#1a2940" strokeWidth={1} />
      <line x1={ML} y1={MT} x2={ML} y2={MT + PH} stroke="#1a2940" strokeWidth={1} />

      {/* X-axis ticks & labels */}
      {[-4, -2, 0, 2, 4].map((v) => (
        <g key={v}>
          <line x1={toX(v)} y1={MT + PH} x2={toX(v)} y2={MT + PH + 4} stroke="#1a2940" strokeWidth={1} />
          <text x={toX(v)} y={MT + PH + 13} fontSize={7} fontFamily="monospace" fill="#334155" textAnchor="middle">
            {v > 0 ? `+${v}` : v}
          </text>
        </g>
      ))}

      {/* Y-axis ticks & labels */}
      {[0, 2, 4, 6, 8, 10].map((v) => (
        <g key={v}>
          <line x1={ML - 4} y1={toY(v)} x2={ML} y2={toY(v)} stroke="#1a2940" strokeWidth={1} />
          <text x={ML - 6} y={toY(v) + 3} fontSize={7} fontFamily="monospace" fill="#334155" textAnchor="end">
            {v}
          </text>
        </g>
      ))}

      {/* Axis labels */}
      <text x={ML + PW / 2} y={H - 2} fontSize={8} fontFamily="monospace" fill="#334155" textAnchor="middle">
        log₂ Fold Change (Disease / Normal)
      </text>
      <text
        x={9}
        y={MT + PH / 2}
        fontSize={8}
        fontFamily="monospace"
        fill="#334155"
        textAnchor="middle"
        transform={`rotate(-90, 9, ${MT + PH / 2})`}
      >
        −log₁₀(p)
      </text>

      {/* Quadrant labels */}
      <text x={ML + PW - 4} y={MT + 10} fontSize={7} fontFamily="monospace" fill="rgba(96,165,250,0.5)" textAnchor="end">
        UP
      </text>
      <text x={ML + 4} y={MT + 10} fontSize={7} fontFamily="monospace" fill="rgba(129,140,248,0.5)" textAnchor="start">
        DOWN
      </text>
    </svg>
  )
}

// ── Gene info card ────────────────────────────────────────────────────────────

const GENE_INFO: Record<string, string> = {
  PCSK9:  'Proprotein convertase subtilisin/kexin type 9 — targets LDLR for lysosomal degradation, raises plasma LDL. Loss-of-function → low LDL; gain-of-function → familial hypercholesterolemia.',
  HMGCR:  'HMG-CoA reductase — rate-limiting enzyme in the mevalonate/cholesterol biosynthesis pathway. Primary target of statin drugs.',
  APOB:   'Apolipoprotein B-100 — structural protein of VLDL and LDL particles. Elevated in cardiovascular disease.',
  LDLR:   'Low-density lipoprotein receptor — clears LDL from plasma. Downregulated here because PCSK9 is degrading it.',
  CPT1A:  'Carnitine palmitoyltransferase 1A — rate-limiting step of mitochondrial fatty acid oxidation. Downregulated reflects metabolic shift.',
  SREBF2: 'Sterol regulatory element-binding protein 2 — master transcription factor for cholesterol biosynthesis genes.',
  FDFT1:  'Farnesyl-diphosphate farnesyltransferase 1 (squalene synthase) — first committed step of cholesterol synthesis.',
}

// ── Main drawer ───────────────────────────────────────────────────────────────

export default function ResultsDrawer() {
  const { resultsPhaseId, program, confirmPhaseResults, closeResults } = useLabStore()
  const [visible, setVisible] = useState(false)
  const [hoveredGene, setHoveredGene] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 40)
    return () => clearTimeout(t)
  }, [])

  function handleClose() {
    setVisible(false)
    setTimeout(closeResults, 280)
  }

  function handleConfirm(geneName: string) {
    if (!resultsPhaseId) return
    setVisible(false)
    setTimeout(() => confirmPhaseResults(resultsPhaseId, geneName), 280)
  }

  if (resultsPhaseId !== 'target-validation') return null

  const topUp = PHASE1_GENES
    .filter((g) => g.significant && g.log2FC > FC_THRESH)
    .sort((a, b) => b.negLog10P - a.negLog10P)
    .slice(0, 5)

  const infoGene = hoveredGene ?? 'PCSK9'
  const infoText = GENE_INFO[infoGene]

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      width: 480,
      background: 'rgba(4,9,18,0.97)',
      borderLeft: '1px solid #1a2940',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 20,
      backdropFilter: 'blur(20px)',
      boxShadow: '-16px 0 60px rgba(0,0,0,0.6)',
      transform: visible ? 'translateX(0)' : 'translateX(480px)',
      transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
      overflowY: 'auto',
    }}>

      {/* ── Header ── */}
      <div style={{
        padding: '22px 22px 18px',
        borderBottom: '1px solid #0d1a2a',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{
            fontSize: 9, fontFamily: 'monospace', textTransform: 'uppercase',
            letterSpacing: '0.2em', color: '#ff6b35',
          }}>
            Phase 1 Complete — Target Validation
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'none', border: '1px solid #1a2940', borderRadius: 5,
              color: '#475569', fontFamily: 'monospace', fontSize: 10,
              padding: '3px 9px', cursor: 'pointer', flexShrink: 0, marginLeft: 12,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#94a3b8' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#475569' }}
          >
            ✕
          </button>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 4 }}>
          RNA-seq Results
        </div>
        <div style={{ display: 'flex', gap: 14, fontSize: 9, fontFamily: 'monospace', color: '#334155' }}>
          <span>12,847 genes detected</span>
          <span style={{ color: '#1a2940' }}>|</span>
          <span style={{ color: '#60a5fa' }}>1,203 upregulated</span>
          <span style={{ color: '#1a2940' }}>|</span>
          <span style={{ color: '#818cf8' }}>1,138 downregulated</span>
        </div>
      </div>

      {/* ── Volcano plot ── */}
      <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid #0d1a2a', flexShrink: 0 }}>
        <div style={{ fontSize: 9, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#334155', marginBottom: 10 }}>
          Volcano Plot · Hover to inspect genes
        </div>
        <VolcanoPlot hoveredGene={hoveredGene} onHover={setHoveredGene} />
      </div>

      {/* ── Gene info tooltip ── */}
      <div style={{
        padding: '12px 22px',
        borderBottom: '1px solid #0d1a2a',
        minHeight: 66,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: hoveredGene === 'PCSK9' ? '#ff6b35' : '#94a3b8',
          }}>
            {infoGene}
          </span>
          {PHASE1_GENES.find((g) => g.name === infoGene) && (() => {
            const g = PHASE1_GENES.find((g) => g.name === infoGene)!
            return (
              <>
                <span style={{ fontSize: 9, fontFamily: 'monospace', color: g.log2FC > 0 ? '#60a5fa' : '#818cf8' }}>
                  log₂FC {g.log2FC > 0 ? '+' : ''}{g.log2FC.toFixed(1)}
                </span>
                <span style={{ fontSize: 9, fontFamily: 'monospace', color: '#334155' }}>
                  p = {(10 ** -g.negLog10P).toExponential(1)}
                </span>
              </>
            )
          })()}
        </div>
        {infoText && (
          <div style={{ fontSize: 9, color: '#475569', lineHeight: 1.55 }}>
            {infoText}
          </div>
        )}
      </div>

      {/* ── Top upregulated ── */}
      <div style={{ padding: '14px 22px', borderBottom: '1px solid #0d1a2a', flexShrink: 0 }}>
        <div style={{ fontSize: 9, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#334155', marginBottom: 10 }}>
          Top Upregulated Candidates
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {topUp.map((gene, i) => {
            const barPct = (gene.log2FC / 5) * 100
            return (
              <div
                key={gene.name}
                style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'default' }}
                onMouseEnter={() => setHoveredGene(gene.name)}
                onMouseLeave={() => setHoveredGene(null)}
              >
                <div style={{
                  width: 16, fontSize: 8, fontFamily: 'monospace',
                  color: '#334155', textAlign: 'right', flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                <div style={{
                  width: 56, fontSize: 10, fontWeight: gene.isCandidate ? 700 : 500,
                  color: gene.isCandidate ? '#ff6b35' : '#94a3b8',
                  flexShrink: 0,
                }}>
                  {gene.name}
                </div>
                <div style={{ flex: 1, background: '#0d1a2a', borderRadius: 2, height: 6, overflow: 'hidden' }}>
                  <div style={{
                    width: `${barPct}%`,
                    height: '100%',
                    background: gene.isCandidate
                      ? 'linear-gradient(90deg, #ff6b35, #ff6b3566)'
                      : 'linear-gradient(90deg, #60a5fa, #60a5fa44)',
                    borderRadius: 2,
                    transition: 'width 0.4s ease',
                  }} />
                </div>
                <div style={{
                  width: 36, fontSize: 8, fontFamily: 'monospace',
                  color: '#60a5fa', textAlign: 'right', flexShrink: 0,
                }}>
                  +{gene.log2FC.toFixed(1)}x
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Interpretation ── */}
      <div style={{ padding: '14px 22px', borderBottom: '1px solid #0d1a2a', flexShrink: 0 }}>
        <div style={{ fontSize: 9, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#334155', marginBottom: 8 }}>
          Bioinformatics Interpretation
        </div>
        <div style={{
          fontSize: 10, color: '#64748b', lineHeight: 1.6,
          background: 'rgba(255,107,53,0.04)',
          border: '1px solid rgba(255,107,53,0.12)',
          borderRadius: 6, padding: '10px 12px',
        }}>
          <span style={{ color: '#ff6b35', fontWeight: 600 }}>PCSK9</span> shows the strongest upregulation in disease
          hepatocytes (log₂FC +3.2, p = 3.2×10⁻⁹). Concurrent downregulation of{' '}
          <span style={{ color: '#94a3b8' }}>LDLR</span> (−2.1x) confirms the PCSK9→LDLR degradation axis
          is active. PCSK9 is a high-confidence therapeutic target for cholesterol reduction via gene editing.
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ padding: '18px 22px', flexShrink: 0 }}>
        <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#334155', marginBottom: 12 }}>
          Confirm therapeutic target to unlock Phase 2: Guide Screen
        </div>
        <button
          onClick={() => handleConfirm('PCSK9')}
          style={{
            width: '100%',
            fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
            letterSpacing: '0.16em', textTransform: 'uppercase',
            color: '#050a0f',
            background: 'linear-gradient(135deg, #ff6b35, #ff6b35bb)',
            border: 'none', borderRadius: 8,
            padding: '13px 0', cursor: 'pointer',
            boxShadow: '0 0 28px rgba(255,107,53,0.45)',
            transition: 'box-shadow 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 44px rgba(255,107,53,0.7)' }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 28px rgba(255,107,53,0.45)' }}
        >
          Select PCSK9 as Therapeutic Target →
        </button>
      </div>
    </div>
  )
}
