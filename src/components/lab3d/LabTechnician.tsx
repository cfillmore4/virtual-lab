/**
 * LabTechnician — animated humanoid that patrols a route around the lab.
 *
 * Each instance is fully self-contained:
 *   - Manages its own GSAP movement timeline (waypoints through world space)
 *   - useFrame drives the walk-cycle leg/arm swing while moving
 *   - Stops, turns, and does an "inspect" animation at each waypoint
 *   - No workbench embedded — that lives in LabEnvironment
 *
 * Route "A"  patrols the front robot aisle then swings through the instrument shelf
 * Route "B"  patrols the right side bench and instrument back wall
 * Route "C"  patrols the left side bench and instrument back wall
 */

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'

// ─── Route definitions ────────────────────────────────────────────────────────

interface Waypoint {
  x: number
  z: number
  /** Explicit rotation.y when facing the work area (auto-calculated for travel) */
  facingY?: number
  /** Seconds to pause and do work animation */
  pauseDuration?: number
}

// All positions use world XZ. Y is baked into the component (-0.1).
// Aisles: front Z≈9, back Z≈-9, sides X≈±28.
// Main robot bench occupies X ∈ [-27, 27], Z ∈ [-6, 6].
// All segments below are axis-aligned (pure X or pure Z moves), so no
// diagonal ever cuts through that box.
// Safe corridors:
//   Front aisle   Z = +9    (outside bench front, Z > 6)
//   Back aisle    Z = -9    (outside bench rear,  Z < -6)
//   Right passage X = +28   (outside bench right, X > 27)
//   Left passage  X = -28   (outside bench left,  X < -27)
const ROUTES: Record<string, Waypoint[]> = {
  // Route A — full circuit: front aisle → right passage → back shelf → left passage
  A: [
    { x: -22, z:  9, facingY:  Math.PI,       pauseDuration: 4.5 }, // robot A
    { x:   6, z:  9, facingY:  Math.PI,       pauseDuration: 3.0 }, // robot B
    { x:  22, z:  9, facingY:  Math.PI,       pauseDuration: 3.5 }, // robot C
    { x:  28, z:  9, facingY: -Math.PI / 2,   pauseDuration: 0.4 }, // corner — turn right
    { x:  28, z: -9, facingY:  Math.PI,       pauseDuration: 0.5 }, // entered back aisle
    { x:  10, z: -9, facingY:  Math.PI,       pauseDuration: 4.5 }, // instrument shelf right
    { x: -10, z: -9, facingY:  Math.PI,       pauseDuration: 5.0 }, // instrument shelf left
    { x: -28, z: -9, facingY:  Math.PI / 2,   pauseDuration: 0.4 }, // corner — turn left
    { x: -28, z:  9, facingY:  Math.PI,       pauseDuration: 0.5 }, // front aisle re-entry
  ],

  // Route B — right bench + back shelf (stays on right half, never crosses bench)
  B: [
    { x:  28, z:  4, facingY: -Math.PI / 2,   pauseDuration: 6.0 }, // right side bench top
    { x:  28, z: -5, facingY: -Math.PI / 2,   pauseDuration: 4.5 }, // right side bench work
    { x:  28, z: -9, facingY:  Math.PI,       pauseDuration: 0.4 }, // turn into back aisle
    { x:  14, z: -9, facingY:  Math.PI,       pauseDuration: 4.5 }, // instrument shelf
    { x:   0, z: -9, facingY:  Math.PI,       pauseDuration: 5.5 }, // center shelf
    { x:  28, z: -9, facingY: -Math.PI / 2,   pauseDuration: 0.4 }, // back to right side
    { x:  28, z:  9, facingY: -Math.PI / 2,   pauseDuration: 0.5 }, // right side front
  ],

  // Route C — left bench + back shelf (mirror of B)
  C: [
    { x: -28, z:  4, facingY:  Math.PI / 2,   pauseDuration: 6.5 }, // left side bench top
    { x: -28, z: -5, facingY:  Math.PI / 2,   pauseDuration: 4.5 }, // left side bench work
    { x: -28, z: -9, facingY:  Math.PI,       pauseDuration: 0.4 }, // turn into back aisle
    { x: -14, z: -9, facingY:  Math.PI,       pauseDuration: 5.0 }, // instrument shelf
    { x:   0, z: -9, facingY:  Math.PI,       pauseDuration: 5.0 }, // center shelf
    { x: -28, z: -9, facingY:  Math.PI / 2,   pauseDuration: 0.4 }, // back to left side
    { x: -28, z:  9, facingY:  Math.PI / 2,   pauseDuration: 0.5 }, // left side front
  ],
}

const WALK_SPEED = 3.8 // world units per second

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  route: 'A' | 'B' | 'C'
  hairColor?: string
  skinColor?: string
  phaseOffset?: number
  /** Female silhouette: longer hair, adjusted proportions */
  female?: boolean
}

export default function LabTechnician({
  route,
  hairColor   = '#2a1a0a',
  skinColor   = '#e8c49a',
  phaseOffset = 0,
  female      = false,
}: Props) {

  const rootRef      = useRef<THREE.Group>(null)
  const torsoRef     = useRef<THREE.Group>(null)
  const headRef      = useRef<THREE.Group>(null)
  const leftLegRef   = useRef<THREE.Group>(null)
  const rightLegRef  = useRef<THREE.Group>(null)
  const leftArmRef   = useRef<THREE.Group>(null)
  const rightArmRef  = useRef<THREE.Group>(null)

  const isWalkingRef = useRef(false)
  const walkTimeRef  = useRef(phaseOffset * 3) // staggered so techs start mid-cycle

  // ── Walk-cycle (useFrame) ────────────────────────────────────────────────
  useFrame((_, delta) => {
    if (!isWalkingRef.current) return

    walkTimeRef.current += delta

    const t     = walkTimeRef.current
    const swing = Math.sin(t * 6) * 0.48

    if (leftLegRef.current)  leftLegRef.current.rotation.x  =  swing
    if (rightLegRef.current) rightLegRef.current.rotation.x = -swing
    if (leftArmRef.current)  leftArmRef.current.rotation.x  = -swing * 0.55
    if (rightArmRef.current) rightArmRef.current.rotation.x =  swing * 0.55

    // Subtle body bob
    if (torsoRef.current) {
      torsoRef.current.position.y = 1.0 + Math.abs(Math.sin(t * 6)) * 0.04
    }
  })

  // ── Path timeline (GSAP) ─────────────────────────────────────────────────
  useEffect(() => {
    const waypoints = ROUTES[route]
    if (!waypoints?.length) return

    // Teleport to starting waypoint before first loop
    const first = waypoints[0]
    if (rootRef.current) {
      rootRef.current.position.set(first.x, -0.1, first.z)
      rootRef.current.rotation.y = first.facingY ?? Math.PI
    }

    const stopLegs = () => {
      isWalkingRef.current = false
      if (leftLegRef.current)  gsap.to(leftLegRef.current.rotation,  { x: 0, duration: 0.3, ease: 'power2.out' })
      if (rightLegRef.current) gsap.to(rightLegRef.current.rotation, { x: 0, duration: 0.3, ease: 'power2.out' })
      if (leftArmRef.current)  gsap.to(leftArmRef.current.rotation,  { x: 0, duration: 0.3, ease: 'power2.out' })
      if (rightArmRef.current) gsap.to(rightArmRef.current.rotation, { x: 0, duration: 0.3, ease: 'power2.out' })
      if (torsoRef.current)    gsap.to(torsoRef.current.position,    { y: 1.0, duration: 0.25 })
    }

    const masterTl = gsap.timeline({ repeat: -1, delay: phaseOffset })

    waypoints.forEach((wp, i) => {
      const prev = waypoints[(i - 1 + waypoints.length) % waypoints.length]
      const dx   = wp.x - prev.x
      const dz   = wp.z - prev.z
      const dist = Math.sqrt(dx * dx + dz * dz)
      const travelFacing = Math.atan2(dx, dz)
      const moveDuration = dist / WALK_SPEED

      // 1. Turn to face travel direction
      masterTl.add(() => {
        if (rootRef.current)
          gsap.to(rootRef.current.rotation, { y: travelFacing, duration: 0.45, ease: 'power2.inOut' })
      })
      masterTl.to({}, { duration: 0.45 })

      // 2. Start walking + animate position
      masterTl.add(() => {
        isWalkingRef.current = true
        if (rootRef.current)
          gsap.to(rootRef.current.position, { x: wp.x, z: wp.z, duration: moveDuration, ease: 'none' })
      })
      masterTl.to({}, { duration: moveDuration })

      // 3. Arrive — stop legs, settle
      masterTl.add(stopLegs)
      masterTl.to({}, { duration: 0.35 })

      // 4. Turn to face work direction (if different from travel)
      if (wp.facingY !== undefined) {
        masterTl.add(() => {
          if (rootRef.current)
            gsap.to(rootRef.current.rotation, { y: wp.facingY!, duration: 0.4, ease: 'power2.inOut' })
        })
        masterTl.to({}, { duration: 0.4 })
      }

      // 5. Work animation at waypoint
      if (wp.pauseDuration && wp.pauseDuration > 0.6) {
        const half  = wp.pauseDuration * 0.5
        const third = wp.pauseDuration * 0.3
        const rest  = wp.pauseDuration - half - third

        // Lean in and inspect
        masterTl.add(() => {
          if (torsoRef.current) gsap.to(torsoRef.current.rotation, { x: 0.18, duration: 0.5, ease: 'power2.inOut' })
          if (rightArmRef.current) gsap.to(rightArmRef.current.rotation, { x: -0.45, duration: 0.45 })
        })
        masterTl.to({}, { duration: half })

        // Look left
        masterTl.add(() => {
          if (headRef.current) gsap.to(headRef.current.rotation, { y: 0.25, duration: 0.45, ease: 'sine.inOut' })
        })
        masterTl.to({}, { duration: third })

        // Look right
        masterTl.add(() => {
          if (headRef.current) gsap.to(headRef.current.rotation, { y: -0.25, duration: 0.55, ease: 'sine.inOut' })
        })
        masterTl.to({}, { duration: rest })

        // Straighten up
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
  }, [route, phaseOffset])

  // ── Visual constants ──────────────────────────────────────────────────────
  const labCoatColor = '#c8d8e8'
  const trouserColor = '#2a3a4a'
  const gloveColor   = '#d8e8d0'

  // Female proportions: slightly narrower shoulders, slightly wider hips
  const shoulderW = female ? 0.46 : 0.52
  const hipOffset = female ? 0.13 : 0.12

  return (
    <group ref={rootRef}>

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
          {/* Gloved hand */}
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
          {/* Gloved hand */}
          <mesh position={[0, -0.52, 0]}>
            <boxGeometry args={[0.11, 0.13, 0.10]} />
            <meshStandardMaterial color={gloveColor} roughness={0.7} />
          </mesh>
          {/* Clipboard — always carried in right hand */}
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
          {/* Slightly softer face shape for female */}
          <mesh castShadow>
            <boxGeometry args={[0.30, 0.33, 0.27]} />
            <meshStandardMaterial color={skinColor} roughness={0.8} />
          </mesh>

          {/* ── Hair ── */}
          {/* Top cap */}
          <mesh position={[0, 0.15, -0.01]}>
            <boxGeometry args={[0.32, 0.11, 0.29]} />
            <meshStandardMaterial color={hairColor} roughness={0.85} />
          </mesh>

          {female && (
            <>
              {/* Side panels — hair falling past ears */}
              <mesh position={[-0.17, -0.02, -0.02]}>
                <boxGeometry args={[0.06, 0.30, 0.26]} />
                <meshStandardMaterial color={hairColor} roughness={0.85} />
              </mesh>
              <mesh position={[0.17, -0.02, -0.02]}>
                <boxGeometry args={[0.06, 0.30, 0.26]} />
                <meshStandardMaterial color={hairColor} roughness={0.85} />
              </mesh>
              {/* Back hair panel — shoulder-length */}
              <mesh position={[0, -0.04, -0.17]}>
                <boxGeometry args={[0.30, 0.32, 0.06]} />
                <meshStandardMaterial color={hairColor} roughness={0.85} />
              </mesh>
              {/* Ponytail base */}
              <mesh position={[0, -0.10, -0.22]}>
                <cylinderGeometry args={[0.055, 0.045, 0.22, 8]} />
                <meshStandardMaterial color={hairColor} roughness={0.85} />
              </mesh>
              {/* Ponytail tip — slight droop */}
              <mesh position={[0, -0.26, -0.26]} rotation={[0.4, 0, 0]}>
                <cylinderGeometry args={[0.035, 0.015, 0.18, 8]} />
                <meshStandardMaterial color={hairColor} roughness={0.85} />
              </mesh>
              {/* Hair tie */}
              <mesh position={[0, -0.10, -0.22]}>
                <torusGeometry args={[0.058, 0.015, 6, 10]} />
                <meshStandardMaterial color="#1a0a0a" roughness={0.6} />
              </mesh>
              {/* Eyelashes — thin dark bar above each eye */}
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

    </group>
  )
}
