export type ExperimentType = 'amplicon' | 'rnaseq' | 'scrna' | 'massspec'
export type AppScreen = 'landing' | 'select' | 'plate' | 'animation' | 'report'

export interface Well {
  id: string      // e.g. "A1", "B3"
  row: string     // A–H
  col: number     // 1–12
  sampleName: string
  groupColor: string
  filled: boolean
}

export interface AnimationStep {
  id: string
  label: string
  duration: number // seconds
}

export interface ExperimentConfig {
  id: ExperimentType
  name: string
  shortName: string
  description: string
  accentColor: string
  glowClass: string
  textGlowClass: string
  cardGlowClass: string
  instruments: string[]
  prepTime: string
  outputType: string
  steps: AnimationStep[]
}

export const EXPERIMENT_CONFIGS: Record<ExperimentType, ExperimentConfig> = {
  amplicon: {
    id: 'amplicon',
    name: 'Amplicon Sequencing',
    shortName: 'Amplicon Seq',
    description: '16S/18S/ITS amplicon sequencing for microbiome & community profiling',
    accentColor: '#00d4ff',
    glowClass: 'border-[#00d4ff]',
    textGlowClass: 'text-glow-cyan',
    cardGlowClass: 'card-glow-cyan',
    instruments: ['Hamilton STAR', 'BioRad C1000', 'Illumina MiSeq'],
    prepTime: '4–6 hours',
    outputType: 'FASTQ files',
    steps: [
      { id: 'tips',       label: 'Loading sterile pipette tips',      duration: 3 },
      { id: 'dna',        label: 'Transferring DNA samples to plate',  duration: 4 },
      { id: 'pcr-mix',    label: 'Adding PCR master mix',              duration: 3 },
      { id: 'thermocycle',label: 'PCR amplification — 35 cycles',      duration: 6 },
      { id: 'cleanup',    label: 'Bead cleanup & library indexing',    duration: 4 },
      { id: 'sequence',   label: 'Illumina MiSeq sequencing run',      duration: 6 },
    ],
  },
  rnaseq: {
    id: 'rnaseq',
    name: 'RNA Sequencing',
    shortName: 'RNA-seq',
    description: 'Bulk transcriptome profiling for differential gene expression analysis',
    accentColor: '#ff6b35',
    glowClass: 'border-[#ff6b35]',
    textGlowClass: 'text-glow-orange',
    cardGlowClass: 'card-glow-orange',
    instruments: ['Hamilton STAR', 'Agilent TapeStation', 'Illumina NovaSeq'],
    prepTime: '6–8 hours',
    outputType: 'FASTQ + count matrices',
    steps: [
      { id: 'tips',        label: 'Loading sterile pipette tips',        duration: 3 },
      { id: 'rna',         label: 'Transferring RNA samples',            duration: 4 },
      { id: 'depletion',   label: 'rRNA depletion & fragmentation',      duration: 4 },
      { id: 'qc',          label: 'QC on Agilent TapeStation',           duration: 5 },
      { id: 'cdna',        label: 'cDNA synthesis & adapter ligation',   duration: 4 },
      { id: 'sequence',    label: 'NovaSeq 6000 sequencing run',         duration: 6 },
    ],
  },
  scrna: {
    id: 'scrna',
    name: 'Single-Cell RNA-seq',
    shortName: 'scRNA-seq',
    description: '10x Genomics single-cell transcriptomics at cellular resolution',
    accentColor: '#7c3aed',
    glowClass: 'border-[#7c3aed]',
    textGlowClass: 'text-glow-purple',
    cardGlowClass: 'card-glow-purple',
    instruments: ['Hamilton STAR', '10x Chromium X', 'Illumina NovaSeq X'],
    prepTime: '8–10 hours',
    outputType: 'Cell × gene matrices',
    steps: [
      { id: 'tips',       label: 'Loading sterile pipette tips',          duration: 3 },
      { id: 'cells',      label: 'Single-cell suspension preparation',    duration: 4 },
      { id: 'chromium',   label: 'GEM generation on 10x Chromium X',      duration: 6 },
      { id: 'barcoding',  label: 'Cell barcoding & UMI tagging',          duration: 4 },
      { id: 'library',    label: 'Library amplification & QC',            duration: 4 },
      { id: 'sequence',   label: 'Deep sequencing — NovaSeq X',           duration: 6 },
    ],
  },
  massspec: {
    id: 'massspec',
    name: 'Mass Spectrometry',
    shortName: 'Mass Spec',
    description: 'LC-MS/MS proteomics for deep protein identification and quantification',
    accentColor: '#10b981',
    glowClass: 'border-[#10b981]',
    textGlowClass: 'text-glow-green',
    cardGlowClass: 'card-glow-green',
    instruments: ['Hamilton STAR', 'Thermo SpeedVac', 'Orbitrap Eclipse'],
    prepTime: '8–12 hours',
    outputType: 'mzML + protein groups',
    steps: [
      { id: 'tips',       label: 'Loading sterile pipette tips',          duration: 3 },
      { id: 'digest',     label: 'Protein digestion with trypsin',        duration: 4 },
      { id: 'desalt',     label: 'Sample desalting & cleanup',            duration: 4 },
      { id: 'speedvac',   label: 'SpeedVac concentration',                duration: 5 },
      { id: 'lc',         label: 'LC peptide separation',                 duration: 4 },
      { id: 'ms',         label: 'Orbitrap MS/MS data acquisition',       duration: 6 },
    ],
  },
}
