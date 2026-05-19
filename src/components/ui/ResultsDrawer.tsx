import { useEffect, useState } from 'react'
import { useLabStore } from '../../store/labStore'
import { PHASE1_GENES, PHASE1_BACKGROUND, PHASE2_GUIDES, LNP_FORMULATION_DETAILS, PHASE4_WESTERN, PHASE4_LDL_UPTAKE } from '../../types/program'
import type { DEGene, GuideResult } from '../../types/program'

// ── Volcano plot (Phase 1) ────────────────────────────────────────────────────

const W = 420
const H = 210
const ML = 38
const MR = 14
const MT = 14
const MB = 34

const PW = W - ML - MR
const PH = H - MT - MB

const FC_MIN = -5
const FC_MAX =  5
const P_MAX  = 10

function toX(fc: number) { return ML + (fc - FC_MIN) / (FC_MAX - FC_MIN) * PW }
function toY(p:  number) { return MT + PH - (p / P_MAX) * PH }

const P_THRESH  = 1.3
const FC_THRESH = 1.0

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
  const threshY  = toY(P_THRESH)
  const threshXL = toX(-FC_THRESH)
  const threshXR = toX( FC_THRESH)

  return (
    <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
      <rect x={ML} y={MT} width={PW} height={PH} fill="#040912" rx={4} />
      <rect x={threshXR} y={MT} width={ML + PW - threshXR} height={threshY - MT} fill="rgba(96,165,250,0.04)" />
      <rect x={ML} y={MT} width={threshXL - ML} height={threshY - MT} fill="rgba(129,140,248,0.04)" />
      <line x1={ML} y1={threshY} x2={ML+PW} y2={threshY} stroke="#1e3050" strokeWidth={1} strokeDasharray="4 3" />
      <line x1={threshXL} y1={MT} x2={threshXL} y2={MT+PH} stroke="#1e3050" strokeWidth={1} strokeDasharray="4 3" />
      <line x1={threshXR} y1={MT} x2={threshXR} y2={MT+PH} stroke="#1e3050" strokeWidth={1} strokeDasharray="4 3" />

      {PHASE1_BACKGROUND.map((g, i) => {
        const x = toX(Math.max(FC_MIN, Math.min(FC_MAX, g.log2FC)))
        const y = toY(Math.max(0, Math.min(P_MAX, g.negLog10P)))
        const sig = g.negLog10P > P_THRESH && Math.abs(g.log2FC) > FC_THRESH
        return (
          <circle key={i} cx={x} cy={y} r={2.2}
            fill={sig ? (g.log2FC > 0 ? 'rgba(96,165,250,0.4)' : 'rgba(129,140,248,0.4)') : '#132030'} />
        )
      })}

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
            {isHov && <circle cx={x} cy={y} r={r+4} fill="none" stroke={dotColor(gene, true)} strokeWidth={1} opacity={0.5} />}
            <circle cx={x} cy={y} r={r} fill={dotColor(gene, isHov)} opacity={isHov ? 1 : gene.isCandidate ? 0.95 : 0.8} />
            {(gene.isCandidate || isHov) && (
              <text x={x + (gene.log2FC > 0 ? r+3 : -(r+3))} y={y-3}
                fontSize={8} fontFamily="monospace"
                fill={gene.isCandidate ? '#ff6b35' : '#94a3b8'}
                textAnchor={gene.log2FC > 0 ? 'start' : 'end'}
                style={{ pointerEvents: 'none', userSelect: 'none' }}>
                {gene.name}
              </text>
            )}
          </g>
        )
      })}

      <line x1={ML} y1={MT+PH} x2={ML+PW} y2={MT+PH} stroke="#1a2940" strokeWidth={1} />
      <line x1={ML} y1={MT} x2={ML} y2={MT+PH} stroke="#1a2940" strokeWidth={1} />
      {[-4,-2,0,2,4].map((v) => (
        <g key={v}>
          <line x1={toX(v)} y1={MT+PH} x2={toX(v)} y2={MT+PH+4} stroke="#1a2940" strokeWidth={1} />
          <text x={toX(v)} y={MT+PH+13} fontSize={7} fontFamily="monospace" fill="#334155" textAnchor="middle">
            {v > 0 ? `+${v}` : v}
          </text>
        </g>
      ))}
      {[0,2,4,6,8,10].map((v) => (
        <g key={v}>
          <line x1={ML-4} y1={toY(v)} x2={ML} y2={toY(v)} stroke="#1a2940" strokeWidth={1} />
          <text x={ML-6} y={toY(v)+3} fontSize={7} fontFamily="monospace" fill="#334155" textAnchor="end">{v}</text>
        </g>
      ))}
      <text x={ML+PW/2} y={H-2} fontSize={8} fontFamily="monospace" fill="#334155" textAnchor="middle">
        log₂ Fold Change (Disease / Normal)
      </text>
      <text x={9} y={MT+PH/2} fontSize={8} fontFamily="monospace" fill="#334155" textAnchor="middle"
        transform={`rotate(-90, 9, ${MT+PH/2})`}>
        −log₁₀(p)
      </text>
      <text x={ML+PW-4} y={MT+10} fontSize={7} fontFamily="monospace" fill="rgba(96,165,250,0.5)" textAnchor="end">UP</text>
      <text x={ML+4} y={MT+10} fontSize={7} fontFamily="monospace" fill="rgba(129,140,248,0.5)" textAnchor="start">DOWN</text>
    </svg>
  )
}

// ── Guide bar chart (Phase 2) ─────────────────────────────────────────────────

function guideBarColor(g: GuideResult): string {
  if (g.isControl)           return '#1e3050'
  if (g.isWinner)            return '#00d4ff'
  if (g.efficiency >= 70)    return '#00b8e0'
  if (g.efficiency >= 50)    return '#007a99'
  if (g.efficiency >= 30)    return '#004d66'
  return '#0d2233'
}

function GuideChart({ hoveredGuide, onHover }: {
  hoveredGuide: string | null
  onHover: (id: string | null) => void
}) {
  const sorted = [...PHASE2_GUIDES].sort((a, b) => b.efficiency - a.efficiency)
  const BAR_H = 15
  const GAP   = 3
  const LABEL_W = 36
  const VAL_W   = 32
  const BAR_AREA = 380 - LABEL_W - VAL_W - 16  // ~296px

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
      {sorted.map((g) => {
        const isHov = hoveredGuide === g.id
        const barW  = (g.efficiency / 100) * BAR_AREA
        const color = guideBarColor(g)
        return (
          <div
            key={g.id}
            style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'default' }}
            onMouseEnter={() => onHover(g.id)}
            onMouseLeave={() => onHover(null)}
          >
            {/* Label */}
            <div style={{
              width: LABEL_W, fontSize: 9, fontFamily: 'monospace', textAlign: 'right',
              color: g.isWinner ? '#00d4ff' : g.isControl ? '#334155' : isHov ? '#94a3b8' : '#475569',
              fontWeight: g.isWinner ? 700 : 400,
              flexShrink: 0,
            }}>
              {g.id}
            </div>

            {/* Bar track */}
            <div style={{
              flex: 1, height: BAR_H,
              background: '#0d1a2a',
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden',
              border: isHov ? '1px solid #1e3050' : '1px solid transparent',
            }}>
              <div style={{
                width: barW,
                height: '100%',
                background: g.isWinner
                  ? 'linear-gradient(90deg, #00d4ff, #00d4ff88)'
                  : `linear-gradient(90deg, ${color}, ${color}88)`,
                borderRadius: 2,
                boxShadow: g.isWinner ? '0 0 8px rgba(0,212,255,0.5)' : 'none',
                transition: 'width 0.5s ease',
              }} />
              {/* Winner star marker */}
              {g.isWinner && (
                <div style={{
                  position: 'absolute', left: barW + 4, top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 8, color: '#00d4ff',
                }}>
                  ★
                </div>
              )}
            </div>

            {/* Value */}
            <div style={{
              width: VAL_W, fontSize: 9, fontFamily: 'monospace', textAlign: 'right',
              color: g.isWinner ? '#00d4ff' : g.isControl ? '#334155' : '#475569',
              fontWeight: g.isWinner ? 700 : 400,
              flexShrink: 0,
            }}>
              {g.efficiency}%
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Phase-specific content ────────────────────────────────────────────────────

const GENE_INFO: Record<string, string> = {
  PCSK9:  'Proprotein convertase subtilisin/kexin type 9 — targets LDLR for lysosomal degradation, raises plasma LDL. Loss-of-function → low LDL; gain-of-function → familial hypercholesterolemia.',
  HMGCR:  'HMG-CoA reductase — rate-limiting enzyme in the mevalonate/cholesterol biosynthesis pathway. Primary target of statin drugs.',
  APOB:   'Apolipoprotein B-100 — structural protein of VLDL and LDL particles. Elevated in cardiovascular disease.',
  LDLR:   'Low-density lipoprotein receptor — clears LDL from plasma. Downregulated here because PCSK9 is degrading it.',
  CPT1A:  'Carnitine palmitoyltransferase 1A — rate-limiting step of mitochondrial fatty acid oxidation. Downregulated reflects metabolic shift.',
  SREBF2: 'Sterol regulatory element-binding protein 2 — master transcription factor for cholesterol biosynthesis genes.',
  FDFT1:  'Farnesyl-diphosphate farnesyltransferase 1 (squalene synthase) — first committed step of cholesterol synthesis.',
}

function Phase1Content({ onConfirm }: { onConfirm: (val: string) => void }) {
  const [hoveredGene, setHoveredGene] = useState<string | null>(null)

  const topUp = PHASE1_GENES
    .filter((g) => g.significant && g.log2FC > FC_THRESH)
    .sort((a, b) => b.negLog10P - a.negLog10P)
    .slice(0, 5)

  const infoGene = hoveredGene ?? 'PCSK9'
  const infoText = GENE_INFO[infoGene]

  return (
    <>
      {/* Volcano plot */}
      <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid #0d1a2a', flexShrink: 0 }}>
        <SectionLabel>Volcano Plot · Hover to inspect genes</SectionLabel>
        <VolcanoPlot hoveredGene={hoveredGene} onHover={setHoveredGene} />
      </div>

      {/* Gene info */}
      <div style={{ padding: '12px 22px', borderBottom: '1px solid #0d1a2a', minHeight: 66, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: hoveredGene === 'PCSK9' ? '#ff6b35' : '#94a3b8' }}>
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
        {infoText && <div style={{ fontSize: 9, color: '#475569', lineHeight: 1.55 }}>{infoText}</div>}
      </div>

      {/* Top upregulated */}
      <div style={{ padding: '14px 22px', borderBottom: '1px solid #0d1a2a', flexShrink: 0 }}>
        <SectionLabel>Top Upregulated Candidates</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {topUp.map((gene, i) => (
            <div key={gene.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}
              onMouseEnter={() => setHoveredGene(gene.name)}
              onMouseLeave={() => setHoveredGene(null)}
            >
              <div style={{ width: 16, fontSize: 8, fontFamily: 'monospace', color: '#334155', textAlign: 'right', flexShrink: 0 }}>{i + 1}</div>
              <div style={{ width: 56, fontSize: 10, fontWeight: gene.isCandidate ? 700 : 500, color: gene.isCandidate ? '#ff6b35' : '#94a3b8', flexShrink: 0 }}>
                {gene.name}
              </div>
              <div style={{ flex: 1, background: '#0d1a2a', borderRadius: 2, height: 6, overflow: 'hidden' }}>
                <div style={{
                  width: `${(gene.log2FC / 5) * 100}%`, height: '100%', borderRadius: 2,
                  background: gene.isCandidate ? 'linear-gradient(90deg,#ff6b35,#ff6b3566)' : 'linear-gradient(90deg,#60a5fa,#60a5fa44)',
                  transition: 'width 0.4s ease',
                }} />
              </div>
              <div style={{ width: 36, fontSize: 8, fontFamily: 'monospace', color: '#60a5fa', textAlign: 'right', flexShrink: 0 }}>
                +{gene.log2FC.toFixed(1)}x
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interpretation */}
      <div style={{ padding: '14px 22px', borderBottom: '1px solid #0d1a2a', flexShrink: 0 }}>
        <SectionLabel>Bioinformatics Interpretation</SectionLabel>
        <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.6, background: 'rgba(255,107,53,0.04)', border: '1px solid rgba(255,107,53,0.12)', borderRadius: 6, padding: '10px 12px' }}>
          <span style={{ color: '#ff6b35', fontWeight: 600 }}>PCSK9</span> shows the strongest upregulation in disease
          hepatocytes (log₂FC +3.2, p = 3.2×10⁻⁹). Concurrent downregulation of{' '}
          <span style={{ color: '#94a3b8' }}>LDLR</span> (−2.1x) confirms the PCSK9→LDLR degradation axis
          is active. PCSK9 is a high-confidence therapeutic target for cholesterol reduction via gene editing.
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '18px 22px', flexShrink: 0 }}>
        <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#334155', marginBottom: 12 }}>
          Confirm therapeutic target to unlock Phase 2: Guide Screen
        </div>
        <CtaButton color="#ff6b35" onClick={() => onConfirm('PCSK9')}>
          Select PCSK9 as Therapeutic Target →
        </CtaButton>
      </div>
    </>
  )
}

function Phase2Content({ onConfirm }: { onConfirm: (val: string) => void }) {
  const [hoveredGuide, setHoveredGuide] = useState<string | null>(null)
  const winner = PHASE2_GUIDES.find((g) => g.isWinner)!
  const hovered = PHASE2_GUIDES.find((g) => g.id === hoveredGuide) ?? winner

  const aboveFifty = PHASE2_GUIDES.filter((g) => !g.isControl && g.efficiency >= 50).length

  return (
    <>
      {/* Guide efficiency chart */}
      <div style={{ padding: '18px 22px 16px', borderBottom: '1px solid #0d1a2a', flexShrink: 0 }}>
        <SectionLabel>Editing Efficiency by Guide · AMP-seq at PCSK9 Exon 7</SectionLabel>
        <GuideChart hoveredGuide={hoveredGuide} onHover={setHoveredGuide} />
      </div>

      {/* Hovered / winner guide detail */}
      <div style={{ padding: '14px 22px', borderBottom: '1px solid #0d1a2a', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              {hovered.isWinner && <span style={{ fontSize: 10, color: '#00d4ff' }}>★</span>}
              <span style={{ fontSize: 13, fontWeight: 700, color: hovered.isWinner ? '#00d4ff' : '#94a3b8' }}>
                {hovered.id}
              </span>
              <span style={{
                fontSize: 8, fontFamily: 'monospace', letterSpacing: '0.1em',
                color: hovered.isControl ? '#334155' : hovered.efficiency >= 70 ? '#00d4ff' : '#475569',
                background: hovered.isControl ? '#0d1a2a' : hovered.efficiency >= 70 ? 'rgba(0,212,255,0.1)' : '#0d1a2a',
                border: `1px solid ${hovered.isControl ? '#1a2940' : hovered.efficiency >= 70 ? 'rgba(0,212,255,0.3)' : '#1a2940'}`,
                borderRadius: 3, padding: '2px 6px',
              }}>
                {hovered.isControl ? 'NEG CTRL' : `${hovered.efficiency}% EDITING`}
              </span>
            </div>
            <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#334155', letterSpacing: '0.06em' }}>
              5′-{hovered.sequence}-3′
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {[
            ['PAM',       hovered.isControl ? 'N/A' : 'GGG (NGG)'],
            ['Locus',     hovered.isControl ? 'N/A' : 'PCSK9 Exon 7'],
            ['Position',  hovered.isControl ? 'N/A' : 'chr1:55,039,447'],
            ['Off-targets', hovered.isControl ? 'N/A' : hovered.isWinner ? '3 (intronic)' : '4–8 (predicted)'],
          ].map(([k, v]) => (
            <div key={k} style={{ background: '#060e1a', border: '1px solid #0d1a2a', borderRadius: 5, padding: '7px 10px' }}>
              <div style={{ fontSize: 8, fontFamily: 'monospace', color: '#334155', marginBottom: 2 }}>{k}</div>
              <div style={{ fontSize: 10, color: '#64748b' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Interpretation */}
      <div style={{ padding: '14px 22px', borderBottom: '1px solid #0d1a2a', flexShrink: 0 }}>
        <SectionLabel>CRISPResso2 Analysis Summary</SectionLabel>
        <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.6, background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 6, padding: '10px 12px' }}>
          <span style={{ color: '#00d4ff', fontWeight: 600 }}>G7</span> achieved the highest editing efficiency at{' '}
          <span style={{ color: '#00d4ff' }}>84%</span> indels at the PCSK9 exon 7 cut site.{' '}
          <span style={{ color: '#94a3b8' }}>G12</span> (76%) and{' '}
          <span style={{ color: '#94a3b8' }}>G3</span> (71%) are strong backups.{' '}
          {aboveFifty} of 22 guides exceeded 50% efficiency. Negative controls confirmed background
          editing at &lt;2%, validating assay specificity. G7 proceeds to Phase 3: Delivery Optimization.
        </div>
      </div>

      {/* Efficiency tier legend */}
      <div style={{ padding: '12px 22px', borderBottom: '1px solid #0d1a2a', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {[
            { label: '≥70% High',   color: '#00b8e0' },
            { label: '50–70% Mid',  color: '#007a99' },
            { label: '<50% Low',    color: '#004d66' },
            { label: 'Neg Ctrl',    color: '#1e3050' },
          ].map(({ label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
              <span style={{ fontSize: 8, fontFamily: 'monospace', color: '#334155' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '18px 22px', flexShrink: 0 }}>
        <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#334155', marginBottom: 12 }}>
          Confirm lead guide to unlock Phase 3: Delivery Optimization
        </div>
        <CtaButton color="#00d4ff" onClick={() => onConfirm('G7')}>
          Select G7 (84% Editing) for Phase 3 →
        </CtaButton>
      </div>
    </>
  )
}

// ── Phase 3 heat map ─────────────────────────────────────────────────────────

const FORMULATIONS = ['F1', 'F2', 'F3', 'F4']
const DOSE_LABELS  = ['0.1 mg/kg', '0.3 mg/kg', '1.0 mg/kg']
// [formulation][dose] → knockdown %
const KD_MATRIX = [
  [22, 45, 71],
  [18, 38, 63],
  [31, 62, 89],
  [25, 51, 78],
]

function heatColor(pct: number): string {
  const a = 0.06 + (pct / 100) * 0.88
  return `rgba(168,85,247,${a.toFixed(2)})`
}

function Phase3Content({ onConfirm }: { onConfirm: (val: string) => void }) {
  const [hoveredCell, setHoveredCell] = useState<[number, number] | null>(null)

  const row = hoveredCell?.[0] ?? 2
  const col = hoveredCell?.[1] ?? 2
  const formLabel   = FORMULATIONS[row]
  const doseLabel   = DOSE_LABELS[col]
  const kd          = KD_MATRIX[row][col]
  const isCellWinner = row === 2 && col === 2
  const detail      = LNP_FORMULATION_DETAILS[formLabel]

  return (
    <>
      {/* ── Heat map ── */}
      <div style={{ padding: '18px 22px 16px', borderBottom: '1px solid #0d1a2a', flexShrink: 0 }}>
        <SectionLabel>PCSK9 Knockdown (%) · LNP Formulation × Dose Matrix</SectionLabel>

        {/* Dose column headers */}
        <div style={{ display: 'flex', marginBottom: 6, marginLeft: 52 }}>
          {DOSE_LABELS.map((d) => (
            <div key={d} style={{
              flex: 1, textAlign: 'center',
              fontSize: 8, fontFamily: 'monospace', color: '#334155', letterSpacing: '0.08em',
            }}>
              {d}
            </div>
          ))}
        </div>

        {/* Rows */}
        {FORMULATIONS.map((form, ri) => (
          <div key={form} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            {/* Row label */}
            <div style={{ width: 46, flexShrink: 0 }}>
              <div style={{ fontSize: 9, fontFamily: 'monospace', fontWeight: 700, color: '#64748b' }}>{form}</div>
              <div style={{ fontSize: 7, fontFamily: 'monospace', color: '#334155', lineHeight: 1.2 }}>
                {LNP_FORMULATION_DETAILS[form].ionizable.replace('DLin-', '')}
              </div>
            </div>

            {/* Cells */}
            {[0, 1, 2].map((ci) => {
              const val     = KD_MATRIX[ri][ci]
              const isWin   = ri === 2 && ci === 2
              const isHov   = hoveredCell?.[0] === ri && hoveredCell?.[1] === ci
              const bg      = heatColor(val)
              return (
                <div
                  key={ci}
                  onMouseEnter={() => setHoveredCell([ri, ci])}
                  onMouseLeave={() => setHoveredCell(null)}
                  style={{
                    flex: 1,
                    height: 48,
                    background: bg,
                    borderRadius: 6,
                    border: isWin
                      ? '2px solid #a855f7'
                      : isHov
                        ? '1px solid #a855f744'
                        : '1px solid rgba(168,85,247,0.12)',
                    boxShadow: isWin ? '0 0 16px rgba(168,85,247,0.45)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'default',
                    transition: 'border-color 0.15s',
                    position: 'relative',
                  }}
                >
                  <div style={{
                    fontSize: 13, fontWeight: 700, fontFamily: 'monospace',
                    color: val >= 60 ? '#e9d5ff' : val >= 40 ? '#c4b5fd' : '#7c3aed',
                  }}>
                    {val}%
                  </div>
                  {isWin && (
                    <div style={{ fontSize: 8, color: '#a855f7', marginTop: 1 }}>★ BEST</div>
                  )}
                </div>
              )
            })}
          </div>
        ))}

        {/* Color scale */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, marginLeft: 52 }}>
          <div style={{
            flex: 1, height: 6, borderRadius: 3,
            background: 'linear-gradient(90deg, rgba(168,85,247,0.06), rgba(168,85,247,0.94))',
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', position: 'absolute', marginLeft: 52 }}>
          </div>
          <div style={{ fontSize: 7, fontFamily: 'monospace', color: '#334155', whiteSpace: 'nowrap' }}>0% → 100% knockdown</div>
        </div>
      </div>

      {/* ── Selected condition detail ── */}
      <div style={{ padding: '14px 22px', borderBottom: '1px solid #0d1a2a', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          {isCellWinner && <span style={{ fontSize: 10, color: '#a855f7' }}>★</span>}
          <span style={{ fontSize: 13, fontWeight: 700, color: isCellWinner ? '#a855f7' : '#94a3b8' }}>
            {formLabel}
          </span>
          <span style={{ fontSize: 8, fontFamily: 'monospace', color: '#334155' }}>·</span>
          <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#64748b' }}>{doseLabel}</span>
          <span style={{
            fontSize: 8, fontFamily: 'monospace', letterSpacing: '0.1em',
            color: isCellWinner ? '#a855f7' : kd >= 60 ? '#c084fc' : '#475569',
            background: isCellWinner ? 'rgba(168,85,247,0.12)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${isCellWinner ? 'rgba(168,85,247,0.35)' : '#1a2940'}`,
            borderRadius: 3, padding: '2px 6px', marginLeft: 4,
          }}>
            {kd}% KNOCKDOWN
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {[
            ['Ionizable Lipid', detail.ionizable],
            ['Molar Ratio',     detail.ratio + ' (IL:DOPE:Chol:PEG)'],
            ['Particle Size',   `${detail.size} nm (PDI ${detail.pdi})`],
            ['Encapsulation',   `${detail.encapsulation}% (Ribogreen)`],
          ].map(([k, v]) => (
            <div key={k} style={{ background: '#060e1a', border: '1px solid #0d1a2a', borderRadius: 5, padding: '7px 10px' }}>
              <div style={{ fontSize: 8, fontFamily: 'monospace', color: '#334155', marginBottom: 2 }}>{k}</div>
              <div style={{ fontSize: 9, color: '#64748b', lineHeight: 1.4 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Analysis summary ── */}
      <div style={{ padding: '14px 22px', borderBottom: '1px solid #0d1a2a', flexShrink: 0 }}>
        <SectionLabel>LNP Optimization Summary</SectionLabel>
        <div style={{
          fontSize: 10, color: '#64748b', lineHeight: 1.6,
          background: 'rgba(168,85,247,0.04)',
          border: '1px solid rgba(168,85,247,0.12)',
          borderRadius: 6, padding: '10px 12px',
        }}>
          <span style={{ color: '#a855f7', fontWeight: 600 }}>F3</span> (DOPE-enriched, DLin-MC3-DMA) achieved{' '}
          <span style={{ color: '#a855f7' }}>89% PCSK9 knockdown</span> at 1.0 mg/kg — the highest across all
          12 conditions. The elevated DOPE content (15 mol%) improves endosomal escape, driving greater
          intracellular RNP release.{' '}
          <span style={{ color: '#94a3b8' }}>F4</span> (C12-200) reached 78% at 1.0 mg/kg and is a strong backup.
          All formulations showed dose-dependent response. F3 particle size (82 nm, PDI 0.08) and{' '}
          94% encapsulation confirm manufacturing consistency. F3 at 1.0 mg/kg advances to Phase 4.
        </div>
      </div>

      {/* ── Formulation tier legend ── */}
      <div style={{ padding: '12px 22px', borderBottom: '1px solid #0d1a2a', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {[
            { label: '≥80% Excellent', color: 'rgba(168,85,247,0.9)'  },
            { label: '60–80% Good',    color: 'rgba(168,85,247,0.6)'  },
            { label: '40–60% Moderate',color: 'rgba(168,85,247,0.35)' },
            { label: '<40% Poor',      color: 'rgba(168,85,247,0.12)' },
          ].map(({ label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: color, border: '1px solid rgba(168,85,247,0.2)' }} />
              <span style={{ fontSize: 8, fontFamily: 'monospace', color: '#334155' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ padding: '18px 22px', flexShrink: 0 }}>
        <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#334155', marginBottom: 12 }}>
          Confirm lead formulation to unlock Phase 4: Functional Validation
        </div>
        <CtaButton color="#a855f7" onClick={() => onConfirm('F3')}>
          Select F3 at 1.0 mg/kg for Phase 4 →
        </CtaButton>
      </div>
    </>
  )
}

// ── Phase 4: Functional Validation ───────────────────────────────────────────

const GREEN = '#10b981'

function WesternBlot({ hoveredLane, onHover }: {
  hoveredLane: number | null
  onHover: (i: number | null) => void
}) {
  const LANES   = PHASE4_WESTERN.length
  const W       = 420
  const LANE_W  = Math.floor(W / (LANES + 1))  // +1 for label column
  const LABEL_W = W - LANE_W * LANES
  const GEL_H   = 52   // each antibody strip height
  const GAP     = 18   // gap between strips
  const MT      = 28   // top margin (lane labels)
  const TOTAL_H = MT + GEL_H + GAP + GEL_H + 18  // labels + PCSK9 strip + gap + GAPDH strip + bottom

  return (
    <svg width={W} height={TOTAL_H} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <filter id="bandBlur">
          <feGaussianBlur stdDeviation="1.8 2.4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Lane header labels */}
      {PHASE4_WESTERN.map((b, i) => {
        const cx = LABEL_W + i * LANE_W + LANE_W / 2
        const isHov = hoveredLane === i
        return (
          <text key={i} x={cx} y={MT - 6} fontSize={7} fontFamily="monospace"
            fill={b.isWinner ? GREEN : isHov ? '#94a3b8' : '#475569'}
            textAnchor="middle" fontWeight={b.isWinner ? 700 : 400}
            style={{ cursor: 'default' }}
          >
            {b.lane}
          </text>
        )
      })}

      {/* PCSK9 strip */}
      <rect x={LABEL_W} y={MT} width={LANE_W * LANES} height={GEL_H} fill="#060c14" rx={3} />
      <text x={LABEL_W - 6} y={MT + GEL_H / 2 + 3} fontSize={8} fontFamily="monospace"
        fill="#475569" textAnchor="end">PCSK9</text>
      <text x={LABEL_W - 6} y={MT + GEL_H / 2 + 12} fontSize={6} fontFamily="monospace"
        fill="#334155" textAnchor="end">72 kDa</text>

      {PHASE4_WESTERN.map((b, i) => {
        const cx    = LABEL_W + i * LANE_W + LANE_W / 2
        const alpha = b.pcsk9Intensity / 100
        const bw    = LANE_W * 0.55
        const bh    = GEL_H * 0.62 * Math.max(0.08, alpha)
        const isHov = hoveredLane === i
        return (
          <g key={i}
            onMouseEnter={() => onHover(i)}
            onMouseLeave={() => onHover(null)}
            style={{ cursor: 'default' }}
          >
            <rect
              x={cx - LANE_W / 2} y={MT} width={LANE_W} height={GEL_H}
              fill="transparent"
            />
            <rect
              x={cx - bw / 2}
              y={MT + (GEL_H - bh) / 2}
              width={bw} height={bh} rx={2}
              fill={b.isWinner ? '#10b981' : isHov ? '#c0e8ff' : '#b8d4e8'}
              opacity={b.isWinner ? 0.85 : 0.15 + alpha * 0.75}
              filter="url(#bandBlur)"
            />
            {b.isWinner && (
              <rect
                x={cx - bw / 2} y={MT + (GEL_H - bh) / 2}
                width={bw} height={bh} rx={2}
                fill="none" stroke={GREEN} strokeWidth={1}
                opacity={0.6} filter="url(#glow)"
              />
            )}
          </g>
        )
      })}

      {/* GAPDH strip (loading control — uniform) */}
      <rect x={LABEL_W} y={MT + GEL_H + GAP} width={LANE_W * LANES} height={GEL_H} fill="#060c14" rx={3} />
      <text x={LABEL_W - 6} y={MT + GEL_H + GAP + GEL_H / 2 + 3} fontSize={8} fontFamily="monospace"
        fill="#475569" textAnchor="end">GAPDH</text>
      <text x={LABEL_W - 6} y={MT + GEL_H + GAP + GEL_H / 2 + 12} fontSize={6} fontFamily="monospace"
        fill="#334155" textAnchor="end">37 kDa</text>

      {PHASE4_WESTERN.map((_, i) => {
        const cx = LABEL_W + i * LANE_W + LANE_W / 2
        const bw = LANE_W * 0.55
        const bh = GEL_H * 0.55
        return (
          <rect key={i}
            x={cx - bw / 2}
            y={MT + GEL_H + GAP + (GEL_H - bh) / 2}
            width={bw} height={bh} rx={2}
            fill="#b8d4e8" opacity={0.72}
            filter="url(#bandBlur)"
          />
        )
      })}

      {/* Intensity label under each PCSK9 band */}
      {PHASE4_WESTERN.map((b, i) => {
        const cx = LABEL_W + i * LANE_W + LANE_W / 2
        return (
          <text key={i} x={cx} y={MT + GEL_H + GAP - 4}
            fontSize={7} fontFamily="monospace" textAnchor="middle"
            fill={b.isWinner ? GREEN : '#334155'}
            fontWeight={b.isWinner ? 700 : 400}
          >
            {b.pcsk9Intensity}%
          </text>
        )
      })}
    </svg>
  )
}

function LDLChart() {
  const MAX_FC = 4.0
  const BAR_W  = 52
  const GAP    = 12
  const H      = 120
  const MB     = 44  // bottom margin for labels

  const totalW = PHASE4_LDL_UPTAKE.length * (BAR_W + GAP) - GAP + 24

  return (
    <svg width={totalW} height={H + MB} style={{ display: 'block', overflow: 'visible' }}>
      {/* Baseline reference at 1.0x */}
      <line
        x1={0} y1={H * (1 - 1.0 / MAX_FC)}
        x2={totalW} y2={H * (1 - 1.0 / MAX_FC)}
        stroke="#1e3050" strokeWidth={1} strokeDasharray="4 3"
      />
      <text x={totalW + 3} y={H * (1 - 1.0 / MAX_FC) + 3}
        fontSize={7} fontFamily="monospace" fill="#334155">1.0×</text>

      {PHASE4_LDL_UPTAKE.map((pt, i) => {
        const x    = i * (BAR_W + GAP)
        const barH = (pt.foldChange / MAX_FC) * H
        const y    = H - barH
        const color = pt.isWinner ? GREEN : '#1a4a36'

        return (
          <g key={i}>
            <rect x={x} y={y} width={BAR_W} height={barH} rx={3}
              fill={pt.isWinner
                ? `linear-gradient(to top, ${GREEN}, ${GREEN}88)` // won't work in SVG, use stops
                : color}
              opacity={pt.isWinner ? 1 : 0.6}
            />
            {/* gradient via linearGradient */}
            <defs>
              <linearGradient id={`bar-grad-${i}`} x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor={pt.isWinner ? GREEN : '#1a4a36'} />
                <stop offset="100%" stopColor={pt.isWinner ? '#34d399' : '#0d2a1e'} />
              </linearGradient>
            </defs>
            <rect x={x} y={y} width={BAR_W} height={barH} rx={3}
              fill={`url(#bar-grad-${i})`}
              opacity={pt.isWinner ? 1 : 0.65}
              stroke={pt.isWinner ? GREEN : 'none'}
              strokeWidth={1}
              style={{ boxShadow: pt.isWinner ? `0 0 12px ${GREEN}` : 'none' }}
            />
            {pt.isWinner && (
              <rect x={x} y={y} width={BAR_W} height={barH} rx={3}
                fill="none" stroke={GREEN} strokeWidth={1.5} opacity={0.8}
                filter="url(#glow)"
              />
            )}
            {/* Value label */}
            <text x={x + BAR_W / 2} y={y - 4}
              fontSize={9} fontFamily="monospace" textAnchor="middle"
              fill={pt.isWinner ? GREEN : '#475569'}
              fontWeight={pt.isWinner ? 700 : 400}
            >
              {pt.foldChange.toFixed(1)}×
            </text>
            {/* X-axis label — wrap at space */}
            {pt.condition.split(' ').map((word, wi) => (
              <text key={wi} x={x + BAR_W / 2} y={H + 14 + wi * 10}
                fontSize={7} fontFamily="monospace" textAnchor="middle"
                fill={pt.isWinner ? GREEN : '#475569'}
                fontWeight={pt.isWinner ? 700 : 400}
              >
                {word}
              </text>
            ))}
          </g>
        )
      })}

      {/* Y-axis label */}
      <text x={-36} y={H / 2} fontSize={8} fontFamily="monospace" fill="#334155"
        textAnchor="middle" transform={`rotate(-90, -36, ${H / 2})`}>
        LDL uptake (fold vs. untreated)
      </text>
    </svg>
  )
}

function Phase4Content({ onConfirm }: { onConfirm: (val: string) => void }) {
  const [hoveredLane, setHoveredLane] = useState<number | null>(null)

  const hovered    = hoveredLane !== null ? PHASE4_WESTERN[hoveredLane] : PHASE4_WESTERN[3]
  const knockdown  = 100 - hovered.pcsk9Intensity
  return (
    <>
      {/* ── Western blot ── */}
      <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid #0d1a2a', flexShrink: 0 }}>
        <SectionLabel>Western Blot · PCSK9 Protein Knockdown · Hover lanes to inspect</SectionLabel>
        <WesternBlot hoveredLane={hoveredLane} onHover={setHoveredLane} />
        {/* Lane detail */}
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: hovered.isWinner ? GREEN : '#94a3b8' }}>
            {hovered.lane}
          </span>
          <span style={{ fontSize: 9, fontFamily: 'monospace', color: '#475569' }}>
            PCSK9: {hovered.pcsk9Intensity}% of untreated
          </span>
          <span style={{ fontSize: 9, fontFamily: 'monospace',
            color: knockdown >= 80 ? GREEN : knockdown >= 50 ? '#059669' : '#475569' }}>
            ({knockdown}% reduction)
          </span>
          {hovered.isWinner && (
            <span style={{ fontSize: 8, fontFamily: 'monospace', letterSpacing: '0.1em',
              color: GREEN, background: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.3)', borderRadius: 3, padding: '2px 6px' }}>
              ✓ MEETS CRITERIA
            </span>
          )}
        </div>
      </div>

      {/* ── LDL uptake chart ── */}
      <div style={{ padding: '14px 22px 16px', borderBottom: '1px solid #0d1a2a', flexShrink: 0 }}>
        <SectionLabel>LDL-Bodipy Fluorescent Uptake · LDLR Rescue Assay</SectionLabel>
        <div style={{ paddingLeft: 44, paddingTop: 8 }}>
          <LDLChart />
        </div>
      </div>

      {/* ── Pass/fail summary ── */}
      <div style={{ padding: '14px 22px', borderBottom: '1px solid #0d1a2a', flexShrink: 0 }}>
        <SectionLabel>Efficacy Criteria Assessment</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { criterion: 'PCSK9 protein knockdown ≥80%',  value: '87% knockdown (F3 1.0 mg/kg)', pass: true  },
            { criterion: 'LDL uptake ≥2.5× vs. untreated', value: '3.2× increase',                pass: true  },
            { criterion: 'GAPDH loading control uniform',  value: 'CV <5% across lanes',           pass: true  },
            { criterion: 'Vehicle ctrl ≤10% knockdown',    value: '3% — no off-target effect',     pass: true  },
          ].map(({ criterion, value, pass }) => (
            <div key={criterion} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: pass ? 'rgba(16,185,129,0.04)' : 'rgba(239,68,68,0.04)',
              border: `1px solid ${pass ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`,
              borderRadius: 5, padding: '7px 10px',
            }}>
              <div style={{
                width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                background: pass ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, color: pass ? GREEN : '#ef4444',
              }}>
                {pass ? '✓' : '✗'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, color: '#64748b' }}>{criterion}</div>
                <div style={{ fontSize: 9, fontFamily: 'monospace', color: pass ? GREEN : '#ef4444', marginTop: 1 }}>
                  {value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Interpretation ── */}
      <div style={{ padding: '14px 22px', borderBottom: '1px solid #0d1a2a', flexShrink: 0 }}>
        <SectionLabel>Functional Efficacy Summary</SectionLabel>
        <div style={{
          fontSize: 10, color: '#64748b', lineHeight: 1.6,
          background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.12)',
          borderRadius: 6, padding: '10px 12px',
        }}>
          <span style={{ color: GREEN, fontWeight: 600 }}>F3-LNP at 1.0 mg/kg</span> meets all functional
          pass criteria: <span style={{ color: GREEN }}>87% PCSK9 protein knockdown</span> (target ≥80%) and{' '}
          <span style={{ color: GREEN }}>3.2× LDL-Bodipy uptake</span> confirm LDLR surface rescue.
          GAPDH bands are uniform across all lanes, validating equal protein loading.
          Vehicle control shows no off-target reduction (3%), confirming knockdown is
          LNP-delivery-dependent. The program now advances to off-target safety screening.
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ padding: '18px 22px', flexShrink: 0 }}>
        <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#334155', marginBottom: 12 }}>
          All efficacy criteria met — confirm to unlock Phase 5: Off-Target Safety Screen
        </div>
        <CtaButton color={GREEN} onClick={() => onConfirm('F3-1.0mg/kg')}>
          Confirm Functional Efficacy → Advance to Safety Screen
        </CtaButton>
      </div>
    </>
  )
}

// ── Shared micro-components ───────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 9, fontFamily: 'monospace', textTransform: 'uppercase',
      letterSpacing: '0.15em', color: '#334155', marginBottom: 10,
    }}>
      {children}
    </div>
  )
}

function CtaButton({ children, color, onClick }: {
  children: React.ReactNode
  color: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
        letterSpacing: '0.16em', textTransform: 'uppercase',
        color: '#050a0f',
        background: `linear-gradient(135deg, ${color}, ${color}bb)`,
        border: 'none', borderRadius: 8,
        padding: '13px 0', cursor: 'pointer',
        boxShadow: `0 0 28px ${color}44`,
        transition: 'box-shadow 0.2s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 44px ${color}77` }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 0 28px ${color}44` }}
    >
      {children}
    </button>
  )
}

// ── Phase metadata (header info per phase) ────────────────────────────────────

const PHASE_META = {
  'target-validation': {
    label: 'Phase 1 Complete — Target Validation',
    title: 'RNA-seq Results',
    color: '#ff6b35',
    stats: [
      { text: '12,847 genes detected', color: '#334155' },
      { text: '1,203 upregulated',     color: '#60a5fa' },
      { text: '1,138 downregulated',   color: '#818cf8' },
    ],
  },
  'guide-screen': {
    label: 'Phase 2 Complete — Guide Screen',
    title: 'AMP-seq Results',
    color: '#00d4ff',
    stats: [
      { text: '24 guides tested',         color: '#334155' },
      { text: '6 guides ≥50% efficiency', color: '#00d4ff' },
      { text: 'G7 leads at 84%',          color: '#00b8e0' },
    ],
  },
  'delivery-opt': {
    label: 'Phase 3 Complete — Delivery Optimization',
    title: 'LNP Factorial Screen Results',
    color: '#a855f7',
    stats: [
      { text: '12 conditions screened',     color: '#334155' },
      { text: '4 formulations × 3 doses',   color: '#a855f7' },
      { text: 'F3 leads at 89% knockdown',  color: '#c084fc' },
    ],
  },
  'functional-validation': {
    label: 'Phase 4 Complete — Functional Validation',
    title: 'Protein Knockdown & LDL Rescue',
    color: '#10b981',
    stats: [
      { text: '5 conditions assayed',            color: '#334155' },
      { text: 'F3 1.0 mg/kg: 87% knockdown',    color: '#10b981' },
      { text: '3.2× LDL uptake rescued',         color: '#34d399' },
    ],
  },
} as const

// ── Main drawer ───────────────────────────────────────────────────────────────

export default function ResultsDrawer() {
  const { resultsPhaseId, confirmPhaseResults, closeResults } = useLabStore()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 40)
    return () => clearTimeout(t)
  }, [])

  function handleClose() {
    setVisible(false)
    setTimeout(closeResults, 280)
  }

  function handleConfirm(val: string) {
    if (!resultsPhaseId) return
    setVisible(false)
    setTimeout(() => confirmPhaseResults(resultsPhaseId, val), 280)
  }

  if (!resultsPhaseId || !(resultsPhaseId in PHASE_META)) return null
  const meta = PHASE_META[resultsPhaseId as keyof typeof PHASE_META]

  return (
    <div style={{
      position: 'absolute', top: 0, right: 0, bottom: 0, width: 480,
      background: 'rgba(4,9,18,0.97)',
      borderLeft: '1px solid #1a2940',
      display: 'flex', flexDirection: 'column',
      zIndex: 20,
      backdropFilter: 'blur(20px)',
      boxShadow: '-16px 0 60px rgba(0,0,0,0.6)',
      transform: visible ? 'translateX(0)' : 'translateX(480px)',
      transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
      overflowY: 'auto',
    }}>

      {/* Header */}
      <div style={{ padding: '22px 22px 18px', borderBottom: '1px solid #0d1a2a', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ fontSize: 9, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.2em', color: meta.color }}>
            {meta.label}
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
        <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 4 }}>{meta.title}</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {meta.stats.map((s, i) => (
            <span key={i} style={{ fontSize: 9, fontFamily: 'monospace', color: s.color }}>
              {i > 0 && <span style={{ color: '#1a2940', marginRight: 10 }}>|</span>}
              {s.text}
            </span>
          ))}
        </div>
      </div>

      {/* Phase-specific content */}
      {resultsPhaseId === 'target-validation'    && <Phase1Content onConfirm={handleConfirm} />}
      {resultsPhaseId === 'guide-screen'          && <Phase2Content onConfirm={handleConfirm} />}
      {resultsPhaseId === 'delivery-opt'          && <Phase3Content onConfirm={handleConfirm} />}
      {resultsPhaseId === 'functional-validation' && <Phase4Content onConfirm={handleConfirm} />}
    </div>
  )
}
