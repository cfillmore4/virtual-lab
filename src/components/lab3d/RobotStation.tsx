/**
 * RobotStation — one Hamilton STAR robot + its well plate + animation logic.
 *
 * Handles two states:
 *   idle    — gentle bridge drift, dim accent pulse, tips hidden
 *   running — full experiment GSAP timeline (column sweep + reagent + library prep)
 *
 * The parent scene just passes `experiment` and listens for `onComplete`.
 */

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'

import HamiltonRobot from './HamiltonRobot'
import type { HamiltonRefs } from './HamiltonRobot'
import { EXPERIMENT_CONFIGS } from '../../types/experiment'
import type { ExperimentRequest, RobotId } from '../../store/labStore'

// ─── Animated Well Plate ──────────────────────────────────────────────────────

function AnimatedWellPlate({
  activeColRef,
  processedColsRef,
  accentColor,
}: {
  activeColRef: React.RefObject<number>
  processedColsRef: React.RefObject<Set<number>>
  accentColor: string
}) {
  const matGrid = useRef<(THREE.MeshStandardMaterial | null)[][]>(
    Array.from({ length: 12 }, () => new Array(8).fill(null))
  )
  const pulseT     = useRef(0)
  const dropletT   = useRef(0)
  const colLightRef = useRef<THREE.PointLight>(null)
  const dropletRefs = useRef<(THREE.Mesh | null)[]>(new Array(8).fill(null))

  useFrame((_, delta) => {
    pulseT.current   += delta * 5
    dropletT.current += delta * 9
    const pulse = 0.65 + Math.sin(pulseT.current) * 0.35

    const active    = activeColRef.current ?? -1
    const processed = processedColsRef.current ?? new Set<number>()

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

    if (colLightRef.current) {
      const targetIntensity = active >= 0 ? 5.0 : 0
      colLightRef.current.intensity = THREE.MathUtils.lerp(colLightRef.current.intensity, targetIntensity, 0.18)
      if (active >= 0) {
        const targetX = (active - 5.5) * 0.38
        colLightRef.current.position.x = THREE.MathUtils.lerp(colLightRef.current.position.x, targetX, 0.25)
      }
    }

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
      <mesh castShadow receiveShadow>
        <boxGeometry args={[4.8, 0.12, 3.2]} />
        <meshStandardMaterial color="#c4d0dc" metalness={0.1} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.07, 0]}>
        <boxGeometry args={[4.82, 0.02, 3.22]} />
        <meshStandardMaterial color="#8090a0" metalness={0.4} roughness={0.5} />
      </mesh>
      <pointLight ref={colLightRef} position={[0, 0.9, 0]} color={accentColor} intensity={0} distance={2.2} decay={2} />

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
            <meshStandardMaterial color="#0a1828" transparent opacity={0.5} />
          </mesh>
        ))
      )}

      {Array.from({ length: 8 }, (_, r) => (
        <mesh
          key={`drop-${r}`}
          ref={(m: THREE.Mesh | null) => { dropletRefs.current[r] = m }}
          visible={false}
          position={[0, 0.3, (r - 3.5) * 0.38]}
        >
          <sphereGeometry args={[0.03, 7, 7]} />
          <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3.5} transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Robot Station ────────────────────────────────────────────────────────────

interface RobotStationProps {
  robotId: RobotId
  experiment: ExperimentRequest | null
  onComplete: (robotId: RobotId) => void
  /** Phase offset for idle animation so robots don't drift in sync */
  idlePhase?: number
}

export default function RobotStation({
  robotId,
  experiment,
  onComplete,
  idlePhase = 0,
}: RobotStationProps) {
  const hamiltonRef       = useRef<HamiltonRefs>(null)
  const activeColRef      = useRef<number>(-1)
  const processedColsRef  = useRef<Set<number>>(new Set())

  const accentColor = experiment
    ? EXPERIMENT_CONFIGS[experiment.type].accentColor
    : '#2a4a6a' // dim standby blue

  useEffect(() => {
    const h = hamiltonRef.current
    if (!h) return

    const { bridgeRef, carriageRef, headRef, tipsRef, headLightRef } = h

    // Reset plate state
    activeColRef.current = -1
    processedColsRef.current = new Set()

    let tl: gsap.core.Timeline

    if (!experiment) {
      // ── IDLE / STANDBY ────────────────────────────────────────────────────
      if (tipsRef.current) tipsRef.current.visible = false

      // Park in resting position
      if (bridgeRef.current)  gsap.set(bridgeRef.current.position, { z: 2.5 })
      if (carriageRef.current) gsap.set(carriageRef.current.position, { x: 0 })
      if (headRef.current)    gsap.set(headRef.current.position, { y: 1.5 })
      if (headLightRef.current) gsap.set(headLightRef.current, { emissiveIntensity: 0.15 })

      tl = gsap.timeline({ repeat: -1, delay: idlePhase })

      // Bridge breathes gently
      if (bridgeRef.current) {
        tl.to(bridgeRef.current.position, { z: 3.0, duration: 3.5, ease: 'sine.inOut' })
        tl.to(bridgeRef.current.position, { z: 2.0, duration: 3.5, ease: 'sine.inOut' })
      }
      // Head light pulses dimly
      if (headLightRef.current) {
        tl.to(headLightRef.current, { emissiveIntensity: 0.08, duration: 2.5, ease: 'sine.inOut' }, 0)
        tl.to(headLightRef.current, { emissiveIntensity: 0.25, duration: 2.5, ease: 'sine.inOut' }, 2.5)
      }
    } else {
      // ── EXPERIMENT RUNNING ────────────────────────────────────────────────
      const cfg = EXPERIMENT_CONFIGS[experiment.type]
      const accent = cfg.accentColor

      tl = gsap.timeline({
        onComplete: () => {
          activeColRef.current = -1
          onComplete(robotId)
        },
      })

      const bridge   = bridgeRef.current
      const carriage = carriageRef.current
      const head     = headRef.current
      const tips     = tipsRef.current
      const headMat  = headLightRef.current

      // col X positions in local space (matches AnimatedWellPlate geometry)
      const plateColX = Array.from({ length: 12 }, (_, i) => parseFloat(((i - 5.5) * 0.38).toFixed(3)))

      // ── Step 0: Load tips ────────────────────────────────────────────────
      if (bridge)   tl.to(bridge.position,   { z: 3.2, duration: 1.4, ease: 'power3.inOut' })
      if (carriage) tl.to(carriage.position, { x: -4.5, duration: 1.2, ease: 'power3.inOut' }, '<')
      if (head) {
        tl.to(head.position, { y: 0.15, duration: 0.9, ease: 'power2.in' })
        tl.to({}, { duration: 0.3 })
        tl.to(head.position, { y: 1.5, duration: 0.9, ease: 'power2.out' })
      }
      tl.add(() => { if (tips) tips.visible = true })
      if (headMat) tl.to(headMat, { emissiveIntensity: 1.0, duration: 0.4 }, '<')

      // ── Step 1: Sample transfer — left → right ───────────────────────────
      if (bridge)   tl.to(bridge.position,   { z: -0.5, duration: 1.2, ease: 'power3.inOut' })
      if (carriage) tl.to(carriage.position, { x: plateColX[0], duration: 0.7, ease: 'power2.out' })

      plateColX.forEach((cx, i) => {
        if (carriage) tl.to(carriage.position, { x: cx, duration: 0.32, ease: 'none' })
        tl.add(() => { activeColRef.current = i })
        if (head) {
          tl.to(head.position, { y: 0.5, duration: 0.16, ease: 'power2.in' })
          tl.to({}, { duration: 0.08 })
          tl.to(head.position, { y: 1.5, duration: 0.16, ease: 'power2.out' })
        }
        tl.add(() => { processedColsRef.current.add(i); activeColRef.current = -1 })
      })

      // ── Step 2: Reagent addition — right → left ──────────────────────────
      if (bridge)   tl.to(bridge.position,   { z: 3.2, duration: 0.9, ease: 'power3.inOut' })
      if (carriage) tl.to(carriage.position, { x: 3.5, duration: 0.8, ease: 'power3.inOut' }, '<')
      if (head) {
        tl.to(head.position, { y: 0.3, duration: 0.5, ease: 'power2.in' })
        tl.to({}, { duration: 0.3 })
        tl.to(head.position, { y: 1.5, duration: 0.5, ease: 'power2.out' })
      }

      if (bridge)   tl.to(bridge.position,   { z: -0.5, duration: 0.9, ease: 'power3.inOut' })
      if (carriage) tl.to(carriage.position, { x: plateColX[11], duration: 0.6, ease: 'power2.out' })

      plateColX.slice().reverse().forEach((cx, revI) => {
        const colI = 11 - revI
        if (carriage) tl.to(carriage.position, { x: cx, duration: 0.30, ease: 'none' })
        tl.add(() => { activeColRef.current = colI })
        if (head) {
          tl.to(head.position, { y: 0.5, duration: 0.14, ease: 'power2.in' })
          tl.to({}, { duration: 0.07 })
          tl.to(head.position, { y: 1.5, duration: 0.14, ease: 'power2.out' })
        }
        tl.add(() => { activeColRef.current = -1 })
      })

      // ── Step 3: Library prep — partial column sweep ──────────────────────
      const cleanupCols = [plateColX[0], plateColX[2], plateColX[5], plateColX[8], plateColX[10], plateColX[11]]
      if (bridge) tl.to(bridge.position, { z: 1.0, duration: 1.0, ease: 'power3.inOut' })
      cleanupCols.forEach((cx) => {
        if (carriage) tl.to(carriage.position, { x: cx, duration: 0.38, ease: 'power1.inOut' })
        if (head) {
          tl.to(head.position, { y: 0.45, duration: 0.18 })
          tl.to(head.position, { y: 1.5,  duration: 0.18 })
        }
      })

      // ── Step 4: Park & signal complete ──────────────────────────────────
      if (bridge)   tl.to(bridge.position,   { z: -3.5, duration: 1.2, ease: 'power2.inOut' })
      if (carriage) tl.to(carriage.position, { x: 0,    duration: 0.9, ease: 'power2.inOut' }, '<')
      if (head)     tl.to(head.position,     { y: 1.5,  duration: 0.5 }, '<')
      tl.to({}, { duration: 1.0 }) // brief hold so wells stay lit before handoff
      if (headMat) tl.to(headMat, { emissiveIntensity: 2.5, duration: 0.8 }, '<') // flash on completion

      void accent // suppress unused warning
    }

    return () => { tl.kill() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experiment?.id])

  // Status chip label above the robot
  const statusLabel = experiment
    ? `RUNNING · ${EXPERIMENT_CONFIGS[experiment.type].shortName}`
    : 'STANDBY'
  const chipColor = experiment
    ? EXPERIMENT_CONFIGS[experiment.type].accentColor
    : '#3a5a7a'

  return (
    <group>
      <HamiltonRobot ref={hamiltonRef} accentColor={accentColor} />
      <AnimatedWellPlate
        activeColRef={activeColRef}
        processedColsRef={processedColsRef}
        accentColor={accentColor}
      />

      {/* Floating status chip above robot */}
      <Html position={[0, 5.2, 0]} center distanceFactor={18} occlude={false}>
        <div style={{
          fontFamily: 'monospace',
          fontSize: 11,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: chipColor,
          background: 'rgba(4,9,18,0.82)',
          border: `1px solid ${chipColor}55`,
          borderRadius: 6,
          padding: '4px 10px',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          boxShadow: `0 0 12px ${chipColor}33`,
          backdropFilter: 'blur(8px)',
        }}>
          <span style={{
            display: 'inline-block',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: chipColor,
            boxShadow: `0 0 6px ${chipColor}`,
            marginRight: 6,
            verticalAlign: 'middle',
          }} />
          HAMILTON {robotId} · {statusLabel}
        </div>
      </Html>
    </group>
  )
}
