/**
 * LabSimulation — single-page 3D lab simulation.
 * Bright, clinical lab aesthetic with white Hamilton robots,
 * integrated scientists, and full orbit controls.
 */

import { useEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import gsap from 'gsap'

import LabEnvironment     from './LabEnvironment'
import RobotStation       from './RobotStation'
import LabTechnician      from './LabTechnician'
import Thermocycler       from './instruments/Thermocycler'
import ChromiumController from './instruments/ChromiumController'
import MassSpectrometer   from './instruments/MassSpectrometer'
import Sequencer          from './instruments/Sequencer'

import { useLabStore }     from '../../store/labStore'
import type { RobotId, ScientistId } from '../../store/labStore'
import RequestPanel        from '../ui/RequestPanel'
import QueueSidebar        from '../ui/QueueSidebar'
import ScientistTaskPanel  from '../ui/ScientistTaskPanel'
import ProgramPanel        from '../ui/ProgramPanel'
import ResultsDrawer       from '../ui/ResultsDrawer'

// ─── Intro camera sweep ───────────────────────────────────────────────────────

function IntroCam() {
  const { camera } = useThree()
  const done = useRef(false)

  useEffect(() => {
    if (done.current) return
    done.current = true

    // Start at lab-corridor eye level — like walking through the door
    camera.position.set(0, 4, 22)
    camera.lookAt(0, 1.5, -2)

    // Arc up and back to isometric corner — classic sim-game overhead angle
    gsap.to(camera.position, {
      x: 26, y: 22, z: 30,
      duration: 5.5,
      ease: 'power2.inOut',
      onUpdate: () => camera.lookAt(0, 1.5, -2),
    })
  }, [camera])

  return null
}

// ─── Scene ────────────────────────────────────────────────────────────────────

function SceneInner() {
  const robots          = useLabStore((s) => s.robots)
  const queue           = useLabStore((s) => s.queue)
  const robotComplete   = useLabStore((s) => s.robotComplete)
  const scientists      = useLabStore((s) => s.scientists)
  const selectScientist = useLabStore((s) => s.selectScientist)

  function getExperiment(robotId: RobotId) {
    const robot = robots.find((r) => r.id === robotId)
    if (!robot || !robot.experimentId) return null
    return queue.find((e) => e.id === robot.experimentId && e.status === 'running') ?? null
  }

  function getScientistTask(id: ScientistId) {
    return scientists.find((s) => s.id === id)?.task ?? null
  }

  return (
    <>
      <IntroCam />

      {/* Fog — softens exterior beyond walls, eliminates hard background cutoff */}
      <fog attach="fog" args={['#5a6e7a', 52, 88]} />

      {/* ── Lighting ─────────────────────────────────────────────────────── */}

      {/* Ambient — lifts shadow areas without washing out detail */}
      <ambientLight intensity={0.55} color="#d8e8f8" />

      {/* Primary overhead key */}
      <directionalLight
        position={[8, 28, 16]}
        intensity={2.8}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={90}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />

      {/* Secondary overhead fill — removes harsh shadows */}
      <directionalLight
        position={[-8, 20, -10]}
        intensity={1.8}
        color="#e8f4ff"
      />

      {/* Front fill — ensures robot faces are lit from the viewer direction */}
      <pointLight position={[0, 5, 22]} intensity={2.5} color="#d8eeff" />

      {/* Instrument back-wall wash */}
      <pointLight position={[0, 6, -16]} intensity={2.0} color="#c8e0ff" />

      {/* Side fills for side benches / technicians */}
      <pointLight position={[-32, 5,  0]} intensity={1.8} color="#d0e8f8" />
      <pointLight position={[ 32, 5,  0]} intensity={1.8} color="#d0e8f8" />

      {/* Low accent — catches underside of bench / floor reflections */}
      <pointLight position={[0, -0.2, 0]} intensity={0.6} color="#a0c0e0" />

      {/* Overhead rect lights above each robot station */}
      <rectAreaLight
        position={[-16, 8.5, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={14} height={12}
        intensity={2.5}
        color="#e8f4ff"
      />
      <rectAreaLight
        position={[0, 8.5, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={14} height={12}
        intensity={2.5}
        color="#e8f4ff"
      />
      <rectAreaLight
        position={[16, 8.5, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={14} height={12}
        intensity={2.5}
        color="#e8f4ff"
      />

      {/* Side aisle rect lights */}
      <rectAreaLight
        position={[-29, 8.5, -2]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={7} height={10}
        intensity={2.0}
        color="#e0f0ff"
      />
      <rectAreaLight
        position={[29, 8.5, -2]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={7} height={10}
        intensity={2.0}
        color="#e0f0ff"
      />

      {/* ── Environment ──────────────────────────────────────────────────── */}
      <LabEnvironment />

      {/* ── Robot Stations ───────────────────────────────────────────────── */}
      <group position={[-16, 0, 0]}>
        <RobotStation robotId="A" experiment={getExperiment('A')} onComplete={robotComplete} idlePhase={0} />
      </group>
      <group position={[0, 0, 0]}>
        <RobotStation robotId="B" experiment={getExperiment('B')} onComplete={robotComplete} idlePhase={1.4} />
      </group>
      <group position={[16, 0, 0]}>
        <RobotStation robotId="C" experiment={getExperiment('C')} onComplete={robotComplete} idlePhase={2.8} />
      </group>

      {/* ── Instruments — back shelf ──────────────────────────────────────── */}
      {/*
        Instrument internal offsets (baked into each component):
          Thermocycler  [-5.5, 0, -3.5]   target world X=-14 Z=-12  → parent [-8.5, 0, -8.5]
          Chromium      [-5.5, 0, -3.5]   target world X= -4 Z=-12  → parent [ 1.5, 0, -8.5]
          MassSpec      [ 5.5, 0, -3.5]   target world X=  4 Z=-12  → parent [-1.5, 0, -8.5]
          Sequencer     [ 5.5, 0, -3.5]   target world X= 14 Z=-12  → parent [ 8.5, 0, -8.5]
      */}
      <group position={[-8.5, 0, -8.5]}><Thermocycler /></group>
      <group position={[ 1.5, 0, -8.5]}><ChromiumController /></group>
      <group position={[-1.5, 0, -8.5]}><MassSpectrometer /></group>
      <group position={[ 8.5, 0, -8.5]}><Sequencer color="#00d4ff" /></group>

      {/* ── Lab Technicians — click to assign tasks ───────────────────────── */}
      <LabTechnician
        route="A" hairColor="#2a1a0a" phaseOffset={0}
        task={getScientistTask('A')}
        onSelect={() => selectScientist('A')}
      />
      <LabTechnician
        route="B" hairColor="#7a3a18" phaseOffset={5.5}
        task={getScientistTask('B')}
        onSelect={() => selectScientist('B')}
      />
      <LabTechnician
        route="C" hairColor="#7a4520" skinColor="#c49060" phaseOffset={11} female
        task={getScientistTask('C')}
        onSelect={() => selectScientist('C')}
      />

      {/* ── Workstation glow rings — appear when a scientist is on task ───── */}
      {scientists.map((sc) =>
        sc.task ? (
          <group key={sc.id}>
            <mesh
              position={[sc.task.workstationX, -0.58, sc.task.workstationZ]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <ringGeometry args={[0.55, 0.95, 32]} />
              <meshStandardMaterial
                color={sc.task.accentColor}
                emissive={sc.task.accentColor}
                emissiveIntensity={1.4}
                transparent
                opacity={0.55}
                depthWrite={false}
              />
            </mesh>
            <pointLight
              position={[sc.task.workstationX, 1.2, sc.task.workstationZ]}
              color={sc.task.accentColor}
              intensity={1.8}
              distance={6}
              decay={2}
            />
          </group>
        ) : null
      )}

      {/* ── Post-processing ───────────────────────────────────────────────── */}
      {/*
        Bloom: high threshold — only emissive accents and instrument screens glow.
        Vignette: very subtle, just darkens the very edges slightly.
      */}
      <EffectComposer>
        {/* High threshold so only emissive LEDs/strips bloom, not the white robot bodies */}
        <Bloom
          luminanceThreshold={0.92}
          luminanceSmoothing={0.8}
          intensity={0.5}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.25} darkness={0.25} />
      </EffectComposer>

      <OrbitControls
        enablePan
        minDistance={5}
        maxDistance={80}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 0, -2]}
        enableDamping
        dampingFactor={0.07}
      />
    </>
  )
}

// ─── Public component ─────────────────────────────────────────────────────────

export default function LabSimulation() {
  const openPanel        = useLabStore((s) => s.openRequestPanel)
  const requestPanelOpen = useLabStore((s) => s.requestPanelOpen)
  const programPanelOpen = useLabStore((s) => s.programPanelOpen)
  const openProgramPanel = useLabStore((s) => s.openProgramPanel)
  const startProgram     = useLabStore((s) => s.startProgram)
  const program          = useLabStore((s) => s.program)
  const resultsPhaseId   = useLabStore((s) => s.resultsPhaseId)

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#5a6e7a' }}>
      <Canvas
        shadows
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [26, 22, 30], fov: 46 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.85,
        }}
      >
        <SceneInner />
      </Canvas>

      {/* ── HUD ───────────────────────────────────────────────────────────── */}

      {/* Top-left branding */}
      <div style={{ position: 'absolute', top: 20, left: 24, pointerEvents: 'none' }}>
        <div style={{
          fontSize: 9, fontFamily: 'monospace', textTransform: 'uppercase',
          letterSpacing: '0.25em', color: '#00b8e0', marginBottom: 4,
          textShadow: '0 1px 4px rgba(0,0,0,0.35)',
        }}>
          Automated Genomics Lab
        </div>
        <div style={{
          fontSize: 22, fontWeight: 900, letterSpacing: '0.12em', color: '#0a1a2e',
          textShadow: '0 1px 0 rgba(255,255,255,0.5), 0 0 16px rgba(0,180,220,0.25)',
        }}>
          VIRTUAL LAB
        </div>
        <div style={{
          fontSize: 9, fontFamily: 'monospace', color: '#3a5068',
          letterSpacing: '0.1em', marginTop: 3,
        }}>
          HAMILTON STAR · 3× INSTRUMENT ARRAY · LIVE SIMULATION
        </div>
      </div>

      <QueueSidebar />
      <ScientistTaskPanel />

      {requestPanelOpen && <RequestPanel />}
      {programPanelOpen && <ProgramPanel />}
      {resultsPhaseId && <ResultsDrawer />}

      {!requestPanelOpen && !programPanelOpen && (
        <div style={{
          position: 'absolute', bottom: 28, left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', gap: 12,
        }}>
          {/* Research Program button */}
          <button
            onClick={() => program ? openProgramPanel() : startProgram()}
            style={{
              fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              color: '#050a0f',
              background: 'linear-gradient(135deg, #ff6b35, #c94d1e)',
              border: 'none', borderRadius: 8,
              padding: '12px 28px', cursor: 'pointer',
              boxShadow: '0 0 28px rgba(255,107,53,0.5), 0 4px 12px rgba(0,0,0,0.4)',
              transition: 'box-shadow 0.2s, transform 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 48px rgba(255,107,53,0.75), 0 4px 16px rgba(0,0,0,0.5)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 28px rgba(255,107,53,0.5), 0 4px 12px rgba(0,0,0,0.4)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {program ? '▶ PCSK9 Program' : '▶ Research Program'}
          </button>

          {/* Request Experiment button */}
          <button
            onClick={openPanel}
            style={{
              fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              color: '#050a0f',
              background: 'linear-gradient(135deg, #00d4ff, #0090bb)',
              border: 'none', borderRadius: 8,
              padding: '12px 28px', cursor: 'pointer',
              boxShadow: '0 0 28px rgba(0,212,255,0.5), 0 4px 12px rgba(0,0,0,0.4)',
              transition: 'box-shadow 0.2s, transform 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 48px rgba(0,212,255,0.75), 0 4px 16px rgba(0,0,0,0.5)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 28px rgba(0,212,255,0.5), 0 4px 12px rgba(0,0,0,0.4)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            + Request Experiment
          </button>
        </div>
      )}

      <div style={{
        position: 'absolute', bottom: 28, right: 24,
        fontSize: 9, fontFamily: 'monospace', color: '#374151',
        letterSpacing: '0.12em', pointerEvents: 'none',
      }}>
        DRAG TO ORBIT · SCROLL TO ZOOM
      </div>
    </div>
  )
}
