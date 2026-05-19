import { useState } from 'react'
import { EXPERIMENT_CONFIGS } from '../types/experiment'
import type { ExperimentType } from '../types/experiment'
import { useExperimentStore } from '../store/experimentStore'

const ICONS: Record<ExperimentType, string> = {
  amplicon: '🧬',
  rnaseq:   '🔬',
  scrna:    '⚛️',
  massspec: '⚗️',
}

export default function ExperimentSelector() {
  const [hovered, setHovered] = useState<ExperimentType | null>(null)
  const setExperimentType = useExperimentStore((s) => s.setExperimentType)
  const setScreen = useExperimentStore((s) => s.setScreen)

  const handleSelect = (type: ExperimentType) => {
    setExperimentType(type)
    setScreen('plate')
  }

  const configs = Object.values(EXPERIMENT_CONFIGS)

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden grid-bg px-6 py-10">
      {/* Ambient */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, #00d4ff40, transparent)' }} />

      <div className="relative z-10 w-full max-w-5xl flex flex-col gap-8">
        {/* Header */}
        <div className="text-center">
          <p className="text-xs font-mono text-[#00d4ff] tracking-[0.3em] uppercase mb-3">Step 1 of 3</p>
          <h2 className="text-4xl font-bold text-white mb-2">Select Experiment Type</h2>
          <p className="text-slate-400 text-sm">Choose the assay to run on your samples</p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-2 gap-4">
          {configs.map((cfg) => {
            const isHovered = hovered === cfg.id
            return (
              <button
                key={cfg.id}
                onClick={() => handleSelect(cfg.id)}
                onMouseEnter={() => setHovered(cfg.id)}
                onMouseLeave={() => setHovered(null)}
                className="relative text-left rounded-xl border p-6 transition-all duration-300 cursor-pointer overflow-hidden group"
                style={{
                  background: isHovered ? `${cfg.accentColor}10` : '#0d1520',
                  borderColor: isHovered ? `${cfg.accentColor}80` : '#1a2940',
                  transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
                  boxShadow: isHovered ? `0 8px 40px ${cfg.accentColor}20, inset 0 0 40px ${cfg.accentColor}08` : 'none',
                }}
              >
                {/* Corner accent */}
                <div
                  className="absolute top-0 right-0 w-16 h-16 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at top right, ${cfg.accentColor}20, transparent 70%)`,
                    opacity: isHovered ? 1 : 0,
                  }}
                />

                {/* Icon + name row */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-3xl mb-2">{ICONS[cfg.id]}</div>
                    <h3
                      className="text-xl font-bold"
                      style={{ color: isHovered ? cfg.accentColor : '#e2e8f0' }}
                    >
                      {cfg.name}
                    </h3>
                  </div>
                  <div
                    className="mt-1 text-xl transition-transform duration-300"
                    style={{
                      transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                      color: cfg.accentColor,
                      opacity: isHovered ? 1 : 0.3,
                    }}
                  >
                    →
                  </div>
                </div>

                <p className="text-sm text-slate-400 mb-4 leading-relaxed">{cfg.description}</p>

                {/* Meta row */}
                <div className="flex gap-4 mb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-600 block">Prep Time</span>
                    <span className="text-xs text-slate-300">{cfg.prepTime}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-600 block">Output</span>
                    <span className="text-xs text-slate-300">{cfg.outputType}</span>
                  </div>
                </div>

                {/* Instruments */}
                <div className="flex flex-wrap gap-1">
                  {cfg.instruments.map((inst) => (
                    <span
                      key={inst}
                      className="text-[10px] px-2 py-0.5 rounded font-mono border"
                      style={{
                        borderColor: `${cfg.accentColor}30`,
                        color: cfg.accentColor,
                        background: `${cfg.accentColor}0a`,
                        opacity: isHovered ? 1 : 0.6,
                      }}
                    >
                      {inst}
                    </span>
                  ))}
                </div>

                {/* Bottom border accent */}
                <div
                  className="absolute bottom-0 left-0 h-px transition-all duration-500"
                  style={{
                    background: `linear-gradient(90deg, ${cfg.accentColor}, transparent)`,
                    width: isHovered ? '100%' : '0%',
                  }}
                />
              </button>
            )
          })}
        </div>

        {/* Back */}
        <div className="text-center">
          <button
            onClick={() => setScreen('landing')}
            className="text-xs text-slate-600 hover:text-slate-400 transition-colors font-mono cursor-pointer"
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  )
}
