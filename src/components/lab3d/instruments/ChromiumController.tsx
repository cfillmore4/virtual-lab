import { forwardRef, useImperativeHandle, useRef } from 'react'
import * as THREE from 'three'

export interface ChromiumRefs {
  chipTrayRef: React.RefObject<THREE.Group | null>
  screenMatRef: React.RefObject<THREE.MeshStandardMaterial | null>
}

const ChromiumController = forwardRef<ChromiumRefs, object>((_, ref) => {
  const chipTrayRef = useRef<THREE.Group>(null)
  const screenMatRef = useRef<THREE.MeshStandardMaterial>(null)

  useImperativeHandle(ref, () => ({ chipTrayRef, screenMatRef }))

  return (
    <group position={[-5.5, 0, -3.5]}>
      {/* Main body */}
      <mesh castShadow>
        <boxGeometry args={[2.0, 1.6, 1.6]} />
        <meshStandardMaterial color="#12162a" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* Front face */}
      <mesh position={[0, 0, 0.81]}>
        <boxGeometry args={[1.98, 1.58, 0.02]} />
        <meshStandardMaterial color="#0c1022" />
      </mesh>

      {/* Touch screen */}
      <mesh position={[0, 0.4, 0.83]}>
        <boxGeometry args={[1.4, 0.7, 0.005]} />
        <meshStandardMaterial
          ref={screenMatRef}
          color="#050010"
          emissive="#7c3aed"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Screen grid pattern (10x chip grid) */}
      {Array.from({ length: 4 * 3 }, (_, i) => {
        const col = i % 4
        const row = Math.floor(i / 4)
        return (
          <mesh key={i} position={[-0.45 + col * 0.3, 0.55 - row * 0.2, 0.84]}>
            <boxGeometry args={[0.2, 0.13, 0.001]} />
            <meshStandardMaterial
              color="#7c3aed"
              emissive="#7c3aed"
              emissiveIntensity={Math.random() * 1.5 + 0.3}
              transparent
              opacity={0.5}
            />
          </mesh>
        )
      })}

      {/* Chip loading tray — slides out */}
      <group ref={chipTrayRef} position={[0, -0.3, 0.81]}>
        <mesh position={[0, 0, 0.1]} castShadow>
          <boxGeometry args={[1.2, 0.3, 0.25]} />
          <meshStandardMaterial color="#1a1e38" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Chip slots */}
        {[-0.35, 0, 0.35].map((x, i) => (
          <mesh key={i} position={[x, 0.04, 0.24]}>
            <boxGeometry args={[0.25, 0.05, 0.12]} />
            <meshStandardMaterial color="#7c3aed" emissive="#7c3aed" emissiveIntensity={0.4} transparent opacity={0.6} />
          </mesh>
        ))}
        {/* Tray handle */}
        <mesh position={[0, 0, 0.25]}>
          <boxGeometry args={[0.5, 0.06, 0.04]} />
          <meshStandardMaterial color="#6a7090" metalness={0.85} roughness={0.15} />
        </mesh>
      </group>

      {/* Side badge accent */}
      <mesh position={[1.01, 0.6, 0]}>
        <boxGeometry args={[0.01, 0.4, 0.6]} />
        <meshStandardMaterial color="#7c3aed" emissive="#7c3aed" emissiveIntensity={1.5} />
      </mesh>

      {/* Status LEDs */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-0.7 + i * 0.12, -0.72, 0.82]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial
            color={i === 0 ? '#7c3aed' : i === 1 ? '#10b981' : '#f59e0b'}
            emissive={i === 0 ? '#7c3aed' : i === 1 ? '#10b981' : '#f59e0b'}
            emissiveIntensity={2.5}
          />
        </mesh>
      ))}

      {/* Label strip */}
      <mesh position={[0.3, -0.72, 0.82]}>
        <boxGeometry args={[0.8, 0.06, 0.002]} />
        <meshStandardMaterial color="#7c3aed" emissive="#7c3aed" emissiveIntensity={0.5} transparent opacity={0.3} />
      </mesh>
    </group>
  )
})

ChromiumController.displayName = 'ChromiumController'
export default ChromiumController
