import { forwardRef, useImperativeHandle, useRef } from 'react'
import * as THREE from 'three'

export interface MassSpecRefs {
  inletGroupRef: React.RefObject<THREE.Group | null>
  screenMatRef: React.RefObject<THREE.MeshStandardMaterial | null>
}

const MassSpectrometer = forwardRef<MassSpecRefs, object>((_, ref) => {
  const inletGroupRef = useRef<THREE.Group>(null)
  const screenMatRef = useRef<THREE.MeshStandardMaterial>(null)

  useImperativeHandle(ref, () => ({ inletGroupRef, screenMatRef }))

  return (
    <group position={[5.5, 0, -3.5]}>
      {/* Main body (Orbitrap-style large box) */}
      <mesh castShadow>
        <boxGeometry args={[3.0, 2.0, 2.2]} />
        <meshStandardMaterial color="#101820" metalness={0.65} roughness={0.3} />
      </mesh>

      {/* Front panel */}
      <mesh position={[0, 0, 1.11]}>
        <boxGeometry args={[2.98, 1.98, 0.02]} />
        <meshStandardMaterial color="#0c1520" metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Large status display */}
      <mesh position={[-0.6, 0.55, 1.125]}>
        <boxGeometry args={[1.3, 0.7, 0.005]} />
        <meshStandardMaterial
          ref={screenMatRef}
          color="#001a0a"
          emissive="#10b981"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Mass spectrum bars */}
      {[0.15, 0.4, 0.28, 0.65, 0.5, 0.35, 0.8, 0.45, 0.6, 0.25].map((h, i) => (
        <mesh key={i} position={[-1.08 + i * 0.145, 0.35 + (h - 0.5) * 0.5, 1.13]}>
          <boxGeometry args={[0.08, h * 0.6, 0.002]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={2} transparent opacity={0.8} />
        </mesh>
      ))}

      {/* Inlet spray assembly group */}
      <group ref={inletGroupRef} position={[1.1, 0.1, 1.15]}>
        {/* ESI inlet housing */}
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[0.4, 0.4, 0.12]} />
          <meshStandardMaterial color="#1a2535" metalness={0.7} roughness={0.25} />
        </mesh>
        {/* Spray capillary */}
        <mesh position={[0.22, 0, 0.02]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.02, 0.5, 8]} />
          <meshStandardMaterial color="#8090a0" metalness={0.95} roughness={0.05} />
        </mesh>
        {/* Spray glow dot */}
        <mesh position={[0.48, 0, 0.02]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={3} />
        </mesh>
        {/* LC tubing */}
        <mesh position={[0.1, 0.3, 0.05]} rotation={[0.3, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.6, 6]} />
          <meshStandardMaterial color="#334455" />
        </mesh>
      </group>

      {/* Vacuum pump housing (right side) */}
      <mesh position={[1.3, -0.4, -0.2]} castShadow>
        <boxGeometry args={[0.6, 0.8, 1.0]} />
        <meshStandardMaterial color="#0e1620" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Pump fan vent */}
      <mesh position={[1.51, -0.4, -0.2]}>
        <boxGeometry args={[0.02, 0.6, 0.7]} />
        <meshStandardMaterial color="#081018" />
      </mesh>
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[1.51, -0.1 - i * 0.12, -0.2]}>
          <boxGeometry args={[0.025, 0.02, 0.65]} />
          <meshStandardMaterial color="#050d15" />
        </mesh>
      ))}

      {/* Control module */}
      <mesh position={[0.8, -0.5, 1.12]}>
        <boxGeometry args={[0.5, 0.5, 0.01]} />
        <meshStandardMaterial color="#0a1520" />
      </mesh>
      {[0, 1].map((row) =>
        [0, 1, 2].map((col) => (
          <mesh key={`${row}-${col}`} position={[0.6 + col * 0.16, -0.35 - row * 0.14, 1.125]}>
            <boxGeometry args={[0.1, 0.08, 0.005]} />
            <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.6} transparent opacity={0.5} />
          </mesh>
        ))
      )}

      {/* Status lights strip */}
      <mesh position={[0, -0.92, 1.01]}>
        <boxGeometry args={[2.6, 0.04, 0.02]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.8} />
      </mesh>

      {/* Bottom feet */}
      {[[-1.2, -1.0], [1.2, -1.0], [-1.2, 1.0], [1.2, 1.0]].map(([x, z], i) => (
        <mesh key={i} position={[x, -1.08, z]}>
          <boxGeometry args={[0.3, 0.18, 0.3]} />
          <meshStandardMaterial color="#090e18" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
})

MassSpectrometer.displayName = 'MassSpectrometer'
export default MassSpectrometer
