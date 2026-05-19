import { useEffect, useRef } from 'react'
import { useExperimentStore } from '../store/experimentStore'

const PARTICLES = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 0.5,
  opacity: Math.random() * 0.4 + 0.1,
  duration: Math.random() * 6 + 4,
  delay: Math.random() * 5,
}))

export default function Landing() {
  const setScreen = useExperimentStore((s) => s.setScreen)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const badgesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const els = [titleRef.current, subtitleRef.current, badgesRef.current, btnRef.current]
    els.forEach((el, i) => {
      if (!el) return
      el.style.opacity = '0'
      el.style.transform = 'translateY(24px)'
      el.style.transition = `opacity 0.7s ease ${i * 0.15}s, transform 0.7s ease ${i * 0.15}s`
      requestAnimationFrame(() => {
        setTimeout(() => {
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
        }, 50)
      })
    })
  }, [])

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden grid-bg">
      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #00d4ff08 0%, transparent 70%)', transform: 'translate(-50%, -50%)' }} />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7c3aed0a 0%, transparent 70%)', transform: 'translate(50%, 50%)' }} />

      {/* Floating particles */}
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: '#00d4ff',
            opacity: p.opacity,
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
          }}
        />
      ))}

      <style>{`
        @keyframes float {
          from { transform: translateY(0px) translateX(0px); opacity: 0.1; }
          to   { transform: translateY(-20px) translateX(8px); opacity: 0.5; }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0,212,255,0.4); }
          70%  { transform: scale(1);    box-shadow: 0 0 0 20px rgba(0,212,255,0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0,212,255,0); }
        }
      `}</style>

      {/* Header badge */}
      <div className="absolute top-8 left-8 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#00d4ff]" style={{ boxShadow: '0 0 6px #00d4ff' }} />
        <span className="text-xs font-mono text-[#00d4ff] tracking-[0.2em] uppercase opacity-60">
          Virtual Lab System v1.0
        </span>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-4xl">
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#00d4ff]" />
          <span className="text-xs font-mono text-[#00d4ff] tracking-[0.3em] uppercase">
            Automated Genomics & Proteomics
          </span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#00d4ff]" />
        </div>

        {/* Title */}
        <h1
          ref={titleRef}
          className="text-7xl font-black tracking-tight leading-none mb-4"
          style={{ color: '#f0f9ff' }}
        >
          VIRTUAL
          <span
            className="block text-glow-cyan"
            style={{ color: '#00d4ff' }}
          >
            LAB
          </span>
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-lg text-slate-400 max-w-xl leading-relaxed mb-10"
        >
          Design your experiment. Watch a Hamilton liquid handler execute it in
          real-time 3D. From 96-well plate setup to sequencing run — fully animated.
        </p>

        {/* Experiment type badges */}
        <div ref={badgesRef} className="flex flex-wrap justify-center gap-2 mb-10">
          {[
            { label: 'Amplicon Seq', color: '#00d4ff' },
            { label: 'RNA-seq', color: '#ff6b35' },
            { label: 'scRNA-seq', color: '#7c3aed' },
            { label: 'Mass Spec', color: '#10b981' },
          ].map((b) => (
            <span
              key={b.label}
              className="px-3 py-1 text-xs font-mono rounded-full border"
              style={{
                borderColor: `${b.color}40`,
                color: b.color,
                background: `${b.color}0d`,
              }}
            >
              {b.label}
            </span>
          ))}
        </div>

        {/* CTA */}
        <button
          ref={btnRef}
          onClick={() => setScreen('select')}
          className="relative group px-10 py-4 text-base font-semibold tracking-wide rounded-full transition-all duration-300 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #00d4ff22, #00d4ff11)',
            border: '1px solid #00d4ff60',
            color: '#00d4ff',
            animation: 'pulse-ring 2.5s ease infinite',
          }}
          onMouseEnter={(e) => {
            const t = e.currentTarget
            t.style.background = 'linear-gradient(135deg, #00d4ff33, #00d4ff1a)'
            t.style.borderColor = '#00d4ffaa'
            t.style.boxShadow = '0 0 30px #00d4ff44'
            t.style.animation = 'none'
          }}
          onMouseLeave={(e) => {
            const t = e.currentTarget
            t.style.background = 'linear-gradient(135deg, #00d4ff22, #00d4ff11)'
            t.style.borderColor = '#00d4ff60'
            t.style.boxShadow = ''
            t.style.animation = 'pulse-ring 2.5s ease infinite'
          }}
        >
          Start Experiment
          <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
        </button>
      </div>

      {/* Bottom info strip */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-[#00d4ff10] px-8 py-4 flex justify-between items-center">
        <span className="text-xs text-slate-600 font-mono">HAMILTON STAR · 10x CHROMIUM · ILLUMINA NOVASEQ · ORBITRAP</span>
        <span className="text-xs text-slate-600 font-mono">Three.js · React · GSAP</span>
      </div>
    </div>
  )
}
