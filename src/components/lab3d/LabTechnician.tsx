/**
 * LabTechnician — animated humanoid that patrols a route around the lab,
 * or walks to an assigned workstation and performs a task animation.
 *
 * Click any scientist to open the task assignment panel.
 */

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import type { ScientistTask } from '../../store/labStore'

// ─── Route definitions ────────────────────────────────────────────────────────

interface Waypoint {
  x: number
  z: number
  facingY?: number
  pauseDuration?: number
}

const ROUTES: Record<string, Waypoint[]> = {
  A: [
    { x: -22, z:  9, facingY:  Math.PI,       pauseDuration: 4.5 },
    { x:   6, z:  9, facingY:  Math.PI,       pauseDuration: 3.0 },
    { x:  22, z:  9, facingY:  Math.PI,       pauseDuration: 3.5 },
    { x:  28, z:  9, facingY: -Math.PI / 2,   pauseDuration: 0.4 },
    { x:  28, z: -9, facingY:  Math.PI,       pauseDuration: 0.5 },
    { x:  10, z: -9, facingY:  Math.PI,       pauseDuration: 4.5 },
    { x: -10, z: -9, facingY:  Math.PI,       pauseDuration: 5.0 },
    { x: -28, z: -9, facingY:  Math.PI / 2,   pauseDuration: 0.4 },
    { x: -28, z:  9, facingY:  Math.PI,       pauseDuration: 0.5 },
  ],
  B: [
    { x:  28, z:  4, facingY: -Math.PI / 2,   pauseDuration: 6.0 },
    { x:  28, z: -5, facingY: -Math.PI / 2,   pauseDuration: 4.5 },
    { x:  28, z: -9, facingY:  Math.PI,       pauseDuration: 0.4 },
    { x:  14, z: -9, facingY:  Math.PI,       pauseDuration: 4.5 },
    { x:   0, z: -9, facingY:  Math.PI,       pauseDuration: 5.5 },
    { x:  28, z: -9, facingY: -Math.PI / 2,   pauseDuration: 0.4 },
    { x:  28, z:  9, facingY: -Math.PI / 2,   pauseDuration: 0.5 },
  ],
  C: [
    { x: -28, z:  4, facingY:  Math.PI / 2,   pauseDuration: 6.5 },
    { x: -28, z: -5, facingY:  Math.PI / 2,   pauseDuration: 4.5 },
    { x: -28, z: -9, facingY:  Math.PI,       pauseDuration: 0.4 },
    { x: -14, z: -9, facingY:  Math.PI,       pauseDuration: 5.0 },
    { x:   0, z: -9, facingY:  Math.PI,       pauseDuration: 5.0 },
    { x: -28, z: -9, facingY:  Math.PI / 2,   pauseDuration: 0.4 },
    { x: -28, z:  9, facingY:  Math.PI / 2,   pauseDuration: 0.5 },
  ],
}

const WALK_SPEED = 3.8

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  route: 'A' | 'B' | 'C'
  hairColor?: string
  skinColor?: string
  phaseOffset?: number
  female?: boolean
  task?: ScientistTask | null
  onSelect?: () => void
}

export default function LabTechnician({
  route,
  hairColor   = '#2a1a0a',
  skinColor   = '#e8c49a',
  phaseOffset = 0,
  female      = false,
  task        = null,
  onSelect,
}: Props) {

  const rootRef      = useRef<THREE.Group>(null)
  const torsoRef     = useRef<THREE.Group>(null)
  const headRef      = useRef<THREE.Group>(null)
  const leftLegRef   = useRef<THREE.Group>(null)
  const rightLegRef  = useRef<THREE.Group>(null)
  const leftArmRef   = useRef<THREE.Group>(null)
  const rightArmRef  = useRef<THREE.Group>(null)

  const isWalkingRef  = useRef(false)
  const walkTimeRef   = useRef(phaseOffset * 3)
  const workAnimTRef  = useRef(0)
  const animModeRef   = useRef<'patrol' | 'working'>('patrol')
  const masterTlRef   = useRef<gsap.core.Timeline | null>(null)

  // ── Walk-cycle / work animation ──────────────────────────────────────────
  useFrame((_, delta) => {
    // Pipetting / task animation
    if (animModeRef.current === 'working' && !isWalkingRef.current) {
      workAnimTRef.current += delta
      const t   = workAnimTRef.current
      const bob = Math.sin(t * 2.5)
      if (rightArmRef.current) rightArmRef.current.rotation.x = -0.35 + bob * 0.52
      if (leftArmRef.current)  leftArmRef.current.rotation.x  =  -0.08 + bob * 0.14
      if (torsoRef.current) {
        torsoRef.current.rotation.x = 0.17
        torsoRef.current.position.y = 1.0 + Math.abs(bob) * 0.015
      }
      if (headRef.current) headRef.current.rotation.x = -0.07
      return
    }

    // Patrol walk cycle
    if (!isWalkingRef.current) return

    walkTimeRef.current += delta
    const t     = walkTimeRef.current
    const swing = Math.sin(t * 6) * 0.48

    if (leftLegRef.current)  leftLegRef.current.rotation.x  =  swing
    if (rightLegRef.current) rightLegRef.current.rotation.x = -swing
    if (leftArmRef.current)  leftArmRef.current.rotation.x  = -swing * 0.55
    if (rightArmRef.current) rightArmRef.current.rotation.x =  swing * 0.55

    if (torsoRef.current) {
      torsoRef.current.position.y = 1.0 + Math.abs(Math.sin(t * 6)) * 0.04
    }
  })

  // ── Patrol / task timeline ───────────────────────────────────────────────
  useEffect(() => {
    const waypoints = ROUTES[route]
    if (!waypoints?.length) return

    masterTlRef.current?.kill()
    isWalkingRef.current = false

    const stopLegs = () => {
      isWalkingRef.current = false
      if (leftLegRef.current)  gsap.to(leftLegRef.current.rotation,  { x: 0, duration: 0.3, ease: 'power2.out' })
      if (rightLegRef.current) gsap.to(rightLegRef.current.rotation, { x: 0, duration: 0.3, ease: 'power2.out' })
      if (leftArmRef.current)  gsap.to(leftArmRef.current.rotation,  { x: 0, duration: 0.3, ease: 'power2.out' })
      if (rightArmRef.current) gsap.to(rightArmRef.current.rotation, { x: 0, duration: 0.3, ease: 'power2.out' })
      if (torsoRef.current)    gsap.to(torsoRef.current.position,    { y: 1.0, duration: 0.25 })
    }

    if (!task) {
      // ── Patrol mode ────────────────────────────────────────────────────
      animModeRef.current = 'patrol'

      // Reset working pose so scientist doesn't stay mid-lean after task clears
      if (torsoRef.current)    { torsoRef.current.rotation.x = 0 }
      if (headRef.current)     { headRef.current.rotation.x  = 0 }
      if (leftArmRef.current)  { leftArmRef.current.rotation.x  = 0 }
      if (rightArmRef.current) { rightArmRef.current.rotation.x = 0 }

      const first = waypoints[0]
      if (rootRef.current) {
        rootRef.current.position.set(first.x, -0.1, first.z)
        rootRef.current.rotation.y = first.facingY ?? Math.PI
      }

      const masterTl = gsap.timeline({ repeat: -1, delay: phaseOffset })
      masterTlRef.current = masterTl

      waypoints.forEach((wp, i) => {
        const prev = waypoints[(i - 1 + waypoints.length) % waypoints.length]
        const dx   = wp.x - prev.x
        const dz   = wp.z - prev.z
        const dist = Math.sqrt(dx * dx + dz * dz)
        const travelFacing = Math.atan2(dx, dz)
        const moveDuration = dist / WALK_SPEED

        masterTl.add(() => {
          if (rootRef.current)
            gsap.to(rootRef.current.rotation, { y: travelFacing, duration: 0.45, ease: 'power2.inOut' })
        })
        masterTl.to({}, { duration: 0.45 })

        masterTl.add(() => {
          isWalkingRef.current = true
          if (rootRef.current)
            gsap.to(rootRef.current.position, { x: wp.x, z: wp.z, duration: moveDuration, ease: 'none' })
        })
        masterTl.to({}, { duration: moveDuration })

        masterTl.add(stopLegs)
        masterTl.to({}, { duration: 0.35 })

        if (wp.facingY !== undefined) {
          masterTl.add(() => {
            if (rootRef.current)
              gsap.to(rootRef.current.rotation, { y: wp.facingY!, duration: 0.4, ease: 'power2.inOut' })
          })
          masterTl.to({}, { duration: 0.4 })
        }

        if (wp.pauseDuration && wp.pauseDuration > 0.6) {
          const half  = wp.pauseDuration * 0.5
          const third = wp.pauseDuration * 0.3
          const rest  = wp.pauseDuration - half - third

          masterTl.add(() => {
            if (torsoRef.current) gsap.to(torsoRef.current.rotation, { x: 0.18, duration: 0.5, ease: 'power2.inOut' })
            if (rightArmRef.current) gsap.to(rightArmRef.current.rotation, { x: -0.45, duration: 0.45 })
          })
          masterTl.to({}, { duration: half })

          masterTl.add(() => {
            if (headRef.current) gsap.to(headRef.current.rotation, { y: 0.25, duration: 0.45, ease: 'sine.inOut' })
          })
          masterTl.to({}, { duration: third })

          masterTl.add(() => {
            if (headRef.current) gsap.to(headRef.current.rotation, { y: -0.25, duration: 0.55, ease: 'sine.inOut' })
          })
          masterTl.to({}, { duration: rest })

          masterTl.add(() => {
            if (torsoRef.current)    gsap.to(torsoRef.current.rotation,    { x: 0, duration: 0.4 })
            if (rightArmRef.current) gsap.to(rightArmRef.current.rotation, { x: 0, duration: 0.4 })
            if (headRef.current)     gsap.to(headRef.current.rotation,     { y: 0, duration: 0.35 })
          })
          masterTl.to({}, { duration: 0.4 })
        } else if (wp.pauseDuration) {
          masterTl.to({}, { duration: wp.pauseDuration })
        }
      })

      return () => { masterTl.kill() }

    } else {
      // ── Task mode: walk to workstation, then work ──────────────────────
      const curX = rootRef.current?.position.x ?? 0
      const curZ = rootRef.current?.position.z ?? 0
      const dx   = task.workstationX - curX
      const dz   = task.workstationZ - curZ
      const dist = Math.sqrt(dx * dx + dz * dz)
      const travelFacing = Math.atan2(dx, dz)
      const moveDuration = Math.max(0.8, dist / WALK_SPEED)

      const taskTl = gsap.timeline()
      masterTlRef.current = taskTl

      if (rootRef.current) {
        taskTl.to(rootRef.current.rotation, { y: travelFacing, duration: 0.45, ease: 'power2.inOut' })
        taskTl.add(() => { isWalkingRef.current = true })
        taskTl.to(rootRef.current.position, {
          x: task.workstationX,
          z: task.workstationZ,
          duration: moveDuration,
          ease: 'none',
        })
        taskTl.add(stopLegs)
        taskTl.to({}, { duration: 0.4 })
        taskTl.to(rootRef.current.rotation, { y: task.facingY, duration: 0.4, ease: 'power2.inOut' })
        taskTl.add(() => { animModeRef.current = 'working' })
      }

      return () => { taskTl.kill() }
    }
  }, [route, phaseOffset, task])

  // ── Visual constants ──────────────────────────────────────────────────────
  const labCoatColor = '#c8d8e8'
  const trouserColor = '#2a3a4a'
  const gloveColor   = '#d8e8d0'

  const shoulderW = female ? 0.46 : 0.52
  const hipOffset = female ? 0.13 : 0.12

  return (
    <group
      ref={rootRef}
      onClick={(e) => { e.stopPropagation(); onSelect?.() }}
      onPointerOver={() => { document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'default' }}
    >

      {/* Legs */}
      <group ref={leftLegRef} position={[-hipOffset, 0.7, 0]}>
        <mesh position={[0, -0.35, 0]} castShadow>
          <boxGeometry args={[0.15, 0.7, 0.18]} />
          <meshStandardMaterial color={trouserColor} roughness={0.8} />
        </mesh>
      </group>
      <group ref={rightLegRef} position={[hipOffset, 0.7, 0]}>
        <mesh position={[0, -0.35, 0]} castShadow>
          <boxGeometry args={[0.15, 0.7, 0.18]} />
          <meshStandardMaterial color={trouserColor} roughness={0.8} />
        </mesh>
      </group>

      {/* Shoes */}
      <mesh position={[-hipOffset, 0.05, 0.06]}>
        <boxGeometry args={[0.14, 0.10, 0.28]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[hipOffset, 0.05, 0.06]}>
        <boxGeometry args={[0.14, 0.10, 0.28]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Torso — lab coat */}
      <group ref={torsoRef} position={[0, 1.0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[shoulderW, 0.75, 0.26]} />
          <meshStandardMaterial color={labCoatColor} roughness={0.9} />
        </mesh>

        {/* Buttons */}
        {[0.15, 0.0, -0.15].map((y, i) => (
          <mesh key={i} position={[0, y, 0.135]}>
            <sphereGeometry args={[0.025, 6, 6]} />
            <meshStandardMaterial color="#aab8c8" roughness={0.4} metalness={0.6} />
          </mesh>
        ))}

        {/* Breast pocket */}
        <mesh position={[-0.15, 0.2, 0.134]}>
          <boxGeometry args={[0.13, 0.11, 0.005]} />
          <meshStandardMaterial color="#b0c0d0" roughness={0.9} />
        </mesh>

        {/* Left arm */}
        <group ref={leftArmRef} position={[-(shoulderW / 2 + 0.07), 0.1, 0]}>
          <mesh position={[0, -0.22, 0]} castShadow>
            <boxGeometry args={[0.13, 0.50, 0.15]} />
            <meshStandardMaterial color={labCoatColor} roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.52, 0]}>
            <boxGeometry args={[0.11, 0.13, 0.10]} />
            <meshStandardMaterial color={gloveColor} roughness={0.7} />
          </mesh>
        </group>

        {/* Right arm */}
        <group ref={rightArmRef} position={[shoulderW / 2 + 0.07, 0.1, 0]}>
          <mesh position={[0, -0.22, 0]} castShadow>
            <boxGeometry args={[0.13, 0.50, 0.15]} />
            <meshStandardMaterial color={labCoatColor} roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.52, 0]}>
            <boxGeometry args={[0.11, 0.13, 0.10]} />
            <meshStandardMaterial color={gloveColor} roughness={0.7} />
          </mesh>
          {/* Clipboard */}
          <group position={[0.05, -0.68, 0.05]} rotation={[-0.15, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.28, 0.36, 0.018]} />
              <meshStandardMaterial color="#e8dcc8" roughness={0.9} />
            </mesh>
            {[0.10, 0.03, -0.04, -0.11].map((ly, j) => (
              <mesh key={j} position={[0, ly, 0.012]}>
                <boxGeometry args={[0.20, 0.010, 0.001]} />
                <meshStandardMaterial color="#8898a8" />
              </mesh>
            ))}
            <mesh position={[0, 0.17, 0.014]}>
              <boxGeometry args={[0.10, 0.045, 0.012]} />
              <meshStandardMaterial color="#6a7888" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        </group>

        {/* Neck */}
        <mesh position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.075, 0.085, 0.18, 8]} />
          <meshStandardMaterial color={skinColor} roughness={0.8} />
        </mesh>

        {/* Head */}
        <group ref={headRef} position={[0, 0.62, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.30, 0.33, 0.27]} />
            <meshStandardMaterial color={skinColor} roughness={0.8} />
          </mesh>

          {/* Hair */}
          <mesh position={[0, 0.15, -0.01]}>
            <boxGeometry args={[0.32, 0.11, 0.29]} />
            <meshStandardMaterial color={hairColor} roughness={0.85} />
          </mesh>

          {female && (
            <>
              <mesh position={[-0.17, -0.02, -0.02]}>
                <boxGeometry args={[0.06, 0.30, 0.26]} />
                <meshStandardMaterial color={hairColor} roughness={0.85} />
              </mesh>
              <mesh position={[0.17, -0.02, -0.02]}>
                <boxGeometry args={[0.06, 0.30, 0.26]} />
                <meshStandardMaterial color={hairColor} roughness={0.85} />
              </mesh>
              <mesh position={[0, -0.04, -0.17]}>
                <boxGeometry args={[0.30, 0.32, 0.06]} />
                <meshStandardMaterial color={hairColor} roughness={0.85} />
              </mesh>
              <mesh position={[0, -0.10, -0.22]}>
                <cylinderGeometry args={[0.055, 0.045, 0.22, 8]} />
                <meshStandardMaterial color={hairColor} roughness={0.85} />
              </mesh>
              <mesh position={[0, -0.26, -0.26]} rotation={[0.4, 0, 0]}>
                <cylinderGeometry args={[0.035, 0.015, 0.18, 8]} />
                <meshStandardMaterial color={hairColor} roughness={0.85} />
              </mesh>
              <mesh position={[0, -0.10, -0.22]}>
                <torusGeometry args={[0.058, 0.015, 6, 10]} />
                <meshStandardMaterial color="#1a0a0a" roughness={0.6} />
              </mesh>
              <mesh position={[-0.075, 0.072, 0.142]}>
                <boxGeometry args={[0.065, 0.012, 0.003]} />
                <meshStandardMaterial color="#0d1520" />
              </mesh>
              <mesh position={[0.075, 0.072, 0.142]}>
                <boxGeometry args={[0.065, 0.012, 0.003]} />
                <meshStandardMaterial color="#0d1520" />
              </mesh>
            </>
          )}

          {/* Eyes */}
          <mesh position={[-0.075, 0.04, 0.143]}>
            <boxGeometry args={[0.058, 0.038, 0.005]} />
            <meshStandardMaterial color="#1a2a3a" />
          </mesh>
          <mesh position={[0.075, 0.04, 0.143]}>
            <boxGeometry args={[0.058, 0.038, 0.005]} />
            <meshStandardMaterial color="#1a2a3a" />
          </mesh>
        </group>
      </group>

      {/* Task badge — floats above head when a task is assigned */}
      {task && (
        <Html center position={[0, 2.55, 0]} distanceFactor={14} zIndexRange={[0, 0]}>
          <div style={{
            background: `${task.accentColor}18`,
            border: `1px solid ${task.accentColor}90`,
            borderRadius: 6,
            padding: '3px 9px',
            whiteSpace: 'nowrap',
            fontSize: 10,
            fontFamily: 'monospace',
            color: task.accentColor,
            backdropFilter: 'blur(8px)',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            userSelect: 'none',
          }}>
            <span style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: task.accentColor,
              display: 'inline-block',
              boxShadow: `0 0 5px ${task.accentColor}`,
              flexShrink: 0,
            }} />
            {task.label}
          </div>
        </Html>
      )}

    </group>
  )
}
