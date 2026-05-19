import { forwardRef, useImperativeHandle, useRef } from 'react'
import * as THREE from 'three'

export interface ThermocyclerRefs {
  lidRef: React.RefObject<THREE.Group | null>
  screenMatRef: React.RefObject<THREE.MeshStandardMaterial | null>
}

const Thermocycler = forwardRef<ThermocyclerRefs, object>((_, ref) => {
  const lidRef = useRef<THREE.Group>(null)
  const screenMatRef = useRef<THREE.MeshStandardMaterial>(null)

  useImperativeHandle(ref, () => ({ lidRef, screenMatRef }))

  return (
    <group position={[-5.5, 0, -3.5]}>
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={[2.2, 1.4, 1.8]} />
        <meshStandardMaterial color="#111822" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Front face bezel */}
      <mesh position={[0, 0, 0.91]}>
        <boxGeometry args={[2.18, 1.38, 0.02]} />
        <meshStandardMaterial color="#0d1520" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Screen */}
      <mesh position={[0.45, 0.2, 0.93]}>
        <boxGeometry args={[0.9, 0.5, 0.01]} />
        <meshStandardMaterial
          ref={screenMatRef}
          color="#001122"
          emissive="#ff6b35"
          emissiveIntensity={0.5}
        />
      </mesh>
      {/* Screen scanlines */}
      <mesh position={[0.45, 0.2, 0.935]}>
        <boxGeometry args={[0.88, 0.48, 0.002]} />
        <meshStandardMaterial color="#ff6b35" transparent opacity={0.08} />
      </mesh>

      {/* Control buttons */}
      {[-0.6, -0.75].map((y, i) => (
        <mesh key={i} position={[-0.6 + i * 0.3, y + 0.6, 0.93]}>
          <boxGeometry args={[0.15, 0.08, 0.01]} />
          <meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={0.8} />
        </mesh>
      ))}

      {/* Label */}
      <mesh position={[-0.7, -0.55, 0.93]}>
        <boxGeometry args={[0.7, 0.06, 0.005]} />
        <meshStandardMaterial color="#ff6b35" emissive="#ff6b35" emissiveIntensity={0.6} />
      </mesh>

      {/* Lid group — rotates open */}
      <group ref={lidRef} position={[0, 0.7, -0.9]}>
        <mesh position={[0, 0, 0.9]} castShadow>
          <boxGeometry args={[2.2, 0.25, 1.8]} />
          <meshStandardMaterial color="#1a2535" metalness={0.7} roughness={0.25} />
        </mesh>
        {/* Lid handle */}
        <mesh position={[0, 0.15, 1.78]}>
          <boxGeometry args={[0.8, 0.1, 0.1]} />
          <meshStandardMaterial color="#8090a0" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Lid accent */}
        <mesh position={[0, 0.13, 0.9]}>
          <boxGeometry args={[2.1, 0.02, 1.75]} />
          <meshStandardMaterial color="#ff6b35" emissive="#ff6b35" emissiveIntensity={0.4} transparent opacity={0.5} />
        </mesh>
      </group>

      {/* Block (sample holder) */}
      <mesh position={[0, 0.25, 0.1]}>
        <boxGeometry args={[1.8, 0.2, 1.4]} />
        <meshStandardMaterial color="#0a1828" metalness={0.5} roughness={0.6} />
      </mesh>

      {/* Status LED */}
      <mesh position={[-0.95, 0.6, 0.93]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#ff6b35" emissive="#ff6b35" emissiveIntensity={3} />
      </mesh>

      {/* Instrument label plate */}
      <mesh position={[0, -0.62, 0.93]}>
        <boxGeometry args={[1.8, 0.1, 0.005]} />
        <meshStandardMaterial color="#0a1020" />
      </mesh>
    </group>
  )
})

Thermocycler.displayName = 'Thermocycler'
export default Thermocycler
