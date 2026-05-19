import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import gsap from 'gsap'

import LabEnvironment from './LabEnvironment'
import HamiltonRobot from './HamiltonRobot'
import type { HamiltonRefs } from './HamiltonRobot'
import Thermocycler from './instruments/Thermocycler'
import type { ThermocyclerRefs } from './instruments/Thermocycler'
import Sequencer from './instruments/Sequencer'
import type { SequencerRefs } from './instruments/Sequencer'
import ChromiumController from './instruments/ChromiumController'
import type { ChromiumRefs } from './instruments/ChromiumController'
import MassSpectrometer from './instruments/MassSpectrometer'
import type { MassSpecRefs } from './instruments/MassSpectrometer'

import { useExperimentStore } from '../../store/experimentStore'
import { EXPERIMENT_CONFIGS } from '../../types/experiment'
import type { ExperimentType } from '../../types/experiment'

// ─── Smooth look-at target ────────────────────────────────────────────────────

interface Vec3 { x: number; y: number; z: number }

function CameraRig({ targetRef }: { targetRef: React.RefObject<Vec3> }) {
  const { camera } = useThree()
  useFrame(() => {
    if (targetRef.current) {
      camera.lookAt(targetRef.current.x, targetRef.current.y, targetRef.current.z)
    }
  })
  return null
}

// ─── Pulsing accent light that activates during instrument steps ──────────────

function AccentLight({ color, active }: { color: string; active: boolean }) {
  const lightRef = useRef<THREE.PointLight>(null)
  const t = useRef(0)
  useFrame((_, delta) => {
    if (!lightRef.current) return
    t.current += delta * 3
    const pulse = active ? 1.5 + Math.sin(t.current) * 0.5 : 0.6
    lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, pulse, 0.08)
  })
  return (
    <>
      <pointLight ref={lightRef} position={[-5, 3, -4]} color={color} intensity={0.6} />
      <pointLight position={[5, 3, -4]} color={color} intensity={active ? 0.8 : 0.3} />
    </>
  )
}

// ─── Animated Well Plate ─────────────────────────────────────────────────────
// Renders on the deck; each column lights up as the arm stamps it, then stays lit.

function AnimatedWellPlate({
  activeColRef,
  processedColsRef,
  accentColor,
}: {
  activeColRef: React.RefObject<number>
  processedColsRef: React.RefObject<Set<number>>
  accentColor: string
}) {
  // Store material refs for all 96 wells: [col 0-11][row 0-7]
  const matGrid = useRef<(THREE.MeshStandardMaterial | null)[][]>(
    Array.from({ length: 12 }, () => new Array(8).fill(null))
  )
  const pulseT = useRef(0)
  const dropletT = useRef(0)

  // Moving column spotlight — follows the active column X
  const colLightRef = useRef<THREE.PointLight>(null)

  // Droplet particle meshes — 8 channels, one per row
  const dropletRefs = useRef<(THREE.Mesh | null)[]>(new Array(8).fill(null))

  useFrame((_, delta) => {
    pulseT.current += delta * 5
    dropletT.current += delta * 9
    const pulse = 0.65 + Math.sin(pulseT.current) * 0.35

    const active = activeColRef.current ?? -1
    const processed = processedColsRef.current ?? new Set<number>()

    // ── Well material updates ──────────────────────────────────────────────
    for (let c = 0; c < 12; c++) {
      for (let r = 0; r < 8; r++) {
        const mat = matGrid.current[c]?.[r]
        if (!mat) continue
        if (c === active) {
          mat.color.set(accentColor)
          mat.emissive.set(accentColor)
          mat.emissiveIntensity = pulse * 2.2
          mat.opacity = 1
        } else if (processed.has(c)) {
          // Looks like it's filled with liquid — accent tinted, moderately bright
          mat.color.set(accentColor)
          mat.emissive.set(accentColor)
          mat.emissiveIntensity = 0.35
          mat.opacity = 0.75
        } else {
          mat.color.set('#0a1828')
          mat.emissive.set('#000000')
          mat.emissiveIntensity = 0
          mat.opacity = 0.5
        }
      }
    }

    // ── Moving column spotlight ────────────────────────────────────────────
    if (colLightRef.current) {
      const targetIntensity = active >= 0 ? 5.0 : 0
      colLightRef.current.intensity = THREE.MathUtils.lerp(
        colLightRef.current.intensity, targetIntensity, 0.18
      )
      if (active >= 0) {
        const targetX = (active - 5.5) * 0.38
        colLightRef.current.position.x = THREE.MathUtils.lerp(
          colLightRef.current.position.x, targetX, 0.25
        )
      }
    }

    // ── Droplet particles ─────────────────────────────────────────────────
    // Oscillate up and down between the pipette tip and well surface
    const dropY = 0.28 + Math.sin(dropletT.current) * 0.14
    dropletRefs.current.forEach((d, r) => {
      if (!d) return
      d.visible = active >= 0
      if (active >= 0) {
        d.position.x = (active - 5.5) * 0.38
        d.position.y = dropY
        d.position.z = (r - 3.5) * 0.38
      }
    })
  })

  return (
    <group position={[0, 0.1, -0.5]}>
      {/* Plate body — white-ish polypropylene */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[4.8, 0.12, 3.2]} />
        <meshStandardMaterial color="#c4d0dc" metalness={0.1} roughness={0.45} />
      </mesh>

      {/* Plate rim border (darker outline) */}
      <mesh position={[0, 0.07, 0]}>
        <boxGeometry args={[4.82, 0.02, 3.22]} />
        <meshStandardMaterial color="#8090a0" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Moving column spotlight — tracks active column, illuminates the wells */}
      <pointLight
        ref={colLightRef}
        position={[0, 0.9, 0]}
        color={accentColor}
        intensity={0}
        distance={2.2}
        decay={2}
      />

      {/* 96 wells */}
      {Array.from({ length: 12 }, (_, col) =>
        Array.from({ length: 8 }, (_, row) => (
          <mesh
            key={`${col}-${row}`}
            position={[(col - 5.5) * 0.38, 0.07, (row - 3.5) * 0.38]}
            ref={(mesh: THREE.Mesh | null) => {
              if (mesh && matGrid.current[col]) {
                matGrid.current[col][row] = mesh.material as THREE.MeshStandardMaterial
              }
            }}
          >
            <cylinderGeometry args={[0.11, 0.10, 0.11, 12]} />
            <meshStandardMaterial
              color="#0a1828"
              transparent
              opacity={0.5}
            />
          </mesh>
        ))
      )}

      {/* Droplet particles — 8 channels, one per row, animated during dispensing */}
      {Array.from({ length: 8 }, (_, r) => (
        <mesh
          key={`drop-${r}`}
          ref={(m: THREE.Mesh | null) => { dropletRefs.current[r] = m }}
          visible={false}
          position={[0, 0.3, (r - 3.5) * 0.38]}
        >
          <sphereGeometry args={[0.03, 7, 7]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={3.5}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
    </group>
  )
}

// ─── Inner scene ─────────────────────────────────────────────────────────────

interface InnerProps {
  experimentType: ExperimentType
  onStepChange: (step: number) => void
  onComplete: () => void
}

function InnerScene({ experimentType, onStepChange, onComplete }: InnerProps) {
  const { camera } = useThree()
  const cfg = EXPERIMENT_CONFIGS[experimentType]
  const accentColor = cfg.accentColor

  const hamiltonRef = useRef<HamiltonRefs>(null)
  const thermocyclerRef = useRef<ThermocyclerRefs>(null)
  const sequencerRef = useRef<SequencerRefs>(null)
  const chromiumRef = useRef<ChromiumRefs>(null)
  const massSpecRef = useRef<MassSpecRefs>(null)
  const orbitRef = useRef<any>(null)

  const cameraTargetRef = useRef<Vec3>({ x: 0, y: 0.5, z: 0 })
  const [instrumentActive, setInstrumentActive] = useState(false)

  // Well plate column state — refs so GSAP callbacks read current values
  const activeColRef = useRef<number>(-1)
  const processedColsRef = useRef<Set<number>>(new Set())

  // Pulsing emissive materials (screens, status lights during processing)
  const pulsingMats = useRef<THREE.MeshStandardMaterial[]>([])
  const pulseT = useRef(0)
  useFrame((_, delta) => {
    pulseT.current += delta * 2.5
    const v = 0.4 + Math.sin(pulseT.current) * 0.35
    pulsingMats.current.forEach((m) => { if (m) m.emissiveIntensity = v })
  })

  useEffect(() => {
    if (orbitRef.current) orbitRef.current.enabled = false
    pulsingMats.current = []
    activeColRef.current = -1
    processedColsRef.current = new Set()

    // Start with dramatic close side-angle shot
    camera.position.set(10, 3, 10)
    camera.lookAt(0, 1, 0)
    cameraTargetRef.current = { x: 0, y: 1, z: 0 }

    const h = hamiltonRef.current
    if (!h) return

    const bridge  = h.bridgeRef.current
    const carriage = h.carriageRef.current
    const head    = h.headRef.current
    const tips    = h.tipsRef.current
    const headMat = h.headLightRef.current

    const tl = gsap.timeline({
      onComplete: () => {
        if (orbitRef.current) orbitRef.current.enabled = true
        onComplete()
      },
    })

    // ── Cinematic intro: pull back to reveal the full lab ──────────────────
    tl.to(camera.position, { x: 4, y: 10, z: 18, duration: 2.5, ease: 'power2.out' })
    tl.to(cameraTargetRef.current, { x: 0, y: 0.5, z: -1, duration: 2.5, ease: 'power2.out' }, '<')

    // ── Step 0: Load tips ──────────────────────────────────────────────────
    tl.add(() => onStepChange(0))

    // Arm glides to tip box (back-right of deck)
    if (bridge)  tl.to(bridge.position,  { z: 3.2, duration: 1.6, ease: 'power3.inOut' })
    if (carriage) tl.to(carriage.position, { x: -4.5, duration: 1.2, ease: 'power3.inOut' }, '<')

    // Camera follows the arm — close angle from the front
    tl.to(camera.position, { x: -6, y: 5, z: 8, duration: 1.5, ease: 'power2.inOut' }, '-=0.8')
    tl.to(cameraTargetRef.current, { x: -3, y: 1, z: 2, duration: 1.5, ease: 'power2.inOut' }, '<')

    // Pipette descends, loads tips, ascends
    if (head) {
      tl.to(head.position, { y: 0.15, duration: 0.9, ease: 'power2.in' })
      tl.to({}, { duration: 0.35 })
      tl.to(head.position, { y: 1.5, duration: 0.9, ease: 'power2.out' })
    }
    tl.add(() => { if (tips) tips.visible = true })
    if (headMat) tl.to(headMat, { emissiveIntensity: 1.0, duration: 0.4 }, '<')

    // Well plate column X positions — wells are at (col_index - 5.5) * 0.38
    // col_index 0–11 → x: -2.09 to +2.09 (exactly matching the WellPlateModel geometry)
    const plateColX = Array.from({ length: 12 }, (_, i) => parseFloat(((i - 5.5) * 0.38).toFixed(3)))
    // [-2.09, -1.71, -1.33, -0.95, -0.57, -0.19, 0.19, 0.57, 0.95, 1.33, 1.71, 2.09]

    // ── Step 1: Sample transfer — all 12 columns, left → right ────────────
    tl.add(() => onStepChange(1))

    // Camera tilted overhead to clearly show the plate grid
    tl.to(camera.position, { x: -2, y: 9, z: 8, duration: 1.8, ease: 'power2.inOut' })
    tl.to(cameraTargetRef.current, { x: 0, y: 0.2, z: -0.5, duration: 1.8, ease: 'power2.inOut' }, '<')

    // Bridge positions over plate center (z = -0.5 = center of WellPlateModel)
    if (bridge) tl.to(bridge.position, { z: -0.5, duration: 1.4, ease: 'power3.inOut' })
    // Start at col 1
    if (carriage) tl.to(carriage.position, { x: plateColX[0], duration: 0.8, ease: 'power2.out' })

    // Sweep columns 1 → 12 systematically
    plateColX.forEach((cx, i) => {
      if (carriage) tl.to(carriage.position, { x: cx, duration: 0.38, ease: 'none' })
      // Activate this column (wells glow)
      tl.add(() => { activeColRef.current = i })
      if (head) {
        tl.to(head.position, { y: 0.5, duration: 0.18, ease: 'power2.in' })
        tl.to({}, { duration: 0.10 }) // brief pause at bottom = aspirate
        tl.to(head.position, { y: 1.5, duration: 0.18, ease: 'power2.out' })
      }
      // Mark processed, deactivate (wells stay dimly lit)
      tl.add(() => { processedColsRef.current.add(i); activeColRef.current = -1 })
      // Camera follows: pan right midway through
      if (i === 5) {
        tl.to(camera.position, { x: 2, y: 9, z: 8, duration: 1.2, ease: 'power2.inOut' }, '-=0.4')
        tl.to(cameraTargetRef.current, { x: 0.5, y: 0.2, z: -0.5, duration: 1.2, ease: 'power2.inOut' }, '<')
      }
    })

    // ── Step 2: Reagent addition — columns 12 → 1 (reverse sweep) ─────────
    tl.add(() => onStepChange(2))

    // Camera: low front angle watching the arm working
    tl.to(camera.position, { x: 0, y: 5, z: 12, duration: 1.5, ease: 'power2.inOut' })
    tl.to(cameraTargetRef.current, { x: 0, y: 1, z: 0, duration: 1.5, ease: 'power2.inOut' }, '<')

    // Go to reagent trough first (right side of deck)
    if (bridge)   tl.to(bridge.position,  { z: 3.2, duration: 1.0, ease: 'power3.inOut' })
    if (carriage)  tl.to(carriage.position, { x: 3.5, duration: 0.9, ease: 'power3.inOut' }, '<')
    if (head) {
      tl.to(head.position, { y: 0.3, duration: 0.6, ease: 'power2.in' })
      tl.to({}, { duration: 0.35 })
      tl.to(head.position, { y: 1.5, duration: 0.6, ease: 'power2.out' })
    }

    // Return to plate, reverse sweep col 12 → 1
    if (bridge) tl.to(bridge.position, { z: -0.5, duration: 1.0, ease: 'power3.inOut' })
    if (carriage) tl.to(carriage.position, { x: plateColX[11], duration: 0.7, ease: 'power2.out' })

    plateColX.slice().reverse().forEach((cx, revI) => {
      const colI = 11 - revI
      if (carriage) tl.to(carriage.position, { x: cx, duration: 0.36, ease: 'none' })
      tl.add(() => { activeColRef.current = colI })
      if (head) {
        tl.to(head.position, { y: 0.5, duration: 0.17, ease: 'power2.in' })
        tl.to({}, { duration: 0.08 })
        tl.to(head.position, { y: 1.5, duration: 0.17, ease: 'power2.out' })
      }
      tl.add(() => { activeColRef.current = -1 })
    })

    // ── Step 3: Instrument-specific processing ─────────────────────────────
    tl.add(() => { onStepChange(3); setInstrumentActive(true) })

    // Camera sweeps left toward the instrument
    tl.to(camera.position, { x: -8, y: 5, z: 4, duration: 2.2, ease: 'power2.inOut' })
    tl.to(cameraTargetRef.current, { x: -5.5, y: 0.5, z: -3.5, duration: 2.2, ease: 'power2.inOut' }, '<')

    if (experimentType === 'amplicon' || experimentType === 'rnaseq') {
      const tc = thermocyclerRef.current
      if (tc?.screenMatRef.current) pulsingMats.current.push(tc.screenMatRef.current)
      if (tc?.lidRef.current) {
        tl.to(tc.lidRef.current.rotation, { x: -Math.PI * 0.65, duration: 1.3, ease: 'power2.inOut' })
        // Closer camera while lid is open
        tl.to(camera.position, { x: -5, y: 4, z: 2, duration: 1.2, ease: 'power2.inOut' }, '-=0.5')
        tl.to(cameraTargetRef.current, { x: -5.5, y: 0.8, z: -3.5, duration: 1.2, ease: 'power2.inOut' }, '<')
        tl.to({}, { duration: 2.2 })
        tl.to(tc.lidRef.current.rotation, { x: 0, duration: 1.3, ease: 'power2.inOut' })
      }
    }

    if (experimentType === 'scrna') {
      const cr = chromiumRef.current
      if (cr?.screenMatRef.current) pulsingMats.current.push(cr.screenMatRef.current)
      if (cr?.chipTrayRef.current) {
        tl.to(cr.chipTrayRef.current.position, { z: 1.6, duration: 1.1, ease: 'power2.out' })
        tl.to(camera.position, { x: -4, y: 3, z: 1, duration: 1.0, ease: 'power2.inOut' }, '-=0.5')
        tl.to(cameraTargetRef.current, { x: -5.5, y: 0.5, z: -3.5, duration: 1.0, ease: 'power2.inOut' }, '<')
        tl.to({}, { duration: 1.8 })
        tl.to(cr.chipTrayRef.current.position, { z: 0.81, duration: 1.1, ease: 'power2.in' })
      }
    }

    if (experimentType === 'massspec') {
      const ms = massSpecRef.current
      if (ms?.screenMatRef.current) pulsingMats.current.push(ms.screenMatRef.current)
      if (ms?.inletGroupRef.current) {
        tl.to(ms.inletGroupRef.current.position, { z: 1.7, duration: 0.9, ease: 'power2.out' })
        tl.to(camera.position, { x: 4, y: 3, z: 2, duration: 1.2, ease: 'power2.inOut' }, '-=0.5')
        tl.to(cameraTargetRef.current, { x: 5.5, y: 0.5, z: -3.5, duration: 1.2, ease: 'power2.inOut' }, '<')
        tl.to({}, { duration: 2.5 })
      }
    }

    // ── Step 4: Library prep ───────────────────────────────────────────────
    tl.add(() => { onStepChange(4); setInstrumentActive(false) })

    tl.to(camera.position, { x: -2, y: 9, z: 14, duration: 2.0, ease: 'power2.inOut' })
    tl.to(cameraTargetRef.current, { x: 0, y: 0.5, z: 0, duration: 2.0, ease: 'power2.inOut' }, '<')

    if (bridge)  tl.to(bridge.position, { z: 1.0, duration: 1.2, ease: 'power3.inOut' }, '<')
    if (carriage) tl.to(carriage.position, { x: 0, duration: 1.0, ease: 'power3.inOut' }, '<')

    // Every other column on the plate
    const cleanupCols = [plateColX[0], plateColX[2], plateColX[5], plateColX[8], plateColX[10], plateColX[11]]
    cleanupCols.forEach((cx) => {
      if (carriage) tl.to(carriage.position, { x: cx, duration: 0.4, ease: 'power1.inOut' })
      if (head) {
        tl.to(head.position, { y: 0.45, duration: 0.2 })
        tl.to(head.position, { y: 1.5, duration: 0.2 })
      }
    })

    // ── Step 5: Sequencer run ──────────────────────────────────────────────
    tl.add(() => onStepChange(5))

    // Camera arc around to the right instrument
    tl.to(camera.position, { x: 9, y: 4, z: 3, duration: 2.2, ease: 'power2.inOut' })
    tl.to(cameraTargetRef.current, { x: 5.5, y: 0.5, z: -3.5, duration: 2.2, ease: 'power2.inOut' }, '<')

    const seq = sequencerRef.current
    if (seq?.screenMatRef.current) pulsingMats.current.push(seq.screenMatRef.current)

    if (seq?.doorRef.current) {
      tl.to(seq.doorRef.current.position, { z: 1.4, duration: 1.1, ease: 'power2.out' })
      // Camera moves in close to the door
      tl.to(camera.position, { x: 7, y: 3, z: 1, duration: 1.2, ease: 'power2.inOut' }, '-=0.3')
      tl.to(cameraTargetRef.current, { x: 5.5, y: 0.8, z: -3.5, duration: 1.2, ease: 'power2.inOut' }, '<')
      tl.to({}, { duration: 0.8 })
      tl.to(seq.doorRef.current.position, { z: 1.01, duration: 1.1, ease: 'power2.in' })
    }

    if (seq?.screenMatRef.current) {
      tl.to(seq.screenMatRef.current, { emissiveIntensity: 2.0, duration: 1.2, ease: 'power2.out' })
    }
    if (seq?.runningLightRef.current) {
      tl.to(seq.runningLightRef.current, { emissiveIntensity: 2.5, duration: 0.8 }, '<')
    }

    // Camera widens to show whole sequencer
    tl.to(camera.position, { x: 10, y: 5, z: 5, duration: 1.8, ease: 'power2.inOut' })
    tl.to(cameraTargetRef.current, { x: 5.5, y: 0.5, z: -3.5, duration: 1.8, ease: 'power2.inOut' }, '<')
    tl.to({}, { duration: 2.5 })

    // ── Grand finale: slow pullback to full lab panorama ───────────────────
    if (headMat) tl.to(headMat, { emissiveIntensity: 2.5, duration: 1.5 }, '<')
    tl.to(camera.position, { x: 2, y: 18, z: 26, duration: 3.5, ease: 'power1.inOut' })
    tl.to(cameraTargetRef.current, { x: 0, y: 0, z: -2, duration: 3.5, ease: 'power1.inOut' }, '<')
    tl.to({}, { duration: 1.0 })

    return () => { tl.kill() }
  }, [experimentType])

  const showThermocycler = experimentType === 'amplicon' || experimentType === 'rnaseq'
  const showChromium = experimentType === 'scrna'
  const showMassSpec = experimentType === 'massspec'

  return (
    <>
      <CameraRig targetRef={cameraTargetRef} />

      {/* Lighting rig */}
      <ambientLight intensity={0.45} color="#8ab0d0" />

      {/* Key light — strong cool overhead */}
      <directionalLight
        position={[4, 18, 10]}
        intensity={2.2}
        color="#d0e8ff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
      />

      {/* Fill light — front-low so the robot face is visible */}
      <pointLight position={[0, 2, 12]} intensity={1.2} color="#b0d0ff" />

      {/* Rim/back light to separate robot from background */}
      <pointLight position={[0, 6, -10]} intensity={1.0} color="#204060" />

      {/* Side fills */}
      <pointLight position={[-10, 4, 0]} intensity={0.6} color="#102030" />
      <pointLight position={[10, 4, 0]}  intensity={0.6} color="#102030" />

      {/* Accent lights that pulse when instruments run */}
      <AccentLight color={accentColor} active={instrumentActive} />

      {/* Overhead strip lights above bench */}
      <rectAreaLight
        position={[0, 5.5, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={16}
        height={10}
        intensity={1.8}
        color="#a0c8e8"
      />

      <LabEnvironment />
      <HamiltonRobot ref={hamiltonRef} accentColor={accentColor} />
      <AnimatedWellPlate
        activeColRef={activeColRef}
        processedColsRef={processedColsRef}
        accentColor={accentColor}
      />

      {showThermocycler && <Thermocycler ref={thermocyclerRef} />}
      {showChromium    && <ChromiumController ref={chromiumRef} />}
      {showMassSpec    && <MassSpectrometer ref={massSpecRef} />}

      <Sequencer ref={sequencerRef} color={accentColor} />

      <Stars radius={80} depth={40} count={1200} factor={2.5} saturation={0.2} speed={0.2} />

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.45}
          luminanceSmoothing={0.9}
          intensity={1.6}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.15} darkness={0.7} />
      </EffectComposer>

      <OrbitControls
        ref={orbitRef}
        enabled={false}
        minDistance={4}
        maxDistance={40}
        maxPolarAngle={Math.PI / 2.1}
      />
    </>
  )
}

// ─── Step HUD ────────────────────────────────────────────────────────────────

function StepHUD({ experimentType, currentStep }: { experimentType: ExperimentType; currentStep: number }) {
  const cfg = EXPERIMENT_CONFIGS[experimentType]
  const steps = cfg.steps

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 24 }}>
      {/* Top-left badge */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.accentColor, boxShadow: `0 0 8px ${cfg.accentColor}` }} />
          <span style={{ fontSize: 10, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.2em', color: cfg.accentColor }}>
            {cfg.shortName} · Running
          </span>
        </div>
        <h3 style={{ color: 'white', fontSize: 20, fontWeight: 700, margin: 0 }}>{cfg.name}</h3>
      </div>

      {/* Bottom-left progress card */}
      <div style={{
        background: 'rgba(4,9,18,0.88)',
        border: `1px solid ${cfg.accentColor}30`,
        borderRadius: 14,
        padding: '14px 18px',
        maxWidth: 300,
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 9, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#475569' }}>
            Workflow Progress
          </span>
          <span style={{ fontSize: 10, fontFamily: 'monospace', color: cfg.accentColor }}>
            {currentStep + 1}/{steps.length}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 2, background: '#0f2035', borderRadius: 2, marginBottom: 12, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${((currentStep + 1) / steps.length) * 100}%`,
            background: `linear-gradient(90deg, ${cfg.accentColor}, ${cfg.accentColor}80)`,
            boxShadow: `0 0 8px ${cfg.accentColor}`,
            transition: 'width 0.6s ease',
            borderRadius: 2,
          }} />
        </div>

        {steps.map((step, i) => {
          const done   = i < currentStep
          const active = i === currentStep
          return (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                background: done || active ? cfg.accentColor : '#1a2940',
                boxShadow: active ? `0 0 8px ${cfg.accentColor}` : 'none',
                transform: active ? 'scale(1.6)' : 'scale(1)',
                transition: 'all 0.3s',
              }} />
              <span style={{
                fontSize: 11,
                color: active ? cfg.accentColor : done ? '#2a3f58' : '#1a2f45',
                fontWeight: active ? 600 : 400,
                transition: 'color 0.3s',
              }}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Public component ─────────────────────────────────────────────────────────

export default function LabScene() {
  const { experimentType, setScreen, setAnimationComplete } = useExperimentStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [done, setDone] = useState(false)

  if (!experimentType) return null

  const cfg = EXPERIMENT_CONFIGS[experimentType]

  const handleComplete = () => {
    setDone(true)
    setAnimationComplete(true)
    setTimeout(() => setScreen('report'), 2000)
  }

  return (
    // Use position:absolute + inset:0 so the canvas always fills the full viewport
    // regardless of how the parent computes its height
    <div style={{ position: 'absolute', inset: 0, background: '#020810' }}>
      <Canvas
        shadows
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [10, 3, 10], fov: 55 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.3 }}
      >
        <InnerScene
          experimentType={experimentType}
          onStepChange={setCurrentStep}
          onComplete={handleComplete}
        />
      </Canvas>

      <StepHUD experimentType={experimentType} currentStep={currentStep} />

      {/* Top-right controls */}
      <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 8 }}>
        <button
          onClick={() => setScreen('plate')}
          style={{
            fontSize: 11, fontFamily: 'monospace',
            color: '#475569', background: 'rgba(5,10,20,0.75)',
            border: '1px solid #1a2940', borderRadius: 6,
            padding: '6px 14px', cursor: 'pointer',
            backdropFilter: 'blur(8px)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#334155' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#1a2940' }}
        >
          ← Edit Plate
        </button>
        {!done && (
          <button
            onClick={handleComplete}
            style={{
              fontSize: 11, fontFamily: 'monospace',
              color: '#475569', background: 'rgba(5,10,20,0.75)',
              border: '1px solid #1a2940', borderRadius: 6,
              padding: '6px 14px', cursor: 'pointer',
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#334155' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#1a2940' }}
          >
            Skip →
          </button>
        )}
      </div>

      {done && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${cfg.accentColor}0a`,
        }}>
          <div style={{
            fontSize: 52, fontWeight: 900, letterSpacing: '0.12em',
            color: cfg.accentColor,
            textShadow: `0 0 40px ${cfg.accentColor}, 0 0 80px ${cfg.accentColor}66`,
          }}>
            COMPLETE
          </div>
        </div>
      )}
    </div>
  )
}
