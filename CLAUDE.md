# Virtual Lab — Project Brief

A portfolio/interview demo: a dark-themed web app where users configure a 96-well plate and watch a 3D-animated Hamilton liquid handler execute the experiment, then receive a mock report.

## Stack
- **Vite + React + TypeScript** — frontend framework
- **React Three Fiber + Three.js** — 3D rendering
- **@react-three/drei** — helpers (Stars, OrbitControls)
- **@react-three/postprocessing** — Bloom + Vignette effects
- **GSAP** — animation sequencing (timelines on Three.js object properties)
- **Zustand** — global state (screen, experiment type, wells, animation step)
- **Tailwind CSS v4** (via `@tailwindcss/vite` plugin) — UI styling

## App Flow
`Landing → ExperimentSelector → WellPlate → LabScene (3D animation) → Report`

Screen routing is managed by `useExperimentStore().screen` in Zustand.

## Supported Experiments
- `amplicon` — Amplicon Sequencing (cyan accent)
- `rnaseq` — RNA-seq (orange accent)
- `scrna` — scRNA-seq / 10x Genomics (purple accent)
- `massspec` — Mass Spectrometry (green accent)

Configs live in `src/types/experiment.ts` → `EXPERIMENT_CONFIGS`.

## Key Files
| File | Purpose |
|---|---|
| `src/App.tsx` | Screen router |
| `src/store/experimentStore.ts` | Zustand store; `fillWells` accepts `colorIndex=-1` to clear |
| `src/types/experiment.ts` | Types + `EXPERIMENT_CONFIGS` |
| `src/components/WellPlate.tsx` | 96-well plate UI; click/drag to fill wells directly |
| `src/components/lab3d/LabScene.tsx` | Main 3D Canvas; GSAP timeline; `AnimatedWellPlate` component |
| `src/components/lab3d/HamiltonRobot.tsx` | Hamilton STAR geometry + refs for animation |
| `src/components/lab3d/LabEnvironment.tsx` | Floor, bench, ceiling strips |
| `src/components/lab3d/instruments/` | Thermocycler, Sequencer, ChromiumController, MassSpectrometer |
| `src/components/Report.tsx` | Mock QC report with seeded deterministic metrics |

## 3D Scene Architecture
- **All geometry is Three.js primitives** — no external model files
- **Hamilton robot refs** (`bridgeRef`, `carriageRef`, `headRef`, `tipsRef`, `headLightRef`) are forwarded via `useImperativeHandle`; GSAP animates their `.position` / `.rotation` properties directly
- **`AnimatedWellPlate`** renders 96 well cylinders; `activeColRef` and `processedColsRef` (plain refs, not state) are updated by GSAP callbacks so `useFrame` can read them without stale closures
- **Column positions** on the plate: `(colIndex - 5.5) * 0.38` where `colIndex` is 0–11 → x range `-2.09` to `+2.09`. These must match exactly.
- **Bridge Z** should be `-0.5` when the arm is over the plate (center of WellPlateModel)
- **Camera** is animated via GSAP on `camera.position` + a `cameraTargetRef` that `useFrame` passes to `camera.lookAt` every frame
- **Post-processing**: Bloom (`luminanceThreshold: 0.45`, `intensity: 1.6`) + Vignette

## Design Tokens
- Background: `#050a0f`
- Bench surface: `#1a2e42`
- Amplicon accent: `#00d4ff` | RNA-seq: `#ff6b35` | scRNA-seq: `#7c3aed` | Mass Spec: `#10b981`

## Known Gotchas
- Use `position: absolute; inset: 0` on the Canvas container (not Tailwind `h-full`) — percentage heights fail to resolve when parent uses inline `style={{ height: '100vh' }}`
- `isDragging` in WellPlate must be a `useRef`, not `useState` — React state closures cause stale reads between `mouseDown` and `click`
- GSAP cannot animate React state — always use refs for values that GSAP callbacks need to read/write
- `fillWells` with `colorIndex === -1` clears the well (special-cased in the store)
- `verbatimModuleSyntax` is enabled — types must use `import type`
