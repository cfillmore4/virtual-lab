/**
 * LabEnvironment — modern biotech research lab.
 *
 * Reference aesthetic: clean fluorescent-lit corridor lab with:
 *   - White suspended ceiling with tile grid + recessed fluorescent strips
 *   - Light gray-green epoxy floor
 *   - Gray-blue bench tops
 *   - Blue under-bench cabinetry
 *   - Wall-mounted overhead shelving above side/instrument areas
 *   - Pale walls with wainscoting
 *   - Back windows (blue daylight tint)
 */

export default function LabEnvironment() {
  return (
    <group>

      {/* ═══════════════════════════════════════════════════════════════════
          FLOOR
      ══════════════════════════════════════════════════════════════════════ */}
      {/* Outer ground plane — darker surround */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.65, -4]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#6e7e78" roughness={0.92} metalness={0.0} />
      </mesh>
      {/* Lab interior floor — medium gray-green epoxy */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.62, -9]} receiveShadow>
        <planeGeometry args={[80, 50]} />
        <meshStandardMaterial color="#8fa89e" roughness={0.85} metalness={0.02} />
      </mesh>
      {/* Vinyl/epoxy tile seams — subtle */}
      <gridHelper args={[80, 40, '#7a9088', '#849890']} position={[0, -0.61, -9]} />

      {/* ═══════════════════════════════════════════════════════════════════
          WALLS — solid box geometry: real thickness, visible from any angle.
          Interior face: Z=-22.45 (back), X=±40 (sides).
          Walls run floor (Y≈-0.62) to Y=10.
      ══════════════════════════════════════════════════════════════════════ */}

      {/* ── Back wall ──────────────────────────────────────────────────────── */}
      <mesh position={[0, 4.7, -22.72]}>
        <boxGeometry args={[82, 11.5, 0.55]} />
        <meshStandardMaterial color="#c8d4e0" roughness={0.92} />
      </mesh>

      {/* Back wall interior wainscoting panel */}
      <mesh position={[0, 0.9, -22.44]}>
        <planeGeometry args={[81, 3.2]} />
        <meshStandardMaterial color="#b0c2d2" roughness={0.9} />
      </mesh>
      {/* Wainscoting cap rail */}
      <mesh position={[0, 2.52, -22.44]}>
        <boxGeometry args={[81, 0.07, 0.04]} />
        <meshStandardMaterial color="#98b0c4" metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Back windows — blue daylight glow */}
      {[-20, -8, 4, 16].map((x) => (
        <mesh key={`win-${x}`} position={[x, 4.0, -22.44]}>
          <planeGeometry args={[8, 2.2]} />
          <meshStandardMaterial
            color="#8ab8d8"
            emissive="#5080b8"
            emissiveIntensity={0.7}
            transparent
            opacity={0.80}
          />
        </mesh>
      ))}
      {/* Window frames */}
      {[-20, -8, 4, 16].map((x) => (
        <group key={`wf-${x}`}>
          <mesh position={[x, 4.0, -22.43]}>
            <boxGeometry args={[8.18, 2.38, 0.06]} />
            <meshStandardMaterial color="#b8c8d8" roughness={0.6} />
          </mesh>
          <mesh position={[x, 4.0, -22.42]}>
            <boxGeometry args={[0.07, 2.32, 0.04]} />
            <meshStandardMaterial color="#a0b2c4" roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* ── Left wall ──────────────────────────────────────────────────────── */}
      {/* Solid box — spans Z from lab front to back wall */}
      <mesh position={[-40.27, 4.7, -3.5]}>
        <boxGeometry args={[0.55, 11.5, 39]} />
        <meshStandardMaterial color="#c8d4e0" roughness={0.92} />
      </mesh>
      {/* Left wall interior wainscoting */}
      <mesh position={[-40, 0.9, -3.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[38, 3.2]} />
        <meshStandardMaterial color="#b0c2d2" roughness={0.9} />
      </mesh>
      <mesh position={[-40, 2.52, -3.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[38, 0.07]} />
        <meshStandardMaterial color="#98b0c4" metalness={0.25} roughness={0.5} />
      </mesh>

      {/* ── Right wall ─────────────────────────────────────────────────────── */}
      <mesh position={[40.27, 4.7, -3.5]}>
        <boxGeometry args={[0.55, 11.5, 39]} />
        <meshStandardMaterial color="#c8d4e0" roughness={0.92} />
      </mesh>
      {/* Right wall interior wainscoting */}
      <mesh position={[40, 0.9, -3.5]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[38, 3.2]} />
        <meshStandardMaterial color="#b0c2d2" roughness={0.9} />
      </mesh>
      <mesh position={[40, 2.52, -3.5]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[38, 0.07]} />
        <meshStandardMaterial color="#98b0c4" metalness={0.25} roughness={0.5} />
      </mesh>

      {/* ── Wall top trim — visible from elevated camera ────────────────────── */}
      {/* A darker cap strip running along the top of each wall */}
      <mesh position={[0, 9.97, -22.72]}>
        <boxGeometry args={[82, 0.18, 0.6]} />
        <meshStandardMaterial color="#8898a8" metalness={0.2} roughness={0.7} />
      </mesh>
      <mesh position={[-40.27, 9.97, -3.5]}>
        <boxGeometry args={[0.6, 0.18, 39]} />
        <meshStandardMaterial color="#8898a8" metalness={0.2} roughness={0.7} />
      </mesh>
      <mesh position={[40.27, 9.97, -3.5]}>
        <boxGeometry args={[0.6, 0.18, 39]} />
        <meshStandardMaterial color="#8898a8" metalness={0.2} roughness={0.7} />
      </mesh>

      {/* ═══════════════════════════════════════════════════════════════════
          CEILING — open top (sim-game diorama view), only fluorescent strips
      ══════════════════════════════════════════════════════════════════════ */}
      {/* No ceiling plane — RollerCoaster Tycoon / sim-game: view looks in from above */}

      {/* Fluorescent light strips — recessed in ceiling, 3 runs */}
      {[-14, 0, 14].map((x) => (
        <group key={`fluor-${x}`}>
          {/* Housing channel */}
          <mesh position={[x, 8.94, -5]}>
            <boxGeometry args={[1.3, 0.07, 24]} />
            <meshStandardMaterial color="#dce8f4" roughness={0.6} />
          </mesh>
          {/* Diffuser — warm white glow */}
          <mesh position={[x, 8.91, -5]}>
            <boxGeometry args={[0.95, 0.035, 23.4]} />
            <meshStandardMaterial
              color="#fffdf6"
              emissive="#fff8e0"
              emissiveIntensity={1.0}
            />
          </mesh>
          {/* Subtle warm point below each strip */}
        </group>
      ))}

      {/* Side aisle fluorescent strips (above side benches) */}
      {[-29, 29].map((x) => (
        <group key={`sf-${x}`}>
          <mesh position={[x, 8.94, -3]}>
            <boxGeometry args={[1.1, 0.07, 13]} />
            <meshStandardMaterial color="#dce8f4" roughness={0.6} />
          </mesh>
          <mesh position={[x, 8.91, -3]}>
            <boxGeometry args={[0.85, 0.03, 12.5]} />
            <meshStandardMaterial
              color="#fffdf6"
              emissive="#fff8e0"
              emissiveIntensity={0.8}
            />
          </mesh>
        </group>
      ))}

      {/* ═══════════════════════════════════════════════════════════════════
          MAIN ROBOT BENCH
      ══════════════════════════════════════════════════════════════════════ */}

      {/* Bench structural frame */}
      <mesh position={[0, -0.33, 0]} receiveShadow castShadow>
        <boxGeometry args={[54, 0.48, 12]} />
        <meshStandardMaterial color="#a8b8c8" metalness={0.35} roughness={0.5} />
      </mesh>

      {/* Bench top — gray-blue epoxy like reference photo */}
      <mesh position={[0, -0.08, 0]}>
        <boxGeometry args={[53.8, 0.04, 11.8]} />
        <meshStandardMaterial color="#7d8fa0" metalness={0.15} roughness={0.35} />
      </mesh>

      {/* Hamilton orange front-edge label strip */}
      <mesh position={[0, -0.055, 6.12]}>
        <boxGeometry args={[54, 0.05, 0.05]} />
        <meshStandardMaterial color="#ff5500" emissive="#ff5500" emissiveIntensity={1.8} />
      </mesh>
      {/* Cyan back edge */}
      <mesh position={[0, -0.055, -6.12]}>
        <boxGeometry args={[54, 0.04, 0.04]} />
        <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={1.2} />
      </mesh>

      {/* Station dividers — subtle vertical fins */}
      {[-8, 8].map((x) => (
        <mesh key={`div-${x}`} position={[x, 0.6, 0]}>
          <boxGeometry args={[0.06, 1.5, 11.6]} />
          <meshStandardMaterial color="#90a0b0" transparent opacity={0.5} />
        </mesh>
      ))}

      {/* ── UNDER-BENCH CABINETS — blue fronts, white body ─────────────── */}
      {Array.from({ length: 16 }, (_, i) => {
        const x = -22.5 + i * 3.0
        return (
          <group key={`cab-${i}`}>
            {/* Cabinet carcass — white sides/top/back */}
            <mesh position={[x, -0.55, 0]} castShadow>
              <boxGeometry args={[2.7, 0.42, 11.4]} />
              <meshStandardMaterial color="#c8d8e8" roughness={0.75} />
            </mesh>
            {/* Front face — BLUE */}
            <mesh position={[x, -0.55, 5.78]}>
              <boxGeometry args={[2.68, 0.4, 0.07]} />
              <meshStandardMaterial color="#3d6fa8" metalness={0.05} roughness={0.55} />
            </mesh>
            {/* Back face — also blue (visible from behind) */}
            <mesh position={[x, -0.55, -5.78]}>
              <boxGeometry args={[2.68, 0.4, 0.07]} />
              <meshStandardMaterial color="#3d6fa8" metalness={0.05} roughness={0.55} />
            </mesh>
            {/* Drawer line on front */}
            <mesh position={[x, -0.47, 5.82]}>
              <boxGeometry args={[2.6, 0.008, 0.01]} />
              <meshStandardMaterial color="#5888c0" />
            </mesh>
            <mesh position={[x, -0.63, 5.82]}>
              <boxGeometry args={[2.6, 0.008, 0.01]} />
              <meshStandardMaterial color="#5888c0" />
            </mesh>
            {/* Silver pull handle */}
            <mesh position={[x, -0.55, 5.86]}>
              <boxGeometry args={[0.8, 0.04, 0.04]} />
              <meshStandardMaterial color="#9ab0c4" metalness={0.85} roughness={0.15} />
            </mesh>
            <mesh position={[x, -0.55, -5.86]}>
              <boxGeometry args={[0.8, 0.04, 0.04]} />
              <meshStandardMaterial color="#9ab0c4" metalness={0.85} roughness={0.15} />
            </mesh>
          </group>
        )
      })}

      {/* Bench legs */}
      {[-25, -17, -9, -1, 1, 9, 17, 25].map((x) =>
        [-5.5, 5.5].map((z) => (
          <mesh key={`leg-${x}-${z}`} position={[x, -0.75, z]} castShadow>
            <boxGeometry args={[0.22, 0.6, 0.22]} />
            <meshStandardMaterial color="#8898a8" metalness={0.6} roughness={0.3} />
          </mesh>
        ))
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          INSTRUMENT PLATFORM (back shelf)
      ══════════════════════════════════════════════════════════════════════ */}

      {/* Shelf base */}
      <mesh position={[0, -0.36, -12]} receiveShadow>
        <boxGeometry args={[44, 0.25, 7]} />
        <meshStandardMaterial color="#9ab0c0" metalness={0.25} roughness={0.55} />
      </mesh>
      {/* Shelf surface — same gray-blue as bench */}
      <mesh position={[0, -0.23, -12]}>
        <boxGeometry args={[43.8, 0.03, 6.8]} />
        <meshStandardMaterial color="#7d8fa0" metalness={0.15} roughness={0.35} />
      </mesh>
      {/* Cyan front strip */}
      <mesh position={[0, -0.21, -8.6]}>
        <boxGeometry args={[44, 0.04, 0.04]} />
        <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={1.1} />
      </mesh>

      {/* ── OVERHEAD SHELVING above instrument area ───────────────────────── */}
      {/* Upper shelf run 1 (Y ≈ 2.8) */}
      {[-19, -9, 1, 11, 21].map((x) => (
        <group key={`ush1-${x}`}>
          {/* Shelf board */}
          <mesh position={[x, 2.75, -14]}>
            <boxGeometry args={[8.8, 0.08, 4.5]} />
            <meshStandardMaterial color="#dce8f4" metalness={0.2} roughness={0.6} />
          </mesh>
          {/* Bracket L */}
          <mesh position={[x - 4.0, 2.35, -13.2]}>
            <boxGeometry args={[0.07, 0.8, 0.07]} />
            <meshStandardMaterial color="#b0c0d0" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Bracket R */}
          <mesh position={[x + 4.0, 2.35, -13.2]}>
            <boxGeometry args={[0.07, 0.8, 0.07]} />
            <meshStandardMaterial color="#b0c0d0" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Horizontal bracket arm */}
          <mesh position={[x - 4.0, 2.74, -13.6]}>
            <boxGeometry args={[0.07, 0.07, 0.9]} />
            <meshStandardMaterial color="#b0c0d0" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[x + 4.0, 2.74, -13.6]}>
            <boxGeometry args={[0.07, 0.07, 0.9]} />
            <meshStandardMaterial color="#b0c0d0" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Upper shelf run 2 (Y ≈ 4.4) */}
      {[-19, -9, 1, 11, 21].map((x) => (
        <group key={`ush2-${x}`}>
          <mesh position={[x, 4.35, -14]}>
            <boxGeometry args={[8.8, 0.08, 4.2]} />
            <meshStandardMaterial color="#dce8f4" metalness={0.2} roughness={0.6} />
          </mesh>
          {/* Bracket uprights from wall */}
          <mesh position={[x - 4.0, 3.55, -13.2]}>
            <boxGeometry args={[0.07, 1.55, 0.07]} />
            <meshStandardMaterial color="#b0c0d0" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[x + 4.0, 3.55, -13.2]}>
            <boxGeometry args={[0.07, 1.55, 0.07]} />
            <meshStandardMaterial color="#b0c0d0" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Overhead cable tray / raceway above shelving */}
      <mesh position={[0, 5.6, -14.5]}>
        <boxGeometry args={[44, 0.18, 0.22]} />
        <meshStandardMaterial color="#8090a0" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Cable tray slots */}
      {Array.from({ length: 20 }, (_, i) => (
        <mesh key={`ct-${i}`} position={[-19 + i * 2.0, 5.62, -14.5]}>
          <boxGeometry args={[0.06, 0.2, 0.18]} />
          <meshStandardMaterial color="#6a7a8a" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      {/* A few hanging cables/cords */}
      {[-16, -8, 0, 8, 16].map((x) => (
        <mesh key={`cord-${x}`} position={[x, 4.2, -14.4]}>
          <cylinderGeometry args={[0.03, 0.03, 2.8, 6]} />
          <meshStandardMaterial color="#2a3a4a" />
        </mesh>
      ))}

      {/* Items on overhead shelves (bottles, reagent boxes) */}
      {[-22, -17, -12, -7, -2, 3, 8, 13, 18, 23].map((x, i) => (
        <mesh key={`item-${i}`} position={[x, 2.95, -13.5]}>
          <boxGeometry args={[1.4, 0.38, 0.8]} />
          <meshStandardMaterial
            color={['#c8d8e8', '#b8c8d8', '#d0dce8', '#a8b8c8'][i % 4]}
            roughness={0.8}
          />
        </mesh>
      ))}
      {/* Taller bottles on upper shelf */}
      {[-20, -10, 0, 10, 20].map((x, i) => (
        <group key={`bottle-${i}`}>
          <mesh position={[x, 4.62, -13.6]}>
            <cylinderGeometry args={[0.25, 0.28, 0.55, 8]} />
            <meshStandardMaterial
              color={['#7ac0e8', '#f59e0b', '#10b981', '#7c3aed', '#ff5500'][i]}
              transparent opacity={0.75}
            />
          </mesh>
          <mesh position={[x, 4.94, -13.6]}>
            <cylinderGeometry args={[0.1, 0.1, 0.12, 8]} />
            <meshStandardMaterial color="#c8d0d8" metalness={0.5} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* ═══════════════════════════════════════════════════════════════════
          SIDE BENCH LEFT — Technician A
      ══════════════════════════════════════════════════════════════════════ */}

      <mesh position={[-30, -0.33, -3]} receiveShadow castShadow>
        <boxGeometry args={[7.5, 0.48, 11]} />
        <meshStandardMaterial color="#a8b8c8" metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[-30, -0.08, -3]}>
        <boxGeometry args={[7.3, 0.04, 10.8]} />
        <meshStandardMaterial color="#7d8fa0" metalness={0.15} roughness={0.35} />
      </mesh>
      {/* Blue cabinets under side bench L */}
      {[-31, -29].map((x) => (
        <group key={`sbl-${x}`}>
          <mesh position={[x, -0.55, -3]} castShadow>
            <boxGeometry args={[2.6, 0.42, 9.8]} />
            <meshStandardMaterial color="#c8d8e8" roughness={0.75} />
          </mesh>
          <mesh position={[x, -0.55, 1.62]}>
            <boxGeometry args={[2.58, 0.4, 0.07]} />
            <meshStandardMaterial color="#3d6fa8" roughness={0.55} />
          </mesh>
          <mesh position={[x, -0.55, 1.66]}>
            <boxGeometry args={[0.8, 0.04, 0.04]} />
            <meshStandardMaterial color="#9ab0c4" metalness={0.85} roughness={0.15} />
          </mesh>
        </group>
      ))}
      {/* Side bench L — inner glow strip */}
      <mesh position={[-26.2, -0.06, -3]}>
        <boxGeometry args={[0.04, 0.04, 11]} />
        <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.9} />
      </mesh>
      {/* Legs */}
      {[-32.5, -27.5].map((x) =>
        [-7.8, 1.8].map((z) => (
          <mesh key={`sl-${x}-${z}`} position={[x, -0.75, z]} castShadow>
            <boxGeometry args={[0.2, 0.62, 0.2]} />
            <meshStandardMaterial color="#8898a8" metalness={0.6} roughness={0.3} />
          </mesh>
        ))
      )}

      {/* ── Overhead shelving above side bench L ──────────────────────────── */}
      {[-3.5, 2.5].map((z) => (
        <group key={`lsh-${z}`}>
          <mesh position={[-29.5, 2.8, z]}>
            <boxGeometry args={[5.8, 0.07, 4.0]} />
            <meshStandardMaterial color="#dce8f4" metalness={0.2} roughness={0.6} />
          </mesh>
          <mesh position={[-31.8, 2.0, z + 1.0]}>
            <boxGeometry args={[0.06, 1.6, 0.06]} />
            <meshStandardMaterial color="#b0c0d0" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[-27.2, 2.0, z + 1.0]}>
            <boxGeometry args={[0.06, 1.6, 0.06]} />
            <meshStandardMaterial color="#b0c0d0" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* ═══════════════════════════════════════════════════════════════════
          SIDE BENCH RIGHT — Technicians B & C
      ══════════════════════════════════════════════════════════════════════ */}

      <mesh position={[30, -0.33, -3]} receiveShadow castShadow>
        <boxGeometry args={[7.5, 0.48, 11]} />
        <meshStandardMaterial color="#a8b8c8" metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[30, -0.08, -3]}>
        <boxGeometry args={[7.3, 0.04, 10.8]} />
        <meshStandardMaterial color="#7d8fa0" metalness={0.15} roughness={0.35} />
      </mesh>
      {/* Blue cabinets under side bench R */}
      {[31, 29].map((x) => (
        <group key={`sbr-${x}`}>
          <mesh position={[x, -0.55, -3]} castShadow>
            <boxGeometry args={[2.6, 0.42, 9.8]} />
            <meshStandardMaterial color="#c8d8e8" roughness={0.75} />
          </mesh>
          <mesh position={[x, -0.55, 1.62]}>
            <boxGeometry args={[2.58, 0.4, 0.07]} />
            <meshStandardMaterial color="#3d6fa8" roughness={0.55} />
          </mesh>
          <mesh position={[x, -0.55, 1.66]}>
            <boxGeometry args={[0.8, 0.04, 0.04]} />
            <meshStandardMaterial color="#9ab0c4" metalness={0.85} roughness={0.15} />
          </mesh>
        </group>
      ))}
      <mesh position={[26.2, -0.06, -3]}>
        <boxGeometry args={[0.04, 0.04, 11]} />
        <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.9} />
      </mesh>
      {[32.5, 27.5].map((x) =>
        [-7.8, 1.8].map((z) => (
          <mesh key={`sr-${x}-${z}`} position={[x, -0.75, z]} castShadow>
            <boxGeometry args={[0.2, 0.62, 0.2]} />
            <meshStandardMaterial color="#8898a8" metalness={0.6} roughness={0.3} />
          </mesh>
        ))
      )}

      {/* ── Overhead shelving above side bench R ──────────────────────────── */}
      {[-3.5, 2.5].map((z) => (
        <group key={`rsh-${z}`}>
          <mesh position={[29.5, 2.8, z]}>
            <boxGeometry args={[5.8, 0.07, 4.0]} />
            <meshStandardMaterial color="#dce8f4" metalness={0.2} roughness={0.6} />
          </mesh>
          <mesh position={[31.8, 2.0, z + 1.0]}>
            <boxGeometry args={[0.06, 1.6, 0.06]} />
            <meshStandardMaterial color="#b0c0d0" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[27.2, 2.0, z + 1.0]}>
            <boxGeometry args={[0.06, 1.6, 0.06]} />
            <meshStandardMaterial color="#b0c0d0" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* ═══════════════════════════════════════════════════════════════════
          FLOOR SAFETY MARKINGS
      ══════════════════════════════════════════════════════════════════════ */}
      {/* Yellow robot-zone perimeter line */}
      <mesh position={[0, -0.60, 7.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[56, 0.3]} />
        <meshStandardMaterial color="#f59e0b" opacity={0.65} transparent />
      </mesh>
      <mesh position={[0, -0.60, -7.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[56, 0.3]} />
        <meshStandardMaterial color="#f59e0b" opacity={0.65} transparent />
      </mesh>
      <mesh position={[27.2, -0.60, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.3, 15.6]} />
        <meshStandardMaterial color="#f59e0b" opacity={0.65} transparent />
      </mesh>
      <mesh position={[-27.2, -0.60, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.3, 15.6]} />
        <meshStandardMaterial color="#f59e0b" opacity={0.65} transparent />
      </mesh>

    </group>
  )
}
