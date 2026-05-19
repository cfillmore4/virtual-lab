/**
 * HamiltonRobot — Hamilton STAR liquid handler (v2).
 *
 * Major visual improvements:
 *   - Tall upright posts that tower above the bridge (more imposing frame)
 *   - Orange caps on upright tops + full-height orange accent strips on front faces
 *   - Top cross-beam connecting post tops (structural brand look)
 *   - Thicker, double-stripe Hamilton orange on bridge
 *   - Larger, more prominent carriage + Z-column with orange accent LED
 *   - accentColor status LED bar on front edge of work deck (shows experiment color)
 *   - Colored reagent troughs (blue/teal/purple liquid)
 *   - Bigger, more visible blue tip array in tip box
 *   - Longer stainless needles for visibility
 */

import { forwardRef, useImperativeHandle, useRef } from 'react'
import * as THREE from 'three'

export interface HamiltonRefs {
  bridgeRef:    React.RefObject<THREE.Group | null>
  carriageRef:  React.RefObject<THREE.Group | null>
  headRef:      React.RefObject<THREE.Group | null>
  tipsRef:      React.RefObject<THREE.Group | null>
  headLightRef: React.RefObject<THREE.MeshStandardMaterial | null>
}

interface Props {
  accentColor?: string
}

const CHANNEL_COUNT  = 8
const HAMILTON_ORANGE = '#ff5500'
const UPRIGHT_H      = 5.8   // uprights reach well above bridge
const UPRIGHT_CY     = UPRIGHT_H / 2  // 2.9

const HamiltonRobot = forwardRef<HamiltonRefs, Props>(({ accentColor = '#ff5500' }, ref) => {
  const bridgeRef    = useRef<THREE.Group>(null)
  const carriageRef  = useRef<THREE.Group>(null)
  const headRef      = useRef<THREE.Group>(null)
  const tipsRef      = useRef<THREE.Group>(null)
  const headLightRef = useRef<THREE.MeshStandardMaterial>(null)

  useImperativeHandle(ref, () => ({
    bridgeRef, carriageRef, headRef, tipsRef, headLightRef,
  }))

  return (
    <group position={[0, 0, 0]}>

      {/* ── Work Deck ──────────────────────────────────────────────────────── */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[12, 0.14, 8]} />
        <meshStandardMaterial color="#1c2a38" metalness={0.35} roughness={0.55} />
      </mesh>

      {/* Lane guide markings */}
      {[-3, -1, 1, 3].map((x) => (
        <mesh key={x} position={[x, 0.08, 0]}>
          <boxGeometry args={[0.025, 0.005, 7.8]} />
          <meshStandardMaterial color="#2a3a4a" />
        </mesh>
      ))}

      {/* Column position markers along back edge */}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={`cm-${i}`} position={[(i - 5.5) * 0.88, 0.074, -3.6]}>
          <cylinderGeometry args={[0.07, 0.07, 0.008, 6]} />
          <meshStandardMaterial color="#3a5068" />
        </mesh>
      ))}

      {/* STATUS LED rail — front edge — accentColor (standby = dim blue) */}
      <mesh position={[0, 0.075, 4.06]}>
        <boxGeometry args={[11.8, 0.02, 0.065]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={2.2}
        />
      </mesh>

      {/* Orange brand strip — front face of deck */}
      <mesh position={[0, -0.025, 4.08]}>
        <boxGeometry args={[12, 0.10, 0.03]} />
        <meshStandardMaterial color={HAMILTON_ORANGE} emissive={HAMILTON_ORANGE} emissiveIntensity={1.4} />
      </mesh>

      {/* ── Frame — Left upright ─────────────────────────────────────────── */}
      <mesh position={[-6.2, UPRIGHT_CY, 0]} castShadow>
        <boxGeometry args={[0.32, UPRIGHT_H, 0.32]} />
        <meshStandardMaterial color="#dde8f2" metalness={0.55} roughness={0.25} />
      </mesh>
      {/* Corner detail */}
      <mesh position={[-6.2, UPRIGHT_CY, 0]}>
        <boxGeometry args={[0.10, UPRIGHT_H - 0.02, 0.10]} />
        <meshStandardMaterial color="#c8d4e0" metalness={0.8} roughness={0.15} />
      </mesh>
      {/* Orange cap at top */}
      <mesh position={[-6.2, UPRIGHT_H - 0.11, 0]}>
        <boxGeometry args={[0.38, 0.24, 0.38]} />
        <meshStandardMaterial color={HAMILTON_ORANGE} emissive={HAMILTON_ORANGE} emissiveIntensity={1.0} />
      </mesh>
      {/* Orange front-face accent strip (above bridge, very visible) */}
      <mesh position={[-6.2, 4.55, 0.168]}>
        <boxGeometry args={[0.28, 2.6, 0.008]} />
        <meshStandardMaterial color={HAMILTON_ORANGE} emissive={HAMILTON_ORANGE} emissiveIntensity={0.8} />
      </mesh>
      {/* Hamilton logo plate */}
      <mesh position={[-6.2, 0.82, 0.175]}>
        <boxGeometry args={[0.22, 0.44, 0.008]} />
        <meshStandardMaterial color="#f0f4f8" roughness={0.6} />
      </mesh>
      <mesh position={[-6.2, 0.84, 0.18]}>
        <boxGeometry args={[0.16, 0.07, 0.002]} />
        <meshStandardMaterial color={HAMILTON_ORANGE} emissive={HAMILTON_ORANGE} emissiveIntensity={1.5} />
      </mesh>

      {/* ── Frame — Right upright ────────────────────────────────────────── */}
      <mesh position={[6.2, UPRIGHT_CY, 0]} castShadow>
        <boxGeometry args={[0.32, UPRIGHT_H, 0.32]} />
        <meshStandardMaterial color="#dde8f2" metalness={0.55} roughness={0.25} />
      </mesh>
      <mesh position={[6.2, UPRIGHT_CY, 0]}>
        <boxGeometry args={[0.10, UPRIGHT_H - 0.02, 0.10]} />
        <meshStandardMaterial color="#c8d4e0" metalness={0.8} roughness={0.15} />
      </mesh>
      {/* Orange cap */}
      <mesh position={[6.2, UPRIGHT_H - 0.11, 0]}>
        <boxGeometry args={[0.38, 0.24, 0.38]} />
        <meshStandardMaterial color={HAMILTON_ORANGE} emissive={HAMILTON_ORANGE} emissiveIntensity={1.0} />
      </mesh>
      {/* Orange front accent */}
      <mesh position={[6.2, 4.55, 0.168]}>
        <boxGeometry args={[0.28, 2.6, 0.008]} />
        <meshStandardMaterial color={HAMILTON_ORANGE} emissive={HAMILTON_ORANGE} emissiveIntensity={0.8} />
      </mesh>

      {/* ── Top cross-beam connecting post tops ──────────────────────────── */}
      <mesh position={[0, UPRIGHT_H - 0.03, 0]}>
        <boxGeometry args={[12.7, 0.26, 0.26]} />
        <meshStandardMaterial color="#ccd8e8" metalness={0.85} roughness={0.12} />
      </mesh>
      {/* Top beam orange front stripe */}
      <mesh position={[0, UPRIGHT_H - 0.03, 0.14]}>
        <boxGeometry args={[12.6, 0.09, 0.008]} />
        <meshStandardMaterial color={HAMILTON_ORANGE} emissive={HAMILTON_ORANGE} emissiveIntensity={1.2} />
      </mesh>

      {/* ── Y-axis guide rail ─────────────────────────────────────────────── */}
      <mesh position={[0, 3.65, 0]}>
        <boxGeometry args={[12.8, 0.22, 0.22]} />
        <meshStandardMaterial color="#ccd8e8" metalness={0.85} roughness={0.12} />
      </mesh>
      <mesh position={[0, 3.65, 0.14]}>
        <boxGeometry args={[12.6, 0.14, 0.14]} />
        <meshStandardMaterial color="#b8c8d8" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* ── Bridge group — Z-animated by GSAP ────────────────────────────── */}
      <group ref={bridgeRef} position={[0, 0, 2]}>

        {/* Bridge bar — more substantial */}
        <mesh position={[0, 3.25, 0]} castShadow>
          <boxGeometry args={[12.3, 0.48, 0.44]} />
          <meshStandardMaterial color="#e4ecf8" metalness={0.45} roughness={0.3} />
        </mesh>

        {/* Bridge front face */}
        <mesh position={[0, 3.25, 0.225]}>
          <boxGeometry args={[12.28, 0.46, 0.01]} />
          <meshStandardMaterial color="#eef4fc" metalness={0.2} roughness={0.4} />
        </mesh>

        {/* Primary Hamilton orange stripe — bold */}
        <mesh position={[0, 3.46, 0.232]}>
          <boxGeometry args={[12.2, 0.08, 0.008]} />
          <meshStandardMaterial color={HAMILTON_ORANGE} emissive={HAMILTON_ORANGE} emissiveIntensity={2.2} />
        </mesh>

        {/* Secondary orange hairline */}
        <mesh position={[0, 3.06, 0.232]}>
          <boxGeometry args={[12.2, 0.03, 0.005]} />
          <meshStandardMaterial color={HAMILTON_ORANGE} emissive={HAMILTON_ORANGE} emissiveIntensity={1.6} />
        </mesh>

        {/* Bridge lower guide rail */}
        <mesh position={[0, 2.95, 0]}>
          <boxGeometry args={[12.1, 0.16, 0.30]} />
          <meshStandardMaterial color="#ccd8e8" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* ── Carriage group — X-animated by GSAP ──────────────────────────── */}
        <group ref={carriageRef} position={[-3, 0, 0]}>

          {/* Carriage housing — wider and taller */}
          <mesh position={[0, 3.1, 0]} castShadow>
            <boxGeometry args={[0.82, 0.72, 0.68]} />
            <meshStandardMaterial color="#dce8f4" metalness={0.45} roughness={0.3} />
          </mesh>
          {/* Face plate */}
          <mesh position={[0, 3.1, 0.35]}>
            <boxGeometry args={[0.80, 0.70, 0.01]} />
            <meshStandardMaterial color="#e8f0fa" metalness={0.2} roughness={0.5} />
          </mesh>
          {/* Orange accent stripe on carriage */}
          <mesh position={[0, 3.45, 0.358]}>
            <boxGeometry args={[0.74, 0.06, 0.005]} />
            <meshStandardMaterial color={HAMILTON_ORANGE} emissive={HAMILTON_ORANGE} emissiveIntensity={1.8} />
          </mesh>
          {/* Carriage status LED — matches experiment accent */}
          <mesh position={[0.3, 3.12, 0.362]}>
            <sphereGeometry args={[0.040, 8, 8]} />
            <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3.0} />
          </mesh>
          {/* Power LED (always orange) */}
          <mesh position={[0.1, 3.12, 0.362]}>
            <sphereGeometry args={[0.028, 8, 8]} />
            <meshStandardMaterial color={HAMILTON_ORANGE} emissive={HAMILTON_ORANGE} emissiveIntensity={2.4} />
          </mesh>

          {/* Z-axis column — taller, more prominent */}
          <mesh position={[0, 2.1, 0]} castShadow>
            <boxGeometry args={[0.28, 2.1, 0.28]} />
            <meshStandardMaterial color="#ccd8e8" metalness={0.75} roughness={0.2} />
          </mesh>
          {/* Column highlight edge */}
          <mesh position={[0.12, 2.1, 0.12]}>
            <boxGeometry args={[0.05, 2.08, 0.05]} />
            <meshStandardMaterial color="#b0c0d4" metalness={0.9} roughness={0.1} />
          </mesh>

          {/* ── Pipette head — Y-animated by GSAP ──────────────────────────── */}
          <group ref={headRef} position={[0, 1.5, 0]}>

            {/* Head body */}
            <mesh castShadow>
              <boxGeometry args={[2.4, 0.50, 0.52]} />
              <meshStandardMaterial
                ref={headLightRef}
                color="#d8e8f8"
                metalness={0.4}
                roughness={0.35}
                emissive={accentColor}
                emissiveIntensity={0.25}
              />
            </mesh>
            {/* Head face plate */}
            <mesh position={[0, 0, 0.265]}>
              <boxGeometry args={[2.38, 0.48, 0.01]} />
              <meshStandardMaterial color="#e4f0fc" metalness={0.2} roughness={0.5} />
            </mesh>

            {/* 8 channel barrel bodies */}
            {Array.from({ length: CHANNEL_COUNT }, (_, i) => {
              const x = (i - (CHANNEL_COUNT - 1) / 2) * 0.26
              return (
                <group key={i} position={[x, 0, 0]}>
                  <mesh position={[0, -0.12, 0]}>
                    <cylinderGeometry args={[0.065, 0.058, 0.30, 10]} />
                    <meshStandardMaterial color="#d0dce8" metalness={0.5} roughness={0.3} />
                  </mesh>
                  {/* Stainless needle — longer for visibility */}
                  <mesh position={[0, -0.44, 0]}>
                    <cylinderGeometry args={[0.030, 0.024, 0.50, 8]} />
                    <meshStandardMaterial color="#b8c8d8" metalness={0.92} roughness={0.08} />
                  </mesh>
                </group>
              )
            })}

            {/* Tips group (hidden until loaded) */}
            <group ref={tipsRef} position={[0, 0, 0]} visible={false}>
              {Array.from({ length: CHANNEL_COUNT }, (_, i) => {
                const x = (i - (CHANNEL_COUNT - 1) / 2) * 0.26
                return (
                  <mesh key={i} position={[x, -0.75, 0]}>
                    <coneGeometry args={[0.046, 0.52, 10]} />
                    <meshStandardMaterial
                      color="#d8eeff"
                      transparent
                      opacity={0.85}
                      metalness={0.05}
                      roughness={0.25}
                    />
                  </mesh>
                )
              })}
            </group>

            {/* Primary status dot */}
            <mesh position={[1.1, 0.20, 0.27]}>
              <sphereGeometry args={[0.050, 8, 8]} />
              <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3.2} />
            </mesh>
            {/* Always-on orange power LED */}
            <mesh position={[0.88, 0.20, 0.27]}>
              <sphereGeometry args={[0.033, 8, 8]} />
              <meshStandardMaterial color={HAMILTON_ORANGE} emissive={HAMILTON_ORANGE} emissiveIntensity={2.4} />
            </mesh>

          </group>
        </group>
      </group>

      {/* ── Tip box (redesigned — bold blue tips) ────────────────────────── */}
      <group position={[-5, 0.34, 3.2]}>
        {/* Box body — dark tray */}
        <mesh castShadow>
          <boxGeometry args={[2.6, 0.62, 1.45]} />
          <meshStandardMaterial color="#182840" metalness={0.25} roughness={0.7} />
        </mesh>
        {/* Box rim — white frame */}
        <mesh position={[0, 0.26, 0]}>
          <boxGeometry args={[2.62, 0.09, 1.47]} />
          <meshStandardMaterial color="#c8d8e8" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Tip array — vivid blue */}
        {Array.from({ length: 12 * 8 }, (_, i) => {
          const col = i % 12
          const row = Math.floor(i / 12)
          return (
            <mesh key={i} position={[(col - 5.5) * 0.185, 0.33, (row - 3.5) * 0.145]}>
              <cylinderGeometry args={[0.044, 0.035, 0.24, 6]} />
              <meshStandardMaterial
                color="#5ab0e8"
                transparent
                opacity={0.85}
                metalness={0.05}
                roughness={0.2}
                emissive="#3080c0"
                emissiveIntensity={0.15}
              />
            </mesh>
          )
        })}
      </group>

      {/* ── Reagent reservoir (colored liquid troughs) ─────────────────────── */}
      <group position={[4.5, 0.24, 3.2]}>
        <mesh castShadow>
          <boxGeometry args={[2.2, 0.40, 1.1]} />
          <meshStandardMaterial color="#1e3040" metalness={0.3} roughness={0.6} />
        </mesh>
        {/* Trough wells with colored reagents */}
        {[
          { offset: -0.65, color: '#0070e0', emissive: '#0050b0' },
          { offset:     0, color: '#00c89a', emissive: '#008870' },
          { offset:  0.65, color: '#8030d0', emissive: '#5020a0' },
        ].map(({ offset, color, emissive }, i) => (
          <mesh key={i} position={[offset, 0.21, 0]}>
            <boxGeometry args={[0.48, 0.02, 0.92]} />
            <meshStandardMaterial
              color={color}
              transparent
              opacity={0.82}
              emissive={emissive}
              emissiveIntensity={0.35}
              metalness={0.15}
              roughness={0.15}
            />
          </mesh>
        ))}
        {/* Reservoir front label strip */}
        <mesh position={[0, 0.21, 0.565]}>
          <boxGeometry args={[1.9, 0.07, 0.005]} />
          <meshStandardMaterial color="#ccd8e8" metalness={0.4} roughness={0.5} />
        </mesh>
      </group>

    </group>
  )
})

HamiltonRobot.displayName = 'HamiltonRobot'
export default HamiltonRobot
