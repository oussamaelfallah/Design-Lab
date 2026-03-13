"use client";

import { useRef, useState } from "react";
import styles from "./worker-app.module.css";
import { WorkerAppHomeBottomBarScreen } from "./screens/home-bottom-bar-screen";
import { WorkerAppNavigationScreen } from "./screens/navigation-screen";
import { WorkerAppStatusBar } from "./screens/status-bar";

type SyncStatus = "idle" | "syncing" | "synced" | "error";
const syncStatusIconMap: Record<SyncStatus, string> = {
  idle: "cloud",
  syncing: "cloud",
  synced: "cloud_done",
  error: "cloud_alert",
};

type WorkerAppPostFixePageProps = {
  showDeviceFrame: boolean;
  theme: "dark" | "light";
  frameView: SecteursFrameView;
};

export type SecteursFrameView = "data" | "loading" | "empty";

type PosteFixeItem = {
  name: string;
  sector: string;
  startDate: string;
  lastUpdate: string;
  campaign: string;
  progress: 0 | 20 | 40 | 60 | 80 | 100;
};

type ObservationItem = {
  name: string;
  lastUpdate: string;
  icon: string;
  status: "Pas commencé" | "Terminé" | "En cours";
  tone: "violet" | "blue" | "orange" | "teal" | "rose";
};

type PosteStatus = "Pas commencé" | "En cours" | "Terminé";
type FleuraisonNoteType = "Début" | "Suivi" | "Finale";
type ObservationPhaseName = "Fleuraison" | "Nouaison" | "Chute physiologique";
type ObservationSecondaryMode = "input" | "chips";

type FleuraisonFormState = {
  noteType: FleuraisonNoteType;
  observationDate: string;
  densityValue: string;
  secondaryValue: string;
  notes: string;
  images: string[];
};

type FleuraisonNote = FleuraisonFormState & {
  id: string;
  savedAt: string;
};

function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const observationPhaseConfigs: Record<
  ObservationPhaseName,
  {
    title: string;
    densityLabel: string;
    densityOptions: string[];
    secondaryLabel: string;
    secondaryMode: ObservationSecondaryMode;
    secondaryOptions?: string[];
    emptySubtitle: string;
  }
> = {
  Fleuraison: {
    title: "Fleuraison",
    densityLabel: "Densité florale",
    densityOptions: ["Très forte", "Forte", "Moyenne", "Faible"],
    secondaryLabel: "Nombre de vagues",
    secondaryMode: "input",
    emptySubtitle: "Ajoutez votre première observation de floraison.",
  },
  Nouaison: {
    title: "Nouaison",
    densityLabel: "Densité de jeunes fruits",
    densityOptions: ["Élevée", "Moyenne", "Faible"],
    secondaryLabel: "Homogénéité",
    secondaryMode: "chips",
    secondaryOptions: ["90%", "75%", "50%", "25%"],
    emptySubtitle: "Ajoutez votre première observation de nouaison.",
  },
  "Chute physiologique": {
    title: "Chute physiologique",
    densityLabel: "Intensité de la chute",
    densityOptions: ["Faible", "Moyenne", "Forte", "Excessive"],
    secondaryLabel: "Homogénéité",
    secondaryMode: "chips",
    secondaryOptions: ["90%", "75%", "50%", "25%"],
    emptySubtitle: "Ajoutez votre première observation de chute physiologique.",
  },
};

const observationNoteTypeOrder: Record<FleuraisonNoteType, number> = {
  Finale: 0,
  Suivi: 1,
  "Début": 2,
};

function isObservationPhaseName(value: string): value is ObservationPhaseName {
  return value in observationPhaseConfigs;
}

function getObservationNotesKey(posteName: string, phaseName: ObservationPhaseName): string {
  return `${posteName}::${phaseName}`;
}

function createDefaultFleuraisonForm(
  phaseName: ObservationPhaseName,
  noteType: FleuraisonNoteType = "Suivi"
): FleuraisonFormState {
  const phaseConfig = observationPhaseConfigs[phaseName];
  return {
    noteType,
    observationDate: getTodayIsoDate(),
    densityValue: phaseConfig.densityOptions[0] ?? "",
    secondaryValue:
      phaseConfig.secondaryMode === "input"
        ? "0"
        : (phaseConfig.secondaryOptions?.[0] ?? ""),
    notes: "",
    images: [],
  };
}

const defaultFleuraisonForm: FleuraisonFormState = createDefaultFleuraisonForm(
  "Fleuraison",
  "Suivi"
);
const fleuraisonSeedImage = "/notesimages/istockphoto-1147544807-612x612.jpg";

function createSeedFleuraisonNotes(posteId: string): FleuraisonNote[] {
  return [
    {
      id: `${posteId}-fleuraison-1`,
      savedAt: "12 mars 2026",
      noteType: "Début",
      observationDate: "2026-03-12",
      densityValue: "Faible",
      secondaryValue: "0",
      notes: "Premières fleurs observées sur la parcelle nord.",
      images: [],
    },
    {
      id: `${posteId}-fleuraison-2`,
      savedAt: "15 mars 2026",
      noteType: "Suivi",
      observationDate: "2026-03-15",
      densityValue: "Moyenne",
      secondaryValue: "1",
      notes: "Floraison en progression, répartition plus homogène.",
      images: [fleuraisonSeedImage, fleuraisonSeedImage],
    },
    {
      id: `${posteId}-fleuraison-3`,
      savedAt: "18 mars 2026",
      noteType: "Suivi",
      observationDate: "2026-03-18",
      densityValue: "Forte",
      secondaryValue: "2",
      notes: "Pic de floraison sur la zone centrale.",
      images: [fleuraisonSeedImage, fleuraisonSeedImage, fleuraisonSeedImage],
    },
    {
      id: `${posteId}-fleuraison-4`,
      savedAt: "22 mars 2026",
      noteType: "Suivi",
      observationDate: "2026-03-22",
      densityValue: "Très forte",
      secondaryValue: "3",
      notes: "Maximum atteint, forte présence de fleurs ouvertes.",
      images: [fleuraisonSeedImage, fleuraisonSeedImage, fleuraisonSeedImage, fleuraisonSeedImage],
    },
    {
      id: `${posteId}-fleuraison-5`,
      savedAt: "28 mars 2026",
      noteType: "Finale",
      observationDate: "2026-03-28",
      densityValue: "Faible",
      secondaryValue: "4",
      notes: "Fin de floraison observée, chute nette des nouvelles fleurs.",
      images: [fleuraisonSeedImage, fleuraisonSeedImage],
    },
  ];
}

function createSeedNouaisonNotes(
  posteId: string,
  status: ObservationItem["status"]
): FleuraisonNote[] {
  if (status === "Pas commencé") {
    return [];
  }

  const baseNotes: FleuraisonNote[] = [
    {
      id: `${posteId}-nouaison-1`,
      savedAt: "03 avr. 2026",
      noteType: "Début",
      observationDate: "2026-04-03",
      densityValue: "Faible",
      secondaryValue: "25%",
      notes: "Premiers jeunes fruits observés sur les rangs extérieurs.",
      images: [],
    },
    {
      id: `${posteId}-nouaison-2`,
      savedAt: "08 avr. 2026",
      noteType: "Suivi",
      observationDate: "2026-04-08",
      densityValue: "Moyenne",
      secondaryValue: "75%",
      notes: "Nouaison mieux répartie sur l'ensemble de la parcelle.",
      images: [fleuraisonSeedImage],
    },
  ];

  if (status === "En cours") {
    return baseNotes;
  }

  return [
    ...baseNotes,
    {
      id: `${posteId}-nouaison-3`,
      savedAt: "14 avr. 2026",
      noteType: "Finale",
      observationDate: "2026-04-14",
      densityValue: "Élevée",
      secondaryValue: "90%",
      notes: "Phase de nouaison stabilisée avec une homogénéité élevée.",
      images: [fleuraisonSeedImage, fleuraisonSeedImage],
    },
  ];
}

function createSeedChuteNotes(
  posteId: string,
  status: ObservationItem["status"]
): FleuraisonNote[] {
  if (status === "Pas commencé") {
    return [];
  }

  const baseNotes: FleuraisonNote[] = [
    {
      id: `${posteId}-chute-1`,
      savedAt: "05 mai 2026",
      noteType: "Début",
      observationDate: "2026-05-05",
      densityValue: "Faible",
      secondaryValue: "50%",
      notes: "Début de chute physiologique observé sur les fruits les plus petits.",
      images: [],
    },
    {
      id: `${posteId}-chute-2`,
      savedAt: "10 mai 2026",
      noteType: "Suivi",
      observationDate: "2026-05-10",
      densityValue: "Forte",
      secondaryValue: "75%",
      notes: "Chute plus marquée sur la zone centrale du poste fixe.",
      images: [fleuraisonSeedImage],
    },
  ];

  if (status === "En cours") {
    return baseNotes;
  }

  return [
    ...baseNotes,
    {
      id: `${posteId}-chute-3`,
      savedAt: "16 mai 2026",
      noteType: "Finale",
      observationDate: "2026-05-16",
      densityValue: "Moyenne",
      secondaryValue: "90%",
      notes: "Fin de phase avec stabilisation du niveau de chute.",
      images: [fleuraisonSeedImage, fleuraisonSeedImage],
    },
  ];
}

const initialObservationNotesByKey: Record<string, FleuraisonNote[]> = {
  [getObservationNotesKey("Poste Fixe 2381", "Fleuraison")]: createSeedFleuraisonNotes("2381"),
  [getObservationNotesKey("Poste Fixe 7642", "Fleuraison")]: createSeedFleuraisonNotes("7642"),
  [getObservationNotesKey("Poste Fixe 5097", "Fleuraison")]: createSeedFleuraisonNotes("5097"),
  [getObservationNotesKey("Poste Fixe 3318", "Fleuraison")]: createSeedFleuraisonNotes("3318"),
  [getObservationNotesKey("Poste Fixe 9026", "Fleuraison")]: createSeedFleuraisonNotes("9026"),
  [getObservationNotesKey("Poste Fixe 4473", "Fleuraison")]: createSeedFleuraisonNotes("4473"),
  [getObservationNotesKey("Poste Fixe 7642", "Nouaison")]: createSeedNouaisonNotes(
    "7642",
    "Terminé"
  ),
  [getObservationNotesKey("Poste Fixe 5097", "Nouaison")]: createSeedNouaisonNotes(
    "5097",
    "Terminé"
  ),
  [getObservationNotesKey("Poste Fixe 3318", "Nouaison")]: createSeedNouaisonNotes(
    "3318",
    "Terminé"
  ),
  [getObservationNotesKey("Poste Fixe 9026", "Nouaison")]: createSeedNouaisonNotes(
    "9026",
    "Terminé"
  ),
  [getObservationNotesKey("Poste Fixe 4473", "Nouaison")]: createSeedNouaisonNotes(
    "4473",
    "Terminé"
  ),
  [getObservationNotesKey("Poste Fixe 5097", "Chute physiologique")]: createSeedChuteNotes(
    "5097",
    "Terminé"
  ),
  [getObservationNotesKey("Poste Fixe 3318", "Chute physiologique")]: createSeedChuteNotes(
    "3318",
    "Terminé"
  ),
  [getObservationNotesKey("Poste Fixe 9026", "Chute physiologique")]: createSeedChuteNotes(
    "9026",
    "Terminé"
  ),
};

type PosteConfig = {
  irrigationType: string;
  waterSource: string;
  waterQuality: string;
};

const postesFixes: PosteFixeItem[] = [
  {
    name: "Poste Fixe 1254",
    sector: "Secteur S1",
    startDate: "01 Mai",
    lastUpdate: "21 Juil",
    campaign: "2025-2026",
    progress: 0,
  },
  {
    name: "Poste Fixe 2381",
    sector: "Secteur S2",
    startDate: "05 Mai",
    lastUpdate: "14 Juil",
    campaign: "2025-2026",
    progress: 20,
  },
  {
    name: "Poste Fixe 7642",
    sector: "Secteur S3",
    startDate: "12 Mai",
    lastUpdate: "08 Juil",
    campaign: "2025-2026",
    progress: 40,
  },
  {
    name: "Poste Fixe 5097",
    sector: "Secteur S4",
    startDate: "20 Mai",
    lastUpdate: "27 Juil",
    campaign: "2025-2026",
    progress: 60,
  },
  {
    name: "Poste Fixe 3318",
    sector: "Secteur S5",
    startDate: "24 Mai",
    lastUpdate: "02 Août",
    campaign: "2025-2026",
    progress: 80,
  },
  {
    name: "Poste Fixe 9026",
    sector: "Secteur S6",
    startDate: "28 Mai",
    lastUpdate: "30 Juil",
    campaign: "2025-2026",
    progress: 100,
  },
  {
    name: "Poste Fixe 4473",
    sector: "Secteur S7",
    startDate: "03 Juin",
    lastUpdate: "11 Juil",
    campaign: "2025-2026",
    progress: 40,
  },
  {
    name: "Poste Fixe 6880",
    sector: "Secteur S8",
    startDate: "07 Juin",
    lastUpdate: "06 Juil",
    campaign: "2025-2026",
    progress: 0,
  },
];

const posteObservationsByPoste: Record<string, ObservationItem[]> = {
  "Poste Fixe 1254": [
    {
      name: "Fleuraison",
      lastUpdate: "15 Mai",
      icon: "local_florist",
      status: "Pas commencé",
      tone: "violet",
    },
    {
      name: "Nouaison",
      lastUpdate: "10 Juin",
      icon: "grain",
      status: "Pas commencé",
      tone: "blue",
    },
    {
      name: "Chute physiologique",
      lastUpdate: "21 Juil",
      icon: "eco",
      status: "Pas commencé",
      tone: "orange",
    },
    {
      name: "Fertilisation",
      lastUpdate: "18 Juil",
      icon: "science",
      status: "Pas commencé",
      tone: "teal",
    },
    {
      name: "Irrigation",
      lastUpdate: "20 Juil",
      icon: "water_drop",
      status: "Pas commencé",
      tone: "rose",
    },
  ],
  "Poste Fixe 2381": [
    {
      name: "Fleuraison",
      lastUpdate: "15 Mai",
      icon: "local_florist",
      status: "Terminé",
      tone: "violet",
    },
    {
      name: "Nouaison",
      lastUpdate: "10 Juin",
      icon: "grain",
      status: "Pas commencé",
      tone: "blue",
    },
    {
      name: "Chute physiologique",
      lastUpdate: "21 Juil",
      icon: "eco",
      status: "Pas commencé",
      tone: "orange",
    },
    {
      name: "Fertilisation",
      lastUpdate: "18 Juil",
      icon: "science",
      status: "Pas commencé",
      tone: "teal",
    },
    {
      name: "Irrigation",
      lastUpdate: "20 Juil",
      icon: "water_drop",
      status: "Pas commencé",
      tone: "rose",
    },
  ],
  "Poste Fixe 7642": [
    {
      name: "Fleuraison",
      lastUpdate: "15 Mai",
      icon: "local_florist",
      status: "Terminé",
      tone: "violet",
    },
    {
      name: "Nouaison",
      lastUpdate: "10 Juin",
      icon: "grain",
      status: "Terminé",
      tone: "blue",
    },
    {
      name: "Chute physiologique",
      lastUpdate: "21 Juil",
      icon: "eco",
      status: "Pas commencé",
      tone: "orange",
    },
    {
      name: "Fertilisation",
      lastUpdate: "18 Juil",
      icon: "science",
      status: "Pas commencé",
      tone: "teal",
    },
    {
      name: "Irrigation",
      lastUpdate: "20 Juil",
      icon: "water_drop",
      status: "Pas commencé",
      tone: "rose",
    },
  ],
  "Poste Fixe 5097": [
    {
      name: "Fleuraison",
      lastUpdate: "15 Mai",
      icon: "local_florist",
      status: "Terminé",
      tone: "violet",
    },
    { name: "Nouaison", lastUpdate: "10 Juin", icon: "grain", status: "Terminé", tone: "blue" },
    {
      name: "Chute physiologique",
      lastUpdate: "21 Juil",
      icon: "eco",
      status: "Terminé",
      tone: "orange",
    },
    {
      name: "Fertilisation",
      lastUpdate: "18 Juil",
      icon: "science",
      status: "Pas commencé",
      tone: "teal",
    },
    {
      name: "Irrigation",
      lastUpdate: "20 Juil",
      icon: "water_drop",
      status: "Pas commencé",
      tone: "rose",
    },
  ],
  "Poste Fixe 3318": [
    {
      name: "Fleuraison",
      lastUpdate: "15 Mai",
      icon: "local_florist",
      status: "Terminé",
      tone: "violet",
    },
    { name: "Nouaison", lastUpdate: "10 Juin", icon: "grain", status: "Terminé", tone: "blue" },
    {
      name: "Chute physiologique",
      lastUpdate: "21 Juil",
      icon: "eco",
      status: "Terminé",
      tone: "orange",
    },
    {
      name: "Fertilisation",
      lastUpdate: "18 Juil",
      icon: "science",
      status: "Terminé",
      tone: "teal",
    },
    {
      name: "Irrigation",
      lastUpdate: "20 Juil",
      icon: "water_drop",
      status: "Pas commencé",
      tone: "rose",
    },
  ],
  "Poste Fixe 9026": [
    {
      name: "Fleuraison",
      lastUpdate: "19 Mai",
      icon: "local_florist",
      status: "Terminé",
      tone: "violet",
    },
    { name: "Nouaison", lastUpdate: "22 Juin", icon: "grain", status: "Terminé", tone: "blue" },
    {
      name: "Chute physiologique",
      lastUpdate: "12 Juil",
      icon: "eco",
      status: "Terminé",
      tone: "orange",
    },
    {
      name: "Fertilisation",
      lastUpdate: "18 Juil",
      icon: "science",
      status: "Terminé",
      tone: "teal",
    },
    {
      name: "Irrigation",
      lastUpdate: "30 Juil",
      icon: "water_drop",
      status: "Terminé",
      tone: "rose",
    },
  ],
  "Poste Fixe 4473": [
    {
      name: "Fleuraison",
      lastUpdate: "16 Mai",
      icon: "local_florist",
      status: "Terminé",
      tone: "violet",
    },
    { name: "Nouaison", lastUpdate: "09 Juin", icon: "grain", status: "Terminé", tone: "blue" },
    {
      name: "Chute physiologique",
      lastUpdate: "11 Juil",
      icon: "eco",
      status: "Pas commencé",
      tone: "orange",
    },
    {
      name: "Fertilisation",
      lastUpdate: "11 Juil",
      icon: "science",
      status: "Pas commencé",
      tone: "teal",
    },
    {
      name: "Irrigation",
      lastUpdate: "11 Juil",
      icon: "water_drop",
      status: "Pas commencé",
      tone: "rose",
    },
  ],
  "Poste Fixe 6880": [
    {
      name: "Fleuraison",
      lastUpdate: "05 Juin",
      icon: "local_florist",
      status: "Pas commencé",
      tone: "violet",
    },
    {
      name: "Nouaison",
      lastUpdate: "05 Juin",
      icon: "grain",
      status: "Pas commencé",
      tone: "blue",
    },
    {
      name: "Chute physiologique",
      lastUpdate: "06 Juil",
      icon: "eco",
      status: "Pas commencé",
      tone: "orange",
    },
    {
      name: "Fertilisation",
      lastUpdate: "06 Juil",
      icon: "science",
      status: "Pas commencé",
      tone: "teal",
    },
    {
      name: "Irrigation",
      lastUpdate: "06 Juil",
      icon: "water_drop",
      status: "Pas commencé",
      tone: "rose",
    },
  ],
};

const defaultPosteObservations = posteObservationsByPoste["Poste Fixe 1254"];

function getPosteObservations(posteName: string): ObservationItem[] {
  return posteObservationsByPoste[posteName] ?? defaultPosteObservations;
}

function getCompletedCount(observations: ObservationItem[]): number {
  return observations.filter((observation) => observation.status === "Terminé").length;
}

function getProgressFromObservations(observations: ObservationItem[]): number {
  if (observations.length === 0) {
    return 0;
  }

  return Math.round((getCompletedCount(observations) / observations.length) * 100);
}

function getPosteStatus(progress: number): PosteStatus {
  if (progress === 100) {
    return "Terminé";
  }
  if (progress === 0) {
    return "Pas commencé";
  }

  return "En cours";
}

function parseIsoDateToTime(dateIso: string): number {
  return new Date(`${dateIso}T00:00:00`).getTime();
}

function formatDateShortFr(dateIso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(`${dateIso}T00:00:00`));
}

function formatDateLongFr(dateIso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${dateIso}T00:00:00`));
}

function getObservationDerivedStatus(notes: FleuraisonNote[]): ObservationItem["status"] {
  if (notes.length === 0) {
    return "Pas commencé";
  }
  if (notes.some((note) => note.noteType === "Finale")) {
    return "Terminé";
  }

  return "En cours";
}

function getNextObservationNoteType(notes: FleuraisonNote[]): FleuraisonNoteType {
  if (!notes.some((note) => note.noteType === "Début")) {
    return "Début";
  }

  return "Suivi";
}

const observationToneClasses = {
  violet: styles.observationToneViolet,
  blue: styles.observationToneBlue,
  orange: styles.observationToneOrange,
  teal: styles.observationToneTeal,
  rose: styles.observationToneRose,
} as const;

const irrigationOptions = [
  "Goutte-à-goutte en surface",
  "Goutte-à-goutte enterré",
  "Micro-aspersion",
];
const loadingCardSkeletons = [
  { title: 50, subtitle: 40, date: 67, meta: 80, progress: 100 },
  { title: 56, subtitle: 44, date: 63, meta: 74, progress: 100 },
  { title: 48, subtitle: 36, date: 69, meta: 82, progress: 100 },
  { title: 53, subtitle: 42, date: 61, meta: 77, progress: 100 },
  { title: 46, subtitle: 38, date: 66, meta: 79, progress: 100 },
] as const;
const waterSourceOptions = ["Forage", "Réseau", "Barrage"];
const waterQualityOptions = ["Bonne", "Moyenne", "Faible"];
const emptyPosteConfig: PosteConfig = {
  irrigationType: "",
  waterSource: "",
  waterQuality: "",
};
const defaultPosteConfig: PosteConfig = {
  irrigationType: "Goutte-à-goutte en surface",
  waterSource: "Forage",
  waterQuality: "Bonne",
};
const initialPosteConfigs: Record<string, PosteConfig> = {
  "Poste Fixe 1254": {
    irrigationType: "Goutte-à-goutte en surface",
    waterSource: "Forage",
    waterQuality: "Bonne",
  },
  "Poste Fixe 5097": {
    irrigationType: "Micro-aspersion",
    waterSource: "Réseau",
    waterQuality: "Moyenne",
  },
};

export function WorkerAppPostFixePage({
  showDeviceFrame,
  theme,
  frameView,
}: WorkerAppPostFixePageProps) {
  const syncStatus: SyncStatus = "idle";
  const [selectedPoste, setSelectedPoste] = useState<PosteFixeItem | null>(null);
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [posteConfigs, setPosteConfigs] =
    useState<Record<string, PosteConfig>>(initialPosteConfigs);
  const [configDraft, setConfigDraft] = useState<PosteConfig>(defaultPosteConfig);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [selectedObservation, setSelectedObservation] = useState<ObservationItem | null>(null);
  const [isAddingFleuraisonNote, setIsAddingFleuraisonNote] = useState(true);
  const [editingFleuraisonNoteId, setEditingFleuraisonNoteId] = useState<string | null>(null);
  const [selectedFleuraisonNoteId, setSelectedFleuraisonNoteId] = useState<string | null>(null);
  const [deleteConfirmNoteId, setDeleteConfirmNoteId] = useState<string | null>(null);
  const [imageViewer, setImageViewer] = useState<{ images: string[]; index: number } | null>(null);
  const fleuraisonImageInputRef = useRef<HTMLInputElement | null>(null);
  const imageViewerTouchStartXRef = useRef<number | null>(null);
  const [observationNotesByKey, setObservationNotesByKey] = useState<
    Record<string, FleuraisonNote[]>
  >(initialObservationNotesByKey);
  const [fleuraisonForm, setFleuraisonForm] = useState<FleuraisonFormState>(defaultFleuraisonForm);
  const syncBadgeStateClass = styles.syncBadgeIdle;
  const syncIcon = syncStatusIconMap[syncStatus];
  const renderSyncBadge = () => (
    <div className={`${styles.syncBadge} ${syncBadgeStateClass}`} role="img" aria-label="Synchronisation inactive">
      <span className={styles.googleSymbol} aria-hidden="true">
        {syncIcon}
      </span>
    </div>
  );
  const frameClass = theme === "light" ? styles.androidCanvasLightFrame : styles.androidCanvas;
  const isConfigEditScreen = Boolean(selectedPoste && isEditingConfig);
  const selectedObservationPhaseName: ObservationPhaseName | null =
    selectedObservation != null && isObservationPhaseName(selectedObservation.name)
      ? selectedObservation.name
      : null;
  const activeObservationPhaseName = selectedObservationPhaseName ?? "Fleuraison";
  const activeObservationPhaseConfig = observationPhaseConfigs[activeObservationPhaseName];
  const isObservationScreen = Boolean(selectedPoste && selectedObservationPhaseName);
  const isFullScreenFlow = isConfigEditScreen || isObservationScreen;
  const selectedObservationNotesKey =
    selectedPoste != null && selectedObservationPhaseName != null
      ? getObservationNotesKey(selectedPoste.name, selectedObservationPhaseName)
      : null;
  const selectedPosteFleuraisonNotes =
    selectedObservationNotesKey != null ? (observationNotesByKey[selectedObservationNotesKey] ?? []) : [];
  const selectedPosteFleuraisonNotesSorted = [...selectedPosteFleuraisonNotes].sort(
    (firstNote, secondNote) => {
      const typeOrderDelta =
        observationNoteTypeOrder[firstNote.noteType] - observationNoteTypeOrder[secondNote.noteType];

      if (typeOrderDelta !== 0) {
        return typeOrderDelta;
      }

      return (
        parseIsoDateToTime(secondNote.observationDate) - parseIsoDateToTime(firstNote.observationDate)
      );
    }
  );
  const shouldShowFleuraisonForm = isAddingFleuraisonNote;
  const shouldShowFleuraisonEmptyState =
    !shouldShowFleuraisonForm && selectedPosteFleuraisonNotes.length === 0;
  const selectedSheetNote =
    selectedPosteFleuraisonNotes.find((note) => note.id === selectedFleuraisonNoteId) ?? null;
  const deleteConfirmNote =
    selectedPosteFleuraisonNotes.find((note) => note.id === deleteConfirmNoteId) ?? null;
  const notesExcludingEditedOne = selectedPosteFleuraisonNotes.filter(
    (note) => note.id !== editingFleuraisonNoteId
  );
  const existingDebutNote = notesExcludingEditedOne.find((note) => note.noteType === "Début");
  const existingFinaleNote = notesExcludingEditedOne.find((note) => note.noteType === "Finale");
  let fleuraisonValidationError: string | null = null;
  if (fleuraisonForm.noteType === "Début" && existingDebutNote) {
    fleuraisonValidationError = "Une observation de début existe déjà.";
  } else if (fleuraisonForm.noteType === "Finale" && existingFinaleNote) {
    fleuraisonValidationError = "Une observation finale existe déjà.";
  } else if (fleuraisonForm.noteType === "Finale" && !existingDebutNote) {
    fleuraisonValidationError = "Ajoutez d'abord une observation de début.";
  } else if (
    fleuraisonForm.noteType === "Finale" &&
    existingDebutNote &&
    parseIsoDateToTime(fleuraisonForm.observationDate) <
      parseIsoDateToTime(existingDebutNote.observationDate)
  ) {
    fleuraisonValidationError =
      "La date finale doit être postérieure ou égale à la date de début.";
  } else if (
    fleuraisonForm.noteType === "Début" &&
    existingFinaleNote &&
    parseIsoDateToTime(fleuraisonForm.observationDate) >
      parseIsoDateToTime(existingFinaleNote.observationDate)
  ) {
    fleuraisonValidationError =
      "La date de début doit être antérieure ou égale à la date finale.";
  }
  const hasFleuraisonValidationError = fleuraisonValidationError != null;
  const hasSavedConfig = selectedPoste != null ? Boolean(posteConfigs[selectedPoste.name]) : false;
  const shouldShowPosteDetailLoading = Boolean(
    selectedPoste && frameView === "loading" && !isEditingConfig && !isObservationScreen
  );
  const getPosteObservationsWithFleuraisonState = (posteName: string): ObservationItem[] => {
    const baseObservations = getPosteObservations(posteName);
    return baseObservations.map((observation) => {
      if (!isObservationPhaseName(observation.name)) {
        return observation;
      }

      const phaseNotes =
        observationNotesByKey[getObservationNotesKey(posteName, observation.name)] ?? [];
      if (phaseNotes.length === 0) {
        return observation;
      }

      const latestNote = phaseNotes.reduce((latest, current) =>
        parseIsoDateToTime(current.observationDate) > parseIsoDateToTime(latest.observationDate)
          ? current
          : latest
      );
      const phaseStatus = getObservationDerivedStatus(phaseNotes);

      return {
        ...observation,
        status: phaseStatus,
        lastUpdate: formatDateShortFr(latestNote.observationDate),
      };
    });
  };
  const selectedPosteObservations =
    selectedPoste != null
      ? getPosteObservationsWithFleuraisonState(selectedPoste.name)
      : defaultPosteObservations;
  const selectedPosteCompletedCount = getCompletedCount(selectedPosteObservations);
  const selectedPosteProgress = getProgressFromObservations(selectedPosteObservations);
  const campaignHeaderMeta = "Campagne 2025-2026";
  const posteCards = postesFixes.map((poste) => {
    const observations = getPosteObservationsWithFleuraisonState(poste.name);
    const progress = getProgressFromObservations(observations);
    const completedCount = getCompletedCount(observations);
    const status = getPosteStatus(progress);

    return { poste, observations, progress, completedCount, status };
  });
  const selectedPosteConfig =
    selectedPoste != null
      ? (posteConfigs[selectedPoste.name] ?? emptyPosteConfig)
      : emptyPosteConfig;
  const hasConfigChanges =
    configDraft.irrigationType !== selectedPosteConfig.irrigationType ||
    configDraft.waterSource !== selectedPosteConfig.waterSource ||
    configDraft.waterQuality !== selectedPosteConfig.waterQuality;
  const resetFleuraisonForm = (
    phaseName: ObservationPhaseName,
    nextType: FleuraisonNoteType = "Suivi"
  ) => setFleuraisonForm(createDefaultFleuraisonForm(phaseName, nextType));
  const openFleuraisonForm = () => {
    if (!selectedObservationPhaseName) {
      return;
    }

    resetFleuraisonForm(
      selectedObservationPhaseName,
      getNextObservationNoteType(selectedPosteFleuraisonNotes)
    );
    setIsAddingFleuraisonNote(true);
    setEditingFleuraisonNoteId(null);
    setSelectedFleuraisonNoteId(null);
    setDeleteConfirmNoteId(null);
    setImageViewer(null);
  };
  const startEditingFleuraisonNote = (note: FleuraisonNote) => {
    setFleuraisonForm({
      noteType: note.noteType,
      observationDate: note.observationDate,
      densityValue: note.densityValue,
      secondaryValue: note.secondaryValue,
      notes: note.notes,
      images: [...note.images],
    });
    setEditingFleuraisonNoteId(note.id);
    setIsAddingFleuraisonNote(true);
    setSelectedFleuraisonNoteId(null);
  };
  const confirmDeleteFleuraisonNote = (noteId: string) => {
    if (!selectedObservationNotesKey) {
      return;
    }

    setObservationNotesByKey((prev) => ({
      ...prev,
      [selectedObservationNotesKey]: (prev[selectedObservationNotesKey] ?? []).filter(
        (note) => note.id !== noteId
      ),
    }));

    if (editingFleuraisonNoteId === noteId) {
      const remainingNotes = notesExcludingEditedOne.filter((note) => note.id !== noteId);
      setEditingFleuraisonNoteId(null);
      if (selectedObservationPhaseName) {
        resetFleuraisonForm(
          selectedObservationPhaseName,
          getNextObservationNoteType(remainingNotes)
        );
      }
      setIsAddingFleuraisonNote(true);
    }
  };
  const saveFleuraisonNote = () => {
    if (
      !selectedObservationNotesKey ||
      hasFleuraisonValidationError ||
      !fleuraisonForm.observationDate
    ) {
      return;
    }

    const savedAt = new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date());

    const newNote: FleuraisonNote = {
      ...fleuraisonForm,
      id: editingFleuraisonNoteId ?? `${Date.now()}`,
      savedAt,
    };

    setObservationNotesByKey((prev) => {
      const currentNotes = prev[selectedObservationNotesKey] ?? [];
      const nextNotes = editingFleuraisonNoteId
        ? currentNotes.map((note) => (note.id === editingFleuraisonNoteId ? newNote : note))
        : [...currentNotes, newNote];

      return {
        ...prev,
        [selectedObservationNotesKey]: nextNotes,
      };
    });
    setEditingFleuraisonNoteId(null);
    setIsAddingFleuraisonNote(false);
  };

  return (
    <div className={showDeviceFrame ? frameClass : styles.androidCanvasNoFrame}>
      <div className={styles.androidScreen}>
        <WorkerAppStatusBar />
        <div
          className={`${styles.secteursContent} ${
            isFullScreenFlow ? styles.secteursContentNoBottomBar : ""
          } ${styles.posteFixeContent}`}
        >
          {selectedPoste ? (
            <div
              className={`${styles.posteDetailLayout} ${
                isEditingConfig || isObservationScreen
                  ? styles.posteDetailLayoutEdit
                  : styles.posteDetailLayoutRead
              }`}
            >
              {shouldShowPosteDetailLoading ? (
                <>
                  <div className={styles.posteDetailTopBlock}>
                    <div className={styles.posteDetailHeader}>
                      <button
                        className={styles.pageBackButton}
                        type="button"
                        aria-label="Retour"
                        onClick={() => {
                          setSelectedPoste(null);
                          setIsEditingConfig(false);
                          setSelectedObservation(null);
                          setEditingFleuraisonNoteId(null);
                          setSelectedFleuraisonNoteId(null);
                          setDeleteConfirmNoteId(null);
                          setImageViewer(null);
                        }}
                      >
                        <span className={styles.pageBackIcon} aria-hidden="true">
                          arrow_back
                        </span>
                      </button>
                      <div className={styles.posteDetailHeaderText}>
                        <h2 className={styles.posteDetailHeaderTitle}>{selectedPoste.name}</h2>
                        <p className={styles.posteDetailHeaderLocation}>{selectedPoste.sector}</p>
                      </div>
                    </div>
                    <div className={styles.posteDetailSummaryCard}>
                      <span className={styles.detailSkeletonSummaryTitle} aria-hidden="true" />
                      <span className={styles.detailSkeletonSummaryMeta} aria-hidden="true" />
                      <span className={styles.detailSkeletonSummaryProgress} aria-hidden="true" />
                      <div className={styles.posteProgressRow}>
                        <span
                          className={styles.skeletonProgress}
                          style={{ width: "100%" }}
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  </div>

                  <h3 className={`${styles.posteSectionTitle} ${styles.posteSectionTitleObservations}`}>
                    Observations
                  </h3>
                  <div className={styles.posteObservationsCard}>
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className={`${styles.posteObservationSkeletonRow} ${
                          index < 3 ? styles.observationRowBorder : ""
                        }`}
                      >
                        <span className={styles.detailSkeletonObservationIcon} aria-hidden="true" />
                        <div className={styles.posteObservationSkeletonMain}>
                          <span className={styles.detailSkeletonObservationTitle} aria-hidden="true" />
                          <span className={styles.detailSkeletonObservationMeta} aria-hidden="true" />
                        </div>
                        <span className={styles.skeletonBadge} aria-hidden="true" />
                        <span className={styles.skeletonChevron} aria-hidden="true" />
                      </div>
                    ))}
                  </div>

                  <h3 className={styles.posteSectionTitle}>Configuration</h3>
                  <div className={styles.posteConfigCard}>
                    <div className={styles.posteConfigFooter}>
                      <span className={styles.detailSkeletonConfigDate} aria-hidden="true" />
                      <span className={styles.detailSkeletonConfigAction} aria-hidden="true" />
                    </div>
                    <div className={styles.posteConfigContent}>
                      <span className={styles.detailSkeletonConfigLine} aria-hidden="true" />
                      <span className={styles.detailSkeletonConfigLine} aria-hidden="true" />
                      <span className={styles.detailSkeletonConfigLine} aria-hidden="true" />
                    </div>
                  </div>
                </>
              ) : isObservationScreen ? (
                <div className={styles.posteEditLayout}>
                  <div className={styles.posteDetailHeader}>
                    <button
                      className={styles.pageBackButton}
                      type="button"
                      aria-label="Retour"
                      onClick={() => {
                        setSelectedObservation(null);
                        setEditingFleuraisonNoteId(null);
                        setSelectedFleuraisonNoteId(null);
                        setDeleteConfirmNoteId(null);
                        setImageViewer(null);
                      }}
                    >
                      <span className={styles.pageBackIcon} aria-hidden="true">
                        arrow_back
                      </span>
                    </button>
                    <div className={styles.posteDetailHeaderText}>
                      <h2 className={styles.posteDetailHeaderTitle}>
                        {activeObservationPhaseConfig.title}
                      </h2>
                      <p className={styles.posteDetailHeaderLocation}>
                        {selectedPoste.name} - {selectedPoste.sector}
                      </p>
                    </div>
                  </div>
                  {shouldShowFleuraisonForm ? (
                    <div className={styles.fleuraisonSection}>
                      <h3 className={styles.fleuraisonSectionTitle}>Observation</h3>
                      <div className={styles.fleuraisonCard}>
                        <div className={styles.fleuraisonField}>
                          <p className={styles.fleuraisonLabel}>
                            {activeObservationPhaseConfig.densityLabel}
                          </p>
                          <div className={styles.posteEditChips}>
                            {activeObservationPhaseConfig.densityOptions.map((option) => {
                              const isActive = fleuraisonForm.densityValue === option;

                              return (
                                <button
                                  key={option}
                                  className={`${styles.posteEditChip} ${
                                    isActive ? styles.posteEditChipActive : ""
                                  }`}
                                  type="button"
                                  onClick={() =>
                                    setFleuraisonForm((prev) => ({ ...prev, densityValue: option }))
                                  }
                                >
                                  {isActive ? (
                                    <span className={styles.posteEditChipCheck} aria-hidden="true">
                                      check
                                    </span>
                                  ) : null}
                                  {option}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className={styles.fleuraisonField}>
                          <p className={styles.fleuraisonLabel}>Type d&apos;observation</p>
                          <div className={styles.posteEditChips}>
                            {(["Début", "Suivi", "Finale"] as const).map((option) => {
                              const isActive = fleuraisonForm.noteType === option;

                              return (
                                <button
                                  key={option}
                                  type="button"
                                  className={`${styles.posteEditChip} ${
                                    isActive ? styles.posteEditChipActive : ""
                                  }`}
                                  onClick={() =>
                                    setFleuraisonForm((prev) => ({ ...prev, noteType: option }))
                                  }
                                >
                                  {isActive ? (
                                    <span className={styles.posteEditChipCheck} aria-hidden="true">
                                      check
                                    </span>
                                  ) : null}
                                  {option}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className={styles.fleuraisonField}>
                          <span className={styles.fleuraisonLabel}>Date observation</span>
                          <span className={styles.fleuraisonTimeField}>
                            <span className={styles.fleuraisonTimeValue}>
                              {fleuraisonForm.observationDate
                                ? formatDateLongFr(fleuraisonForm.observationDate)
                                : "Sélectionner une date"}
                            </span>
                            <span className={styles.fleuraisonTimeIcon} aria-hidden="true">
                              event
                            </span>
                            <input
                              className={styles.fleuraisonTimeNative}
                              type="date"
                              aria-label="Date observation"
                              value={fleuraisonForm.observationDate}
                              onChange={(event) =>
                                setFleuraisonForm((prev) => ({
                                  ...prev,
                                  observationDate: event.target.value,
                                }))
                              }
                            />
                          </span>
                        </div>
                        {hasFleuraisonValidationError ? (
                          <p className={styles.fleuraisonInlineError}>{fleuraisonValidationError}</p>
                        ) : null}

                        {activeObservationPhaseConfig.secondaryMode === "chips" ? (
                          <div className={styles.fleuraisonField}>
                            <p className={styles.fleuraisonLabel}>
                              {activeObservationPhaseConfig.secondaryLabel}
                            </p>
                            <div className={styles.posteEditChips}>
                              {(activeObservationPhaseConfig.secondaryOptions ?? []).map((option) => {
                                const isActive = fleuraisonForm.secondaryValue === option;

                                return (
                                  <button
                                    key={option}
                                    type="button"
                                    className={`${styles.posteEditChip} ${
                                      isActive ? styles.posteEditChipActive : ""
                                    }`}
                                    onClick={() =>
                                      setFleuraisonForm((prev) => ({
                                        ...prev,
                                        secondaryValue: option,
                                      }))
                                    }
                                  >
                                    {isActive ? (
                                      <span className={styles.posteEditChipCheck} aria-hidden="true">
                                        check
                                      </span>
                                    ) : null}
                                    {option}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <label className={styles.fleuraisonField}>
                            <span className={styles.fleuraisonLabel}>
                              {activeObservationPhaseConfig.secondaryLabel}
                            </span>
                            <input
                              className={styles.fleuraisonInput}
                              type="number"
                              min="0"
                              value={fleuraisonForm.secondaryValue}
                              onChange={(event) =>
                                setFleuraisonForm((prev) => ({
                                  ...prev,
                                  secondaryValue: event.target.value,
                                }))
                              }
                            />
                          </label>
                        )}

                        <div className={styles.fleuraisonField}>
                          <p className={styles.fleuraisonLabel}>Images témoins (optionnel)</p>
                          <div className={styles.fleuraisonImagesGrid}>
                            {fleuraisonForm.images.map((imageSrc, imageIndex) => (
                              <div key={`${imageSrc}-${imageIndex}`} className={styles.fleuraisonImageThumb}>
                                <img src={imageSrc} alt={`Témoin ${imageIndex + 1}`} />
                                <button
                                  className={styles.fleuraisonImageRemove}
                                  type="button"
                                  aria-label="Supprimer l'image"
                                  onClick={() =>
                                    setFleuraisonForm((prev) => ({
                                      ...prev,
                                      images: prev.images.filter((_, index) => index !== imageIndex),
                                    }))
                                  }
                                >
                                  close
                                </button>
                              </div>
                            ))}
                            <button
                              className={styles.fleuraisonImagePlaceholder}
                              type="button"
                              onClick={() => fleuraisonImageInputRef.current?.click()}
                            >
                              <span className={styles.fleuraisonImageIcon} aria-hidden="true">
                                add_a_photo
                              </span>
                            </button>
                            <input
                              ref={fleuraisonImageInputRef}
                              className={styles.fleuraisonImageInput}
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(event) => {
                                const files = event.target.files;
                                if (!files || files.length === 0) {
                                  return;
                                }

                                const imageUrls = Array.from(files).map((file) =>
                                  URL.createObjectURL(file)
                                );
                                setFleuraisonForm((prev) => ({
                                  ...prev,
                                  images: [...prev.images, ...imageUrls].slice(0, 6),
                                }));
                                event.target.value = "";
                              }}
                            />
                          </div>
                        </div>

                        <label className={styles.fleuraisonField}>
                          <span className={styles.fleuraisonLabel}>Notes (optionnel)</span>
                          <textarea
                            className={styles.fleuraisonTextarea}
                            placeholder="Ajouter une note..."
                            value={fleuraisonForm.notes}
                            onChange={(event) =>
                              setFleuraisonForm((prev) => ({ ...prev, notes: event.target.value }))
                            }
                          />
                        </label>
                      </div>
                    </div>
                  ) : shouldShowFleuraisonEmptyState ? (
                    <div className={styles.fleuraisonEmptyWrap}>
                      <div className={styles.fleuraisonEmptyCard}>
                        <div className={styles.fleuraisonEmptyIllustration} aria-hidden="true">
                          <span className={styles.fleuraisonEmptyIcon}>nest_found_savings</span>
                        </div>
                        <div className={styles.fleuraisonEmptyText}>
                          <p className={styles.fleuraisonEmptyTitle}>Aucune observation</p>
                          <p className={styles.fleuraisonEmptySubTitle}>
                            {activeObservationPhaseConfig.emptySubtitle}
                          </p>
                        </div>
                        <button
                          className={`${styles.posteSaveButton} ${styles.fleuraisonEmptyAction}`}
                          type="button"
                          onClick={openFleuraisonForm}
                        >
                          Ajouter une observation
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.fleuraisonSection}>
                      <h3 className={styles.fleuraisonSectionTitle}>Observation</h3>
                      <div className={styles.fleuraisonNotesList}>
                        {selectedPosteFleuraisonNotesSorted.map((note, index) => (
                          <div key={note.id} className={styles.fleuraisonNoteCard}>
                            <div className={styles.fleuraisonNoteTop}>
                              <span
                                className={`${styles.fleuraisonNoteType} ${
                                  note.noteType === "Début"
                                    ? styles.fleuraisonNoteTypeStart
                                    : note.noteType === "Finale"
                                      ? styles.fleuraisonNoteTypeEnd
                                      : styles.fleuraisonNoteTypeFollowUp
                                }`}
                              >
                                {note.noteType}
                              </span>
                              <div className={styles.fleuraisonNoteMeta}>
                                <p className={styles.fleuraisonNoteDate}>
                                  {formatDateLongFr(note.observationDate)}
                                </p>
                                <button
                                  type="button"
                                  className={styles.fleuraisonNoteMoreButton}
                                  aria-label="Actions observation"
                                  onClick={() => setSelectedFleuraisonNoteId(note.id)}
                                >
                                  <span className={styles.fleuraisonNoteMore} aria-hidden="true">
                                    more_vert
                                  </span>
                                </button>
                              </div>
                            </div>
                            <p className={styles.fleuraisonNoteTitle}>Observation {index + 1}</p>
                            <p className={styles.fleuraisonNoteSummary}>
                              {activeObservationPhaseConfig.densityLabel}:{" "}
                              <strong>{note.densityValue}</strong> ·{" "}
                              {activeObservationPhaseConfig.secondaryLabel}: {note.secondaryValue}
                            </p>
                            {note.images.length > 0 ? (
                              <div className={styles.fleuraisonNoteImages}>
                                {note.images.slice(0, 3).map((imageSrc, imageIndex) => (
                                  <button
                                    key={`${note.id}-img-${imageIndex}`}
                                    type="button"
                                    className={styles.fleuraisonNoteImageTap}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      setImageViewer({
                                        images: note.images,
                                        index: imageIndex,
                                      });
                                    }}
                                  >
                                    <img
                                      src={imageSrc}
                                      alt={`Observation ${index + 1} image ${imageIndex + 1}`}
                                    />
                                  </button>
                                ))}
                              </div>
                            ) : null}
                            {note.notes ? (
                              <p className={styles.fleuraisonNoteComment}>{note.notes}</p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {shouldShowFleuraisonForm || selectedPosteFleuraisonNotes.length > 0 ? (
                    <div className={styles.posteEditActions}>
                      {shouldShowFleuraisonForm ? (
                        <button
                          className={`${styles.posteSaveButton} ${
                            hasFleuraisonValidationError ? styles.posteButtonDisabled : ""
                          }`}
                          type="button"
                          disabled={hasFleuraisonValidationError}
                          onClick={saveFleuraisonNote}
                        >
                          {editingFleuraisonNoteId ? "Enregistrer les modifications" : "Enregistrer"}
                        </button>
                      ) : (
                        <button className={styles.posteSaveButton} type="button" onClick={openFleuraisonForm}>
                          Ajouter une observation
                        </button>
                      )}
                    </div>
                  ) : null}
                  {selectedSheetNote ? (
                    <div
                      className={styles.fleuraisonSheetOverlay}
                      role="dialog"
                      aria-modal="true"
                      onClick={() => setSelectedFleuraisonNoteId(null)}
                    >
                      <div
                        className={styles.fleuraisonActionSheet}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <span className={styles.fleuraisonSheetHandle} aria-hidden="true" />
                        <button
                          type="button"
                          className={styles.fleuraisonSheetAction}
                          onClick={() => startEditingFleuraisonNote(selectedSheetNote)}
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          className={`${styles.fleuraisonSheetAction} ${
                            selectedSheetNote.images.length === 0
                              ? styles.fleuraisonSheetActionDisabled
                              : ""
                          }`}
                          disabled={selectedSheetNote.images.length === 0}
                          onClick={() => {
                            if (selectedSheetNote.images.length === 0) {
                              return;
                            }

                            setImageViewer({
                              images: selectedSheetNote.images,
                              index: 0,
                            });
                            setSelectedFleuraisonNoteId(null);
                          }}
                        >
                          Prévisualiser les images
                        </button>
                        <button
                          type="button"
                          className={`${styles.fleuraisonSheetAction} ${styles.fleuraisonSheetActionDanger}`}
                          onClick={() => {
                            setDeleteConfirmNoteId(selectedSheetNote.id);
                            setSelectedFleuraisonNoteId(null);
                          }}
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ) : null}
                  {deleteConfirmNote ? (
                    <div className={styles.unsavedOverlay} role="dialog" aria-modal="true">
                      <div className={styles.unsavedCard}>
                        <h4 className={styles.unsavedTitle}>Supprimer cette observation ?</h4>
                        <p className={styles.unsavedText}>
                          Cette action est définitive et supprimera la note enregistrée.
                        </p>
                        <div className={styles.unsavedActions}>
                          <button
                            className={styles.unsavedSecondary}
                            type="button"
                            onClick={() => setDeleteConfirmNoteId(null)}
                          >
                            Annuler
                          </button>
                          <button
                            className={`${styles.unsavedPrimary} ${styles.unsavedDanger}`}
                            type="button"
                            onClick={() => {
                              confirmDeleteFleuraisonNote(deleteConfirmNote.id);
                              setDeleteConfirmNoteId(null);
                            }}
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  {imageViewer ? (
                    <div
                      className={styles.fleuraisonViewerOverlay}
                      role="dialog"
                      aria-modal="true"
                      onTouchStart={(event) => {
                        imageViewerTouchStartXRef.current = event.touches[0]?.clientX ?? null;
                      }}
                      onTouchEnd={(event) => {
                        const touchStartX = imageViewerTouchStartXRef.current;
                        const touchEndX = event.changedTouches[0]?.clientX ?? null;
                        if (touchStartX == null || touchEndX == null) {
                          return;
                        }

                        const deltaX = touchEndX - touchStartX;
                        if (Math.abs(deltaX) < 40) {
                          return;
                        }

                        if (deltaX < 0) {
                          setImageViewer((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  index: Math.min(prev.images.length - 1, prev.index + 1),
                                }
                              : prev
                          );
                          return;
                        }

                        setImageViewer((prev) =>
                          prev
                            ? {
                                ...prev,
                                index: Math.max(0, prev.index - 1),
                              }
                            : prev
                        );
                      }}
                    >
                      <button
                        type="button"
                        className={styles.fleuraisonViewerClose}
                        aria-label="Fermer la prévisualisation"
                        onClick={() => setImageViewer(null)}
                      >
                        close
                      </button>
                      <img
                        className={styles.fleuraisonViewerImage}
                        src={imageViewer.images[imageViewer.index]}
                        alt={`Image ${imageViewer.index + 1}`}
                      />
                      <p className={styles.fleuraisonViewerCounter}>
                        {imageViewer.index + 1} / {imageViewer.images.length}
                      </p>
                      <button
                        type="button"
                        className={`${styles.fleuraisonViewerHitArea} ${styles.fleuraisonViewerHitLeft}`}
                        aria-label="Image précédente"
                        onClick={() =>
                          setImageViewer((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  index: Math.max(0, prev.index - 1),
                                }
                              : prev
                          )
                        }
                      />
                      <button
                        type="button"
                        className={`${styles.fleuraisonViewerHitArea} ${styles.fleuraisonViewerHitRight}`}
                        aria-label="Image suivante"
                        onClick={() =>
                          setImageViewer((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  index: Math.min(prev.images.length - 1, prev.index + 1),
                                }
                              : prev
                          )
                        }
                      />
                    </div>
                  ) : null}
                </div>
              ) : isEditingConfig ? (
                <div className={styles.posteEditLayout}>
                  <div className={styles.posteDetailHeader}>
                    <button
                      className={styles.pageBackButton}
                      type="button"
                      aria-label="Retour"
                      onClick={() => {
                        if (hasConfigChanges) {
                          setShowUnsavedModal(true);
                          return;
                        }

                        setIsEditingConfig(false);
                      }}
                    >
                      <span className={styles.pageBackIcon} aria-hidden="true">
                        arrow_back
                      </span>
                    </button>
                    <div className={styles.posteDetailHeaderText}>
                      <h2 className={styles.posteDetailHeaderTitle}>{selectedPoste.name}</h2>
                      <p className={styles.posteDetailHeaderLocation}>{selectedPoste.sector}</p>
                    </div>
                  </div>
                  <h3 className={styles.posteEditMainTitle}>Configuration</h3>

                  <div className={styles.posteEditCard}>
                    <div className={styles.posteEditSection}>
                      <p className={styles.posteEditSectionTitle}>
                        <span className={styles.posteConfigIcon} aria-hidden="true">
                          water_drop
                        </span>
                        Type d&apos;irrigation
                      </p>
                      <div className={styles.posteEditChips}>
                        {irrigationOptions.map((option) => {
                          const isActive = configDraft.irrigationType === option;

                          return (
                            <button
                              key={option}
                              type="button"
                              className={`${styles.posteEditChip} ${
                                isActive ? styles.posteEditChipActive : ""
                              }`}
                              onClick={() =>
                                setConfigDraft((prev) => ({ ...prev, irrigationType: option }))
                              }
                            >
                              {isActive ? (
                                <span className={styles.posteEditChipCheck} aria-hidden="true">
                                  check
                                </span>
                              ) : null}
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className={styles.posteEditDivider} />

                    <div className={styles.posteEditSection}>
                      <p className={styles.posteEditSectionTitle}>
                        <span className={styles.posteConfigIcon} aria-hidden="true">
                          water
                        </span>
                        Source d&apos;eau
                      </p>
                      <div className={styles.posteEditChips}>
                        {waterSourceOptions.map((option) => {
                          const isActive = configDraft.waterSource === option;

                          return (
                            <button
                              key={option}
                              type="button"
                              className={`${styles.posteEditChip} ${
                                isActive ? styles.posteEditChipActive : ""
                              }`}
                              onClick={() =>
                                setConfigDraft((prev) => ({ ...prev, waterSource: option }))
                              }
                            >
                              {isActive ? (
                                <span className={styles.posteEditChipCheck} aria-hidden="true">
                                  check
                                </span>
                              ) : null}
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className={styles.posteEditDivider} />

                    <div className={styles.posteEditSection}>
                      <p className={styles.posteEditSectionTitle}>
                        <span className={styles.posteConfigIcon} aria-hidden="true">
                          star
                        </span>
                        Qualité de l&apos;eau
                      </p>
                      <div className={styles.posteEditChips}>
                        {waterQualityOptions.map((option) => {
                          const isActive = configDraft.waterQuality === option;

                          return (
                            <button
                              key={option}
                              type="button"
                              className={`${styles.posteEditChip} ${
                                isActive ? styles.posteEditChipActive : ""
                              }`}
                              onClick={() =>
                                setConfigDraft((prev) => ({ ...prev, waterQuality: option }))
                              }
                            >
                              {isActive ? (
                                <span className={styles.posteEditChipCheck} aria-hidden="true">
                                  check
                                </span>
                              ) : null}
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className={styles.posteEditActions}>
                    <button
                      className={styles.posteSaveButton}
                      type="button"
                      onClick={() => {
                        if (!selectedPoste) {
                          return;
                        }

                        setPosteConfigs((prev) => ({
                          ...prev,
                          [selectedPoste.name]: configDraft,
                        }));
                        setIsEditingConfig(false);
                        setShowUnsavedModal(false);
                      }}
                    >
                      Enregistrer
                    </button>
                    <button
                      className={styles.posteCancelButton}
                      type="button"
                      onClick={() => {
                        if (hasConfigChanges) {
                          setShowUnsavedModal(true);
                          return;
                        }

                        setIsEditingConfig(false);
                      }}
                    >
                      Annuler
                    </button>
                  </div>

                  {showUnsavedModal ? (
                    <div className={styles.unsavedOverlay} role="dialog" aria-modal="true">
                      <div className={styles.unsavedCard}>
                        <h4 className={styles.unsavedTitle}>Quitter sans enregistrer ?</h4>
                        <p className={styles.unsavedText}>
                          Vos modifications seront perdues si vous quittez maintenant.
                        </p>
                        <div className={styles.unsavedActions}>
                          <button
                            className={styles.unsavedSecondary}
                            type="button"
                            onClick={() => {
                              setConfigDraft(selectedPosteConfig);
                              setIsEditingConfig(false);
                              setShowUnsavedModal(false);
                            }}
                          >
                            Quitter
                          </button>
                          <button
                            className={styles.unsavedPrimary}
                            type="button"
                            onClick={() => {
                              if (!selectedPoste) {
                                return;
                              }

                              setPosteConfigs((prev) => ({
                                ...prev,
                                [selectedPoste.name]: configDraft,
                              }));
                              setIsEditingConfig(false);
                              setShowUnsavedModal(false);
                            }}
                          >
                            Enregistrer
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <>
                  <div className={styles.posteDetailTopBlock}>
                    <div className={styles.posteDetailHeader}>
                      <button
                        className={styles.pageBackButton}
                        type="button"
                        aria-label="Retour"
                        onClick={() => {
                          setSelectedPoste(null);
                          setIsEditingConfig(false);
                          setSelectedObservation(null);
                          setEditingFleuraisonNoteId(null);
                          setSelectedFleuraisonNoteId(null);
                          setDeleteConfirmNoteId(null);
                          setImageViewer(null);
                        }}
                      >
                        <span className={styles.pageBackIcon} aria-hidden="true">
                          arrow_back
                        </span>
                      </button>
                      <div className={styles.posteDetailHeaderText}>
                        <h2 className={styles.posteDetailHeaderTitle}>{selectedPoste.name}</h2>
                        <p className={styles.posteDetailHeaderLocation}>{selectedPoste.sector}</p>
                      </div>
                    </div>

                    <div className={styles.posteDetailSummaryCard}>
                      <h3 className={styles.posteDetailSummaryTitle}>
                        Campagne {selectedPoste.campaign}
                      </h3>
                      <p className={styles.posteDetailSummaryDates}>
                        Début : {selectedPoste.startDate} · Modifié le {selectedPoste.lastUpdate}
                      </p>
                      <p
                        className={`${styles.posteProgressLabel} ${
                          selectedPosteProgress === 0 ? styles.posteProgressLabelMuted : ""
                        }`}
                      >
                        {selectedPosteCompletedCount} / {selectedPosteObservations.length}{" "}
                        observations complétées · {selectedPosteProgress}%
                      </p>
                      <div className={styles.posteProgressRow}>
                        <div className={styles.posteProgressTrack}>
                          <span
                            className={styles.posteProgressFill}
                            style={{ width: `${selectedPosteProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 className={`${styles.posteSectionTitle} ${styles.posteSectionTitleObservations}`}>
                    Observations
                  </h3>
                  <div className={styles.posteObservationsCard}>
                    {selectedPosteObservations.map((observation, index) => (
                      <button
                        key={observation.name}
                        type="button"
                        className={`${styles.observationRow} ${
                          index < selectedPosteObservations.length - 1
                            ? styles.observationRowBorder
                            : ""
                        }`}
                        onClick={() => {
                          if (!isObservationPhaseName(observation.name)) {
                            return;
                          }

                          const notesForPoste =
                            observationNotesByKey[
                              getObservationNotesKey(selectedPoste.name, observation.name)
                            ] ?? [];
                          setSelectedObservation(observation);
                          setIsAddingFleuraisonNote(false);
                          resetFleuraisonForm(
                            observation.name,
                            getNextObservationNoteType(notesForPoste)
                          );
                          setEditingFleuraisonNoteId(null);
                          setSelectedFleuraisonNoteId(null);
                          setDeleteConfirmNoteId(null);
                          setImageViewer(null);
                        }}
                      >
                        <span
                          className={`${styles.observationIconWrap} ${observationToneClasses[observation.tone]}`}
                          aria-hidden="true"
                        >
                          <span className={styles.observationIcon}>{observation.icon}</span>
                        </span>
                        <div className={styles.observationMain}>
                          <p className={styles.observationTitle}>{observation.name}</p>
                          <p className={styles.observationDate}>
                            Modifié le {observation.lastUpdate}
                          </p>
                        </div>
                        <span
                          className={`${styles.observationStatus} ${
                            observation.status === "En cours"
                              ? styles.observationStatusInProgress
                              : observation.status === "Terminé"
                                ? styles.observationStatusDone
                                : styles.observationStatusNotStarted
                          }`}
                        >
                          {observation.status}
                        </span>
                        <span className={styles.posteArrow} aria-hidden="true">
                          chevron_right
                        </span>
                      </button>
                    ))}
                  </div>

                </>
              )}
            </div>
          ) : frameView === "data" ? (
            <>
              <div className={styles.posteStickyTop}>
                <div className={styles.homeHeaderRow}>
                  <div className={styles.posteFixeTitleBlock}>
                    <h2 className={styles.posteFixeTitle}>Post Fixe</h2>
                    <p className={styles.posteFixeSubtitle}>{campaignHeaderMeta}</p>
                  </div>
                  <div className={styles.homeHeaderActions}>
                    {renderSyncBadge()}
                    <span className={styles.homeAvatar} aria-label="User avatar">
                      OE
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.postesFixesList}>
                {posteCards.map(
                  ({ poste, observations: posteObservations, progress: posteProgress, completedCount: posteCompletedCount, status: posteStatus }) => {

                    return (
                      <button
                        key={poste.name}
                        className={styles.posteCard}
                        type="button"
                        onClick={() => setSelectedPoste(poste)}
                      >
                        <div className={styles.posteCardTop}>
                          <h3 className={styles.posteFixeCardTitle}>{poste.name}</h3>
                          <div className={styles.posteCardTopActions}>
                            <span className={styles.posteArrow} aria-hidden="true">
                              chevron_right
                            </span>
                          </div>
                        </div>
                        <p className={styles.posteFixeCardSubtitle}>{poste.sector}</p>
                        <p className={styles.posteFixeDates}>
                          Début : {poste.startDate} · Modifié le {poste.lastUpdate}
                        </p>
                        <p
                          className={`${styles.posteProgressLabel} ${
                            posteStatus === "Pas commencé" ? styles.posteProgressLabelMuted : ""
                          }`}
                        >
                          {posteCompletedCount} / {posteObservations.length} observations
                          complétées · {posteProgress}%
                        </p>
                        <div className={styles.posteProgressRow}>
                          <div className={styles.posteProgressTrack}>
                            <span
                              className={styles.posteProgressFill}
                              style={{ width: `${posteProgress}%` }}
                            />
                          </div>
                        </div>
                      </button>
                    );
                  }
                )}
                {posteCards.length === 0 ? (
                  <div className={styles.postesFilterEmptyState}>Aucun poste fixe pour ce filtre.</div>
                ) : null}
              </div>
            </>
          ) : frameView === "loading" ? (
            <>
              <div className={styles.posteStickyTop}>
                <div className={styles.homeHeaderRow}>
                  <div className={styles.posteFixeTitleBlock}>
                    <h2 className={styles.posteFixeTitle}>Post Fixe</h2>
                    <p className={styles.posteFixeSubtitle}>{campaignHeaderMeta}</p>
                  </div>
                  <div className={styles.homeHeaderActions}>
                    {renderSyncBadge()}
                    <span className={styles.homeAvatar} aria-label="User avatar">
                      OE
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.postesFixesList}>
                {loadingCardSkeletons.map((skeleton, index) => (
                  <div key={index} className={`${styles.posteCard} ${styles.posteCardSkeleton}`}>
                    <div className={styles.skeletonHeader}>
                      <span className={styles.skeletonTitle} style={{ width: `${skeleton.title}%` }} />
                      <div className={styles.skeletonHeaderRight}>
                        <span className={styles.skeletonChevron} />
                      </div>
                    </div>
                    <span className={styles.skeletonSub} style={{ width: `${skeleton.subtitle}%` }} />
                    <span className={styles.skeletonDate} style={{ width: `${skeleton.date}%` }} />
                    <span className={styles.skeletonMeta} style={{ width: `${skeleton.meta}%` }} />
                    <div className={styles.posteProgressRow}>
                      <span
                        className={styles.skeletonProgress}
                        style={{ width: `${skeleton.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : frameView === "empty" ? (
            <>
              <div className={styles.posteStickyTop}>
                <div className={styles.homeHeaderRow}>
                  <div className={styles.posteFixeTitleBlock}>
                    <h2 className={styles.posteFixeTitle}>Post Fixe</h2>
                    <p className={styles.posteFixeSubtitle}>{campaignHeaderMeta}</p>
                  </div>
                  <div className={styles.homeHeaderActions}>
                    {renderSyncBadge()}
                    <span className={styles.homeAvatar} aria-label="User avatar">
                      OE
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.postesEmptyWrap}>
                <div className={styles.postesEmptyCard}>
                  <div className={styles.postesEmptyIllustration} aria-hidden="true">
                    <span className={styles.postesEmptyIconMain}>folder_open</span>
                  </div>
                  <div className={styles.postesEmptyText}>
                    <p className={styles.postesEmptyTitle}>Aucun poste fixe</p>
                    <p className={styles.postesEmptySubtitle}>
                      Vos postes fixes apparaîtront ici une fois assignés
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : null}
          {!isFullScreenFlow && frameView !== "empty" ? (
            <div className={styles.scrollFadeHint} aria-hidden="true" />
          ) : null}
        </div>
        {!isFullScreenFlow ? <WorkerAppHomeBottomBarScreen activeIndex={2} /> : null}
        {isFullScreenFlow ? <WorkerAppNavigationScreen surface="page" /> : null}
        {!isFullScreenFlow ? <WorkerAppNavigationScreen /> : null}
      </div>
    </div>
  );
}
