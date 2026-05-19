import { forwardRef, useImperativeHandle, useRef } from 'react'
import * as THREE from 'three'

export interface SequencerRefs {
  doorRef: React.RefObject<THREE.Group | null>
  screenMatRef: React.RefObject<THREE.MeshStandardMaterial | null>
  runningLightRef: React.RefObject<THREE.MeshStandardMaterial | null>
}

interface Props {
  color?: string
}

const Sequencer = forwardRef<SequencerRefs, Props>(({ color = '#00d4ff' }, ref) => {
  const doorRef = useRef<THREE.Group>(null)
  const screenMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const runningLightRef = useRef<THREE.MeshStandardMaterial>(null)

  useImperativeHandle(ref, () => ({ doorRef, screenMatRef, runningLightRef }))

  return (
    <group position={[5.5, 0, -3.5]}>
      {/* Main body */}
      <mesh castShadow>
        <boxGeometry args={[2.8, 2.2, 2.0]} />
        <meshStandardMaterial color="#0e1922" metalness={0.65} roughness={0.25} />
      </mesh>

      {/* Top vent panel */}
      <mesh position={[0, 1.12, 0]}>
        <boxGeometry args={[2.6, 0.02, 1.8]} />
        <meshStandardMaterial color="#0a1520" />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[(i - 3.5) * 0.3, 1.13, 0]}>
          <boxGeometry args={[0.05, 0.02, 1.6]} />
          <meshStandardMaterial color="#050e18" />
        </mesh>
      ))}

      {/* Front face */}
      <mesh position={[0, 0, 1.01]}>
        <boxGeometry args={[2.78, 2.18, 0.02]} />
        <meshStandardMaterial color="#0a1520" metalness={0.3} roughness={0.6} />
      </mesh>

      {/* Large display screen */}
      <mesh position={[-0.5, 0.55, 1.025]}>
        <boxGeometry args={[1.4, 0.9, 0.005]} />
        <meshStandardMaterial
          ref={screenMatRef}
          color="#000a10"
          emissive={color}
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Screen graph bars (decorative) */}
      {[0.2, 0.5, 0.35, 0.7, 0.45, 0.6, 0.3, 0.55].map((h, i) => (
        <mesh key={i} position={[-1.0 + i * 0.18, 0.35 + (h - 0.5) * 0.4, 1.03]}>
          <boxGeometry args={[0.1, h * 0.7, 0.002]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} transparent opacity={0.7} />
        </mesh>
      ))}

      {/* Flow cell door group */}
      <group ref={doorRef} position={[0.95, -0.2, 1.01]}>
        <mesh position={[0, 0, 0.01]} castShadow>
          <boxGeometry args={[0.7, 0.8, 0.04]} />
          <meshStandardMaterial color="#1a2535" metalness={0.75} roughness={0.2} />
        </mesh>
        {/* Door handle */}
        <mesh position={[-0.3, 0, 0.04]}>
          <boxGeometry args={[0.06, 0.3, 0.05]} />
          <meshStandardMaterial color="#7090aa" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Door accent stripe */}
        <mesh position={[0, 0.38, 0.04]}>
          <boxGeometry args={[0.65, 0.03, 0.005]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
        </mesh>
        {/* Door label */}
        <mesh position={[0, 0.05, 0.04]}>
          <boxGeometry args={[0.45, 0.06, 0.002]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} transparent opacity={0.4} />
        </mesh>
      </group>

      {/* Side air intake vents */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[1.41, 0.4 - i * 0.25, 0]}>
          <boxGeometry args={[0.02, 0.06, 1.8]} />
          <meshStandardMaterial color="#050d18" />
        </mesh>
      ))}

      {/* Status indicators row */}
      <mesh position={[-1.25, -0.95, 1.025]}>
        <boxGeometry args={[0.15, 0.04, 0.005]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
      <mesh position={[-1.0, -0.95, 1.025]}>
        <boxGeometry args={[0.08, 0.04, 0.005]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={3} />
      </mesh>

      {/* Running light strip */}
      <mesh position={[0, -1.08, 0.8]}>
        <boxGeometry args={[2.5, 0.04, 0.04]} />
        <meshStandardMaterial
          ref={runningLightRef}
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Branding stripe */}
      <mesh position={[0, -0.95, 1.025]}>
        <boxGeometry args={[2.6, 0.03, 0.003]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={0.3} />
      </mesh>
    </group>
  )
})

Sequencer.displayName = 'Sequencer'
export default Sequencer
