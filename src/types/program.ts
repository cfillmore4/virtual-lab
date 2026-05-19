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

export type PhaseResults = Phase1Results

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

// ── Program factory ───────────────────────────────────────────────────────────

export function createPCSK9Program(): Program {
  return {
    id: `pcsk9-${Date.now()}`,
    name: 'PCSK9 Gene Editing Program',
    diseaseArea: 'Cardiovascular — Hypercholesterolemia',
    targetGene: null,
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
        objective: 'Find optimal LNP formulation for hepatic in vivo delivery of PCSK9-targeting RNP',
        detail: 'Factorial screen: 4 ionizable lipid molar ratios × 3 doses = 12 conditions per replicate. Transfection efficiency measured by GFP reporter fluorescence readout.',
        accentColor: '#a855f7',
        experimentType: 'rnaseq',
        plateSamples: [],
        status: 'locked',
      },
      {
        id: 'functional-validation',
        phaseNumber: 4,
        name: 'Functional Validation',
        objective: 'Confirm PCSK9 protein knockdown and rescue of LDL receptor-mediated uptake',
        detail: 'Western blot for PCSK9 protein level + LDL-Bodipy fluorescent uptake assay in edited vs. unedited cells. Target: >80% protein reduction, normalized LDL uptake.',
        accentColor: '#10b981',
        experimentType: 'massspec',
        plateSamples: [],
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
        plateSamples: [],
        status: 'locked',
      },
    ],
  }
}
