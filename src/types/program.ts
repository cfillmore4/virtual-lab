import type { ExperimentType } from './experiment'

export type ProgramPhaseId =
  | 'target-validation'
  | 'guide-screen'
  | 'delivery-opt'
  | 'functional-validation'
  | 'safety-screen'

export type ProgramPhaseStatus = 'locked' | 'unlocked' | 'running' | 'awaiting-results' | 'complete'

export interface PlateSample {
  cols: number[]
  label: string
  color: string
  group: string
  description: string
}

// ── Phase 1 results ───────────────────────────────────────────────────────────

export interface DEGene {
  name: string
  log2FC: number
  negLog10P: number
  significant: boolean
  isCandidate: boolean
}

export interface Phase1Results {
  kind: 'target-validation'
  genes: DEGene[]
  selectedTarget: string | null
}

// ── Phase 2 results ───────────────────────────────────────────────────────────

export interface GuideResult {
  id: string        // G1–G22, Neg1, Neg2
  sequence: string  // 20nt spacer sequence
  efficiency: number // % indels at cut site (0–100)
  isControl: boolean
  isWinner: boolean
}

export interface Phase2Results {
  kind: 'guide-screen'
  guides: GuideResult[]
  selectedGuide: string | null
}

// ── Phase 3 results ───────────────────────────────────────────────────────────

export interface LNPCondition {
  formulation: string  // F1–F4
  dose: number         // mg/kg
  knockdown: number    // % PCSK9 protein reduction (ELISA)
  isWinner: boolean
}

export interface Phase3Results {
  kind: 'delivery-opt'
  conditions: LNPCondition[]
  selectedFormulation: string | null
}

export type PhaseResults = Phase1Results | Phase2Results | Phase3Results | Phase4Results | Phase5Results

// ── Phase & Program types ─────────────────────────────────────────────────────

export interface ProgramPhase {
  id: ProgramPhaseId
  phaseNumber: number
  name: string
  objective: string
  detail: string
  accentColor: string
  experimentType: ExperimentType
  plateSamples: PlateSample[]
  status: ProgramPhaseStatus
  results?: PhaseResults
}

export interface Program {
  id: string
  name: string
  diseaseArea: string
  targetGene: string | null
  selectedGuide: string | null
  selectedFormulation: string | null
  confirmedEfficacy: boolean | null
  safetyCleared: boolean | null
  phases: ProgramPhase[]
}

// ── Phase 1 gene data ─────────────────────────────────────────────────────────
// Plausible cardiovascular RNA-seq results: HepG2 vs. primary hepatocytes.
// PCSK9 is massively upregulated; LDLR downregulated (PCSK9 degrades it).

export const PHASE1_GENES: DEGene[] = [
  { name: 'PCSK9',  log2FC:  3.2, negLog10P: 8.5, significant: true,  isCandidate: true  },
  { name: 'APOB',   log2FC:  2.8, negLog10P: 5.8, significant: true,  isCandidate: false },
  { name: 'HMGCR',  log2FC:  2.4, negLog10P: 6.1, significant: true,  isCandidate: false },
  { name: 'SREBF2', log2FC:  1.9, negLog10P: 5.4, significant: true,  isCandidate: false },
  { name: 'FDFT1',  log2FC:  1.6, negLog10P: 4.2, significant: true,  isCandidate: false },
  { name: 'SQLE',   log2FC:  1.4, negLog10P: 3.9, significant: true,  isCandidate: false },
  { name: 'LSS',    log2FC:  1.2, negLog10P: 3.1, significant: true,  isCandidate: false },
  { name: 'LDLR',   log2FC: -2.1, negLog10P: 7.2, significant: true,  isCandidate: false },
  { name: 'CPT1A',  log2FC: -2.3, negLog10P: 6.8, significant: true,  isCandidate: false },
  { name: 'SIRT1',  log2FC: -1.8, negLog10P: 5.1, significant: true,  isCandidate: false },
  { name: 'HADHA',  log2FC: -1.5, negLog10P: 4.5, significant: true,  isCandidate: false },
  { name: 'ACAA2',  log2FC: -1.3, negLog10P: 3.5, significant: true,  isCandidate: false },
  { name: 'TP53',   log2FC:  0.3, negLog10P: 0.8, significant: false, isCandidate: false },
  { name: 'GAPDH',  log2FC:  0.1, negLog10P: 0.4, significant: false, isCandidate: false },
  { name: 'ACTB',   log2FC: -0.2, negLog10P: 0.6, significant: false, isCandidate: false },
  { name: 'ALB',    log2FC:  0.5, negLog10P: 0.9, significant: false, isCandidate: false },
  { name: 'CYP3A4', log2FC: -0.4, negLog10P: 1.1, significant: false, isCandidate: false },
]

// Anonymous background scatter for the volcano plot (no labels)
export const PHASE1_BACKGROUND: { log2FC: number; negLog10P: number }[] = [
  { log2FC: -0.8, negLog10P: 0.3 }, { log2FC:  0.5, negLog10P: 0.7 },
  { log2FC:  0.2, negLog10P: 1.1 }, { log2FC: -0.3, negLog10P: 0.9 },
  { log2FC:  0.7, negLog10P: 0.4 }, { log2FC: -0.5, negLog10P: 1.0 },
  { log2FC:  0.9, negLog10P: 0.8 }, { log2FC: -0.1, negLog10P: 0.5 },
  { log2FC:  0.4, negLog10P: 1.2 }, { log2FC: -0.6, negLog10P: 0.2 },
  { log2FC:  0.3, negLog10P: 0.6 }, { log2FC: -0.7, negLog10P: 1.1 },
  { log2FC:  0.8, negLog10P: 0.3 }, { log2FC: -0.2, negLog10P: 0.8 },
  { log2FC:  0.6, negLog10P: 0.9 }, { log2FC: -0.4, negLog10P: 0.4 },
  { log2FC:  0.1, negLog10P: 1.0 }, { log2FC: -0.9, negLog10P: 0.7 },
  { log2FC:  0.5, negLog10P: 0.2 }, { log2FC: -0.3, negLog10P: 1.3 },
  { log2FC:  1.2, negLog10P: 0.9 }, { log2FC: -1.3, negLog10P: 1.1 },
  { log2FC:  0.9, negLog10P: 1.4 }, { log2FC: -0.8, negLog10P: 1.5 },
  { log2FC:  1.1, negLog10P: 1.0 }, { log2FC: -1.0, negLog10P: 0.8 },
  { log2FC:  1.4, negLog10P: 0.7 }, { log2FC: -1.2, negLog10P: 1.2 },
  { log2FC:  0.8, negLog10P: 1.6 }, { log2FC: -0.7, negLog10P: 1.4 },
  { log2FC:  0.3, negLog10P: 2.1 }, { log2FC: -0.2, negLog10P: 2.5 },
  { log2FC:  0.5, negLog10P: 1.9 }, { log2FC: -0.4, negLog10P: 2.3 },
  { log2FC:  0.1, negLog10P: 1.8 }, { log2FC:  2.1, negLog10P: 2.8 },
  { log2FC: -2.5, negLog10P: 3.1 }, { log2FC:  1.8, negLog10P: 2.4 },
  { log2FC: -1.9, negLog10P: 2.7 }, { log2FC:  3.0, negLog10P: 2.2 },
  { log2FC: -3.2, negLog10P: 2.5 }, { log2FC:  2.4, negLog10P: 2.1 },
  { log2FC: -2.0, negLog10P: 3.4 }, { log2FC:  1.7, negLog10P: 2.9 },
  { log2FC: -2.8, negLog10P: 2.3 }, { log2FC:  1.0, negLog10P: 1.3 },
  { log2FC: -1.1, negLog10P: 1.4 }, { log2FC:  1.3, negLog10P: 1.2 },
  { log2FC: -0.9, negLog10P: 1.5 }, { log2FC:  1.2, negLog10P: 1.6 },
  { log2FC: -0.6, negLog10P: 2.0 }, { log2FC:  4.1, negLog10P: 4.3 },
  { log2FC: -3.8, negLog10P: 3.9 }, { log2FC:  2.7, negLog10P: 3.6 },
  { log2FC: -4.2, negLog10P: 4.8 }, { log2FC:  0.0, negLog10P: 3.2 },
]

// ── Phase 2 guide data ────────────────────────────────────────────────────────
// 22 SpCas9 guides targeting PCSK9 exon 7 + 2 non-targeting negative controls.
// Efficiencies are plausible AMP-seq CRISPResso2 output values.
// G7 is the clear winner at 84% — carries forward to Phase 3.

export const PHASE2_GUIDES: GuideResult[] = [
  { id: 'G1',   sequence: 'ACGTCAGCTGAATCGGCTAA', efficiency: 45, isControl: false, isWinner: false },
  { id: 'G2',   sequence: 'TGCAATGGCTAGCGTACGTA', efficiency: 32, isControl: false, isWinner: false },
  { id: 'G3',   sequence: 'CGAGTTCAAGCTGGACATCG', efficiency: 71, isControl: false, isWinner: false },
  { id: 'G4',   sequence: 'AATCGCTAGCGATCGATCGA', efficiency: 28, isControl: false, isWinner: false },
  { id: 'G5',   sequence: 'GCTAGCGATCAGTTGCATCG', efficiency: 52, isControl: false, isWinner: false },
  { id: 'G6',   sequence: 'TGATCGATCAGTACGATCGA', efficiency: 39, isControl: false, isWinner: false },
  { id: 'G7',   sequence: 'TGGACTCAGCGGCTGATCAA', efficiency: 84, isControl: false, isWinner: true  },
  { id: 'G8',   sequence: 'GCAGCTGATCAGTCGATCGA', efficiency: 61, isControl: false, isWinner: false },
  { id: 'G9',   sequence: 'ATCGATCAGTAGCGATCGAT', efficiency: 47, isControl: false, isWinner: false },
  { id: 'G10',  sequence: 'CGATCAGTAGCGATCGATCA', efficiency: 23, isControl: false, isWinner: false },
  { id: 'G11',  sequence: 'GATCAGTAGCGATCGATCAT', efficiency: 55, isControl: false, isWinner: false },
  { id: 'G12',  sequence: 'ATCAGTAGCGATCGATCATG', efficiency: 76, isControl: false, isWinner: false },
  { id: 'G13',  sequence: 'TCAGTAGCGATCGATCATGC', efficiency: 38, isControl: false, isWinner: false },
  { id: 'G14',  sequence: 'CAGTAGCGATCGATCATGCA', efficiency: 19, isControl: false, isWinner: false },
  { id: 'G15',  sequence: 'AGTAGCGATCGATCATGCAT', efficiency: 63, isControl: false, isWinner: false },
  { id: 'G16',  sequence: 'GTAGCGATCGATCATGCATC', efficiency: 44, isControl: false, isWinner: false },
  { id: 'G17',  sequence: 'TAGCGATCGATCATGCATCG', efficiency: 57, isControl: false, isWinner: false },
  { id: 'G18',  sequence: 'AGCGATCGATCATGCATCGA', efficiency: 68, isControl: false, isWinner: false },
  { id: 'G19',  sequence: 'GCGATCGATCATGCATCGAT', efficiency: 29, isControl: false, isWinner: false },
  { id: 'G20',  sequence: 'CGATCGATCATGCATCGATC', efficiency: 41, isControl: false, isWinner: false },
  { id: 'G21',  sequence: 'GATCGATCATGCATCGATCA', efficiency: 35, isControl: false, isWinner: false },
  { id: 'G22',  sequence: 'ATCGATCATGCATCGATCAT', efficiency: 53, isControl: false, isWinner: false },
  { id: 'Neg1', sequence: 'ACGGAGGCTAAGCGTCGCAA', efficiency:  2, isControl: true,  isWinner: false },
  { id: 'Neg2', sequence: 'GTCGATAACGAGCGCGAATG', efficiency:  1, isControl: true,  isWinner: false },
]

// ── Phase 4 results ───────────────────────────────────────────────────────────

export interface WesternBand {
  lane: string       // label, e.g. "Untreated"
  pcsk9Intensity: number  // 0–100, relative to untreated
  isWinner: boolean
}

export interface LDLUptakePoint {
  condition: string
  foldChange: number  // vs. untreated = 1.0
  isWinner: boolean
}

export interface Phase4Results {
  kind: 'functional-validation'
  westernBands: WesternBand[]
  ldlUptake: LDLUptakePoint[]
  selectedCondition: string | null
}

// ── Phase 3 LNP data ──────────────────────────────────────────────────────────
// Factorial screen: 4 ionizable lipid formulations × 3 doses.
// Readout: PCSK9 protein knockdown (%) by ELISA at 72 h post-dose.
// F3 (DOPE-enriched, 1.0 mg/kg) achieves 89% knockdown — leads to Phase 4.

export interface LNPFormulationDetail {
  ionizable: string   // ionizable lipid name
  ratio: string       // IL:DOPE:Chol:DMG-PEG2000 molar ratio
  size: number        // Z-average diameter (nm, DLS)
  pdi: number         // polydispersity index
  encapsulation: number  // % encapsulation efficiency (Ribogreen)
}

export const LNP_FORMULATION_DETAILS: Record<string, LNPFormulationDetail> = {
  F1: { ionizable: 'DLin-MC3-DMA', ratio: '50:10:38.5:1.5', size: 94,  pdi: 0.12, encapsulation: 89 },
  F2: { ionizable: 'DLin-KC2-DMA', ratio: '45:10:43.5:1.5', size: 108, pdi: 0.15, encapsulation: 85 },
  F3: { ionizable: 'DLin-MC3-DMA', ratio: '50:15:33.5:1.5', size: 82,  pdi: 0.08, encapsulation: 94 },
  F4: { ionizable: 'C12-200',      ratio: '55:10:33.5:1.5', size: 76,  pdi: 0.11, encapsulation: 91 },
}

export const PHASE3_LNP_DATA: LNPCondition[] = [
  { formulation: 'F1', dose: 0.1, knockdown: 22, isWinner: false },
  { formulation: 'F1', dose: 0.3, knockdown: 45, isWinner: false },
  { formulation: 'F1', dose: 1.0, knockdown: 71, isWinner: false },
  { formulation: 'F2', dose: 0.1, knockdown: 18, isWinner: false },
  { formulation: 'F2', dose: 0.3, knockdown: 38, isWinner: false },
  { formulation: 'F2', dose: 1.0, knockdown: 63, isWinner: false },
  { formulation: 'F3', dose: 0.1, knockdown: 31, isWinner: false },
  { formulation: 'F3', dose: 0.3, knockdown: 62, isWinner: false },
  { formulation: 'F3', dose: 1.0, knockdown: 89, isWinner: true  },
  { formulation: 'F4', dose: 0.1, knockdown: 25, isWinner: false },
  { formulation: 'F4', dose: 0.3, knockdown: 51, isWinner: false },
  { formulation: 'F4', dose: 1.0, knockdown: 78, isWinner: false },
]

// ── Phase 4 assay data ────────────────────────────────────────────────────────
// Western blot: 5 lanes quantified by densitometry (ImageJ).
// PCSK9 band intensity normalised to GAPDH, expressed as % of untreated.
// LDL-Bodipy uptake: fluorescent LDL internalisation fold-change vs. untreated.
// F3-LNP 1.0 mg/kg achieves 87% protein knockdown and 3.2x LDL uptake.

export const PHASE4_WESTERN: WesternBand[] = [
  { lane: 'Untreated',        pcsk9Intensity: 100, isWinner: false },
  { lane: 'Vehicle (PBS)',    pcsk9Intensity:  97, isWinner: false },
  { lane: 'F3 0.3 mg/kg',    pcsk9Intensity:  31, isWinner: false },
  { lane: 'F3 1.0 mg/kg',    pcsk9Intensity:  13, isWinner: true  },
  { lane: 'siRNA ctrl',       pcsk9Intensity:   8, isWinner: false },
]

export const PHASE4_LDL_UPTAKE: LDLUptakePoint[] = [
  { condition: 'Untreated',     foldChange: 1.0, isWinner: false },
  { condition: 'Vehicle (PBS)', foldChange: 1.0, isWinner: false },
  { condition: 'F3 0.3 mg/kg', foldChange: 2.1, isWinner: false },
  { condition: 'F3 1.0 mg/kg', foldChange: 3.2, isWinner: true  },
  { condition: 'siRNA ctrl',    foldChange: 3.5, isWinner: false },
]

// ── Phase 5 off-target data ───────────────────────────────────────────────────
// Cas-OFFinder top-10 predicted off-target sites for G7 (TGGACTCAGCGGCTGATCAA).
// AMP-seq at each locus: all sites pass with <1% editing; threshold is 2%.

export interface OffTargetSite {
  id: string
  chr: string
  position: string
  geneContext: string
  mismatches: number
  editingPct: number
}

export interface Phase5Results {
  kind: 'safety-screen'
  sites: OffTargetSite[]
}

export const PHASE5_OFFTARGET_DATA: OffTargetSite[] = [
  { id: 'OT-1',  chr: 'chr1',  position: '200,341,892', geneContext: 'CELSR2 (intron 8)',  mismatches: 2, editingPct: 0.8 },
  { id: 'OT-2',  chr: 'chr3',  position: '47,821,456',  geneContext: 'Intergenic',          mismatches: 2, editingPct: 0.4 },
  { id: 'OT-3',  chr: 'chr6',  position: '138,290,100', geneContext: 'SYNE1 (intron 4)',    mismatches: 3, editingPct: 0.3 },
  { id: 'OT-4',  chr: 'chr9',  position: '112,043,788', geneContext: 'Intergenic',          mismatches: 3, editingPct: 0.2 },
  { id: 'OT-5',  chr: 'chr11', position: '65,321,700',  geneContext: 'MADD (intron 2)',     mismatches: 3, editingPct: 0.6 },
  { id: 'OT-6',  chr: 'chr2',  position: '183,492,211', geneContext: 'Intergenic',          mismatches: 4, editingPct: 0.1 },
  { id: 'OT-7',  chr: 'chr14', position: '23,891,456',  geneContext: 'Intergenic',          mismatches: 4, editingPct: 0.2 },
  { id: 'OT-8',  chr: 'chr17', position: '43,821,099',  geneContext: 'Intergenic',          mismatches: 4, editingPct: 0.3 },
  { id: 'OT-9',  chr: 'chr19', position: '11,034,556',  geneContext: 'ZNF518A (intron 1)', mismatches: 4, editingPct: 0.1 },
  { id: 'OT-10', chr: 'chr22', position: '21,344,901',  geneContext: 'Intergenic',          mismatches: 5, editingPct: 0.1 },
]

// ── Program factory ───────────────────────────────────────────────────────────

export function createPCSK9Program(): Program {
  return {
    id: `pcsk9-${Date.now()}`,
    name: 'PCSK9 Gene Editing Program',
    diseaseArea: 'Cardiovascular — Hypercholesterolemia',
    targetGene: null,
    selectedGuide: null,
    selectedFormulation: null,
    confirmedEfficacy: null,
    safetyCleared: null,
    phases: [
      {
        id: 'target-validation',
        phaseNumber: 1,
        name: 'Target Validation',
        objective: 'Confirm PCSK9 is significantly dysregulated in disease hepatocytes vs. normal baseline',
        detail: 'Bulk RNA-seq comparing HepG2 cells (high PCSK9 model) vs. primary human hepatocytes. Reveals magnitude of dysregulation and validates the target before committing to guide design.',
        accentColor: '#ff6b35',
        experimentType: 'rnaseq',
        plateSamples: [
          {
            cols: [1, 2, 3, 4, 5, 6],
            label: 'HepG2 (Disease)',
            color: '#ff6b35',
            group: 'disease',
            description: 'Hepatocellular carcinoma — high endogenous PCSK9 expression model',
          },
          {
            cols: [7, 8, 9, 10, 11, 12],
            label: 'Primary Hepatocytes',
            color: '#10b981',
            group: 'normal',
            description: 'Normal adult liver cells — physiological PCSK9 baseline',
          },
        ],
        status: 'unlocked',
      },
      {
        id: 'guide-screen',
        phaseNumber: 2,
        name: 'Guide Screen',
        objective: 'Identify the most efficient CRISPR guide RNA targeting PCSK9 exon 7',
        detail: '24 candidate SpCas9 guide RNAs transfected as RNP into HepG2 cells. AMP-seq at the cut site measures editing efficiency and indel spectrum per guide. Top guide seeds Phase 3.',
        accentColor: '#00d4ff',
        experimentType: 'amplicon',
        plateSamples: [
          { cols: [1, 2],   label: 'Guides 1–4',   color: '#00d4ff', group: 'guides',   description: 'SpCas9 RNP, PAM: NGG, 20nt spacer' },
          { cols: [3, 4],   label: 'Guides 5–8',   color: '#00d4ff', group: 'guides',   description: 'SpCas9 RNP, PAM: NGG, 20nt spacer' },
          { cols: [5, 6],   label: 'Guides 9–12',  color: '#00d4ff', group: 'guides',   description: 'SpCas9 RNP, PAM: NGG, 20nt spacer' },
          { cols: [7, 8],   label: 'Guides 13–16', color: '#00d4ff', group: 'guides',   description: 'SpCas9 RNP, PAM: NGG, 20nt spacer' },
          { cols: [9, 10],  label: 'Guides 17–20', color: '#00d4ff', group: 'guides',   description: 'SpCas9 RNP, PAM: NGG, 20nt spacer' },
          { cols: [11, 12], label: 'Neg Ctrl',     color: '#475569', group: 'control',  description: 'Non-targeting control gRNA' },
        ],
        status: 'locked',
      },
      {
        id: 'delivery-opt',
        phaseNumber: 3,
        name: 'Delivery Optimization',
        objective: 'Identify the optimal LNP formulation and dose for hepatic in vivo delivery of CRISPR RNP',
        detail: 'Factorial screen of 4 ionizable lipid formulations × 3 IV doses (0.1, 0.3, 1.0 mg/kg) in C57BL/6 mice. PCSK9 protein knockdown measured by ELISA at 72 h. Lead formulation advances to efficacy validation.',
        accentColor: '#a855f7',
        experimentType: 'massspec',
        plateSamples: [
          { cols: [1, 2],   label: 'F1 (MC3)',       color: '#7c3aed', group: 'F1', description: 'DLin-MC3-DMA 50:10:38.5:1.5 — standard benchmark' },
          { cols: [3, 4],   label: 'F2 (KC2)',        color: '#9333ea', group: 'F2', description: 'DLin-KC2-DMA 45:10:43.5:1.5 — high cholesterol' },
          { cols: [5, 6],   label: 'F3 (DOPE+)',      color: '#a855f7', group: 'F3', description: 'DLin-MC3-DMA 50:15:33.5:1.5 — DOPE-enriched' },
          { cols: [7, 8],   label: 'F4 (C12-200)',    color: '#c084fc', group: 'F4', description: 'C12-200 55:10:33.5:1.5 — high ionizable lipid' },
          { cols: [9, 10],  label: 'Vehicle Ctrl',    color: '#334155', group: 'vehicle',   description: 'PBS — no LNP' },
          { cols: [11, 12], label: 'Untreated',       color: '#1e293b', group: 'untreated', description: 'Naive liver — baseline PCSK9' },
        ],
        status: 'locked',
      },
      {
        id: 'functional-validation',
        phaseNumber: 4,
        name: 'Functional Validation',
        objective: 'Confirm PCSK9 protein knockdown and rescue of LDL receptor-mediated uptake in hepatocytes',
        detail: 'Western blot quantifies PCSK9 protein reduction vs. loading control (GAPDH). LDL-Bodipy fluorescent uptake assay measures LDLR rescue. Pass criteria: ≥80% protein knockdown, ≥2.5x LDL uptake vs. untreated.',
        accentColor: '#10b981',
        experimentType: 'massspec',
        plateSamples: [
          { cols: [1, 2],   label: 'Untreated',      color: '#334155', group: 'untreated', description: 'Naive HepG2 cells — PCSK9 baseline' },
          { cols: [3, 4],   label: 'Vehicle (PBS)',   color: '#475569', group: 'vehicle',   description: 'PBS injection, no LNP — procedural control' },
          { cols: [5, 6],   label: 'F3 0.3 mg/kg',   color: '#059669', group: 'low-dose',  description: 'F3-LNP sub-therapeutic dose' },
          { cols: [7, 8],   label: 'F3 1.0 mg/kg',   color: '#10b981', group: 'high-dose', description: 'F3-LNP lead dose — primary test article' },
          { cols: [9, 10],  label: 'siRNA ctrl',      color: '#34d399', group: 'posctrl',   description: 'Validated PCSK9 siRNA — positive knockdown control' },
          { cols: [11, 12], label: 'Mock transfect',  color: '#1e293b', group: 'mock',      description: 'Transfection reagent only — cytotoxicity control' },
        ],
        status: 'locked',
      },
      {
        id: 'safety-screen',
        phaseNumber: 5,
        name: 'Off-Target Safety',
        objective: 'Confirm guide specificity — <1% editing at top 10 predicted off-target loci',
        detail: 'AMP-seq at Cas-OFFinder-predicted off-target sites. Any site with >2% editing triggers guide deprioritization or switch to high-fidelity Cas9 variant.',
        accentColor: '#f59e0b',
        experimentType: 'amplicon',
        plateSamples: [
          { cols: [1, 2],   label: 'OT-1 to OT-2',  color: '#f59e0b', group: 'ot-12',    description: '2-mismatch loci — highest predicted risk' },
          { cols: [3, 4],   label: 'OT-3 to OT-4',  color: '#f59e0b', group: 'ot-34',    description: '3-mismatch loci' },
          { cols: [5, 6],   label: 'OT-5 to OT-6',  color: '#d97706', group: 'ot-56',    description: '3-mismatch loci' },
          { cols: [7, 8],   label: 'OT-7 to OT-8',  color: '#b45309', group: 'ot-78',    description: '4-mismatch loci' },
          { cols: [9, 10],  label: 'OT-9 to OT-10', color: '#92400e', group: 'ot-910',   description: '4–5 mismatch loci' },
          { cols: [11, 12], label: 'On-target ctrl', color: '#10b981', group: 'ontarget', description: 'G7 PCSK9 exon 7 — positive editing control' },
        ],
        status: 'locked',
      },
    ],
  }
}
