import { useEffect, useRef } from 'react'
import { useExperimentStore } from '../store/experimentStore'
import { EXPERIMENT_CONFIGS } from '../types/experiment'
import type { ExperimentType } from '../types/experiment'

// Deterministic "random" based on seed
function seededVal(seed: number, min: number, max: number) {
  const x = Math.sin(seed) * 10000
  return Math.round((x - Math.floor(x)) * (max - min) + min)
}

function generateReport(expType: ExperimentType, filledCount: number) {
  const seed = filledCount * 7 + expType.length

  if (expType === 'amplicon') {
    return {
      title: 'Amplicon Sequencing Report',
      summary: [
        { label: 'Samples processed', value: `${filledCount}` },
        { label: 'Total reads', value: `${seededVal(seed, 80, 250)}M` },
        { label: 'Mean reads/sample', value: `${seededVal(seed + 1, 40000, 120000).toLocaleString()}` },
        { label: 'Avg. quality score', value: `Q${seededVal(seed + 2, 34, 38)}` },
        { label: 'Pass filter rate', value: `${seededVal(seed + 3, 92, 99)}%` },
        { label: 'OTU richness (mean)', value: `${seededVal(seed + 4, 180, 450)}` },
      ],
      downloads: ['FASTQ (R1 + R2)', 'OTU table (.csv)', 'Taxonomy report (.csv)', 'QC report (.html)'],
    }
  }
  if (expType === 'rnaseq') {
    return {
      title: 'RNA-seq Expression Report',
      summary: [
        { label: 'Samples processed', value: `${filledCount}` },
        { label: 'Total reads', value: `${seededVal(seed, 300, 800)}M` },
        { label: 'Alignment rate', value: `${seededVal(seed + 1, 88, 97)}%` },
        { label: 'Genes detected', value: `${seededVal(seed + 2, 16000, 22000).toLocaleString()}` },
        { label: 'Avg. RIN score', value: `${seededVal(seed + 3, 8, 10)}.${seededVal(seed + 4, 0, 9)}` },
        { label: 'Duplication rate', value: `${seededVal(seed + 5, 12, 28)}%` },
      ],
      downloads: ['FASTQ files', 'Count matrix (.csv)', 'DESeq2 results (.csv)', 'MultiQC report (.html)'],
    }
  }
  if (expType === 'scrna') {
    return {
      title: 'scRNA-seq Cell Atlas Report',
      summary: [
        { label: 'Cells captured', value: `${seededVal(seed, 4000, 12000).toLocaleString()}` },
        { label: 'Median genes/cell', value: `${seededVal(seed + 1, 1800, 3500).toLocaleString()}` },
        { label: 'Median UMIs/cell', value: `${seededVal(seed + 2, 5000, 18000).toLocaleString()}` },
        { label: 'Cell viability', value: `${seededVal(seed + 3, 88, 97)}%` },
        { label: 'Sequencing sat.', value: `${seededVal(seed + 4, 65, 88)}%` },
        { label: 'Cell clusters', value: `${seededVal(seed + 5, 8, 24)}` },
      ],
      downloads: ['Cell Ranger output', 'Seurat object (.rds)', 'UMAP plot (.pdf)', 'Cell metadata (.csv)'],
    }
  }
  // massspec
  return {
    title: 'Proteomics MS Report',
    summary: [
      { label: 'Samples processed', value: `${filledCount}` },
      { label: 'Proteins identified', value: `${seededVal(seed, 3500, 7500).toLocaleString()}` },
      { label: 'Peptides quantified', value: `${seededVal(seed + 1, 35000, 80000).toLocaleString()}` },
      { label: 'MS2 spectra', value: `${seededVal(seed + 2, 200000, 600000).toLocaleString()}` },
      { label: 'Median CV%', value: `${seededVal(seed + 3, 8, 18)}%` },
      { label: 'Missed cleavage rate', value: `${seededVal(seed + 4, 12, 22)}%` },
    ],
    downloads: ['mzML files', 'MaxQuant results (.txt)', 'Protein groups (.csv)', 'Volcano plot (.pdf)'],
  }
}

export default function Report() {
  const { experimentType, wells, reset } = useExperimentStore()
  const containerRef = useRef<HTMLDivElement>(null)

  const cfg = experimentType ? EXPERIMENT_CONFIGS[experimentType] : null
  const filledWells = wells.filter((w) => w.filled)
  const report = experimentType ? generateReport(experimentType, filledWells.length) : null

  useEffect(() => {
    if (!containerRef.current) return
    containerRef.current.style.opacity = '0'
    containerRef.current.style.transform = 'translateY(20px)'
    containerRef.current.style.transition = 'opacity 0.6s ease, transform 0.6s ease'
    requestAnimationFrame(() => setTimeout(() => {
      if (!containerRef.current) return
      containerRef.current.style.opacity = '1'
      containerRef.current.style.transform = 'translateY(0)'
    }, 50))
  }, [])

  if (!cfg || !report) return null

  const accentColor = cfg.accentColor
  const filledCount = filledWells.length

  // Get unique sample groups
  const groups = Array.from(
    new Map(filledWells.map((w) => [w.sampleName, w.groupColor])).entries()
  )

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-y-auto grid-bg p-6"
    >
      {/* Ambient */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)` }} />

      <div className="max-w-4xl mx-auto flex flex-col gap-6">

        {/* ── Top nav bar — always first, never scrolled away ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={reset}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer"
              style={{
                border: `1px solid ${accentColor}80`,
                background: `${accentColor}20`,
                color: accentColor,
                boxShadow: `0 0 16px ${accentColor}25`,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = `${accentColor}35`; e.currentTarget.style.boxShadow = `0 0 24px ${accentColor}45` }}
              onMouseLeave={(e) => { e.currentTarget.style.background = `${accentColor}20`; e.currentTarget.style.boxShadow = `0 0 16px ${accentColor}25` }}
            >
              ← New Experiment
            </button>
            <button
              onClick={() => useExperimentStore.getState().setScreen('plate')}
              className="px-4 py-2.5 rounded-full text-sm text-slate-500 border border-[#1a2940] hover:border-slate-600 hover:text-slate-300 transition-colors cursor-pointer"
            >
              Edit Plate
            </button>
          </div>
          <div
            className="text-xs font-mono px-3 py-1.5 rounded border"
            style={{ borderColor: `${accentColor}40`, color: accentColor, background: `${accentColor}0d` }}
          >
            ✓ PASS
          </div>
        </div>

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ background: accentColor, boxShadow: `0 0 6px ${accentColor}` }} />
            <span className="text-[10px] font-mono uppercase tracking-[0.25em]" style={{ color: accentColor }}>
              Experiment Complete · {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-3xl font-black text-white">{report.title}</h1>
          <p className="text-slate-400 text-sm mt-1">{cfg.description}</p>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* QC Metrics */}
          <div
            className="col-span-2 rounded-xl border p-5"
            style={{ borderColor: `${accentColor}25`, background: '#080f1a' }}
          >
            <p className="text-[10px] font-mono uppercase text-slate-500 tracking-widest mb-4">QC Metrics</p>
            <div className="grid grid-cols-3 gap-4">
              {report.summary.map((item) => (
                <div key={item.label}>
                  <p className="text-[10px] text-slate-600 mb-1">{item.label}</p>
                  <p
                    className="text-xl font-bold"
                    style={{ color: accentColor }}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Instruments used */}
          <div
            className="rounded-xl border p-5"
            style={{ borderColor: `${accentColor}25`, background: '#080f1a' }}
          >
            <p className="text-[10px] font-mono uppercase text-slate-500 tracking-widest mb-4">Instruments</p>
            <div className="flex flex-col gap-2">
              {cfg.instruments.map((inst, i) => (
                <div key={inst} className="flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: i === 0 ? '#00d4ff' : accentColor }}
                  />
                  <span className="text-xs text-slate-300">{inst}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t" style={{ borderColor: `${accentColor}15` }}>
              <p className="text-[10px] text-slate-600 mb-1">Total prep time</p>
              <p className="text-sm font-semibold text-slate-300">{cfg.prepTime}</p>
            </div>
          </div>
        </div>

        {/* Well plate summary */}
        <div
          className="rounded-xl border p-5"
          style={{ borderColor: `${accentColor}25`, background: '#080f1a' }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-mono uppercase text-slate-500 tracking-widest">Sample Plate Map</p>
            <span className="text-[10px] text-slate-600 font-mono">{filledCount}/96 wells · {groups.length} sample groups</span>
          </div>

          <div className="flex gap-6">
            {/* Mini plate */}
            <div className="flex flex-col gap-0.5 flex-shrink-0">
              {['A','B','C','D','E','F','G','H'].map((row) => (
                <div key={row} className="flex gap-0.5">
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map((col) => {
                    const id = `${row}${col}`
                    const well = wells.find((w) => w.id === id)!
                    return (
                      <div
                        key={id}
                        className="w-4 h-4 rounded-full"
                        style={{
                          background: well.filled ? well.groupColor : '#0d1520',
                          border: `1px solid ${well.filled ? `${well.groupColor}80` : '#1a2940'}`,
                          boxShadow: well.filled ? `0 0 3px ${well.groupColor}60` : 'none',
                        }}
                      />
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-2">
              {groups.map(([name, color]) => {
                const count = filledWells.filter((w) => w.sampleName === name).length
                return (
                  <div key={name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: color, boxShadow: `0 0 4px ${color}` }} />
                    <span className="text-xs text-slate-300">{name}</span>
                    <span className="text-[10px] text-slate-600 ml-1">×{count} wells</span>
                  </div>
                )
              })}
              {filledCount === 0 && (
                <p className="text-xs text-slate-600 italic">No samples assigned</p>
              )}
            </div>
          </div>
        </div>

        {/* Downloads */}
        <div
          className="rounded-xl border p-5"
          style={{ borderColor: `${accentColor}25`, background: '#080f1a' }}
        >
          <p className="text-[10px] font-mono uppercase text-slate-500 tracking-widest mb-4">Output Files</p>
          <div className="flex flex-wrap gap-2">
            {report.downloads.map((file) => (
              <div
                key={file}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all duration-200 hover:border-opacity-80"
                style={{
                  borderColor: `${accentColor}30`,
                  background: `${accentColor}08`,
                  color: cfg.accentColor,
                }}
                onClick={() => {}} // placeholder
              >
                <span className="text-xs">↓</span>
                <span className="text-xs font-mono">{file}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-700 mt-3">* Simulated outputs for demonstration purposes</p>
        </div>

        {/* Bottom spacer */}
        <div className="pb-4" />
      </div>
    </div>
  )
}
