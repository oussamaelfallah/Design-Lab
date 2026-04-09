"use client";

import { useEffect, useRef, useState } from "react";
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
  frameTheme?: "dark" | "light";
  frameView: SecteursFrameView;
  previewState?: PostFixePreviewState;
  previewObservationPhase?: ObservationPhaseName;
  isInteractive?: boolean;
  embedded?: boolean;
  onLayoutModeChange?: (mode: "default" | "fullScreen") => void;
};

export type SecteursFrameView = "data" | "loading" | "empty";
export type PostFixePreviewState =
  | "list-data"
  | "list-loading"
  | "list-empty"
  | "detail-overview"
  | "conduite-fertilisation-soil-tab"
  | "conduite-fertilisation-apport-tab"
  | "conduite-fertilisation-soil-create"
  | "conduite-fertilisation-soil-view"
  | "conduite-fertilisation-soil-unsaved"
  | "conduite-fertilisation-apport-create"
  | "conduite-fertilisation-apport-view"
  | "conduite-irrigation-program-tab"
  | "conduite-irrigation-stress-tab"
  | "conduite-irrigation-program-create"
  | "conduite-irrigation-program-view"
  | "conduite-irrigation-program-unsaved"
  | "conduite-irrigation-stress-create"
  | "conduite-irrigation-stress-view"
  | "conduite-irrigation-stress-unsaved"
  | "detail-loading"
  | "observation-edit"
  | "observation-edit-fleuraison"
  | "observation-edit-nouaison"
  | "observation-edit-chute"
  | "observation-status-not-started"
  | "observation-status-in-progress"
  | "observation-status-done"
  | "observation-readonly"
  | "observation-unsaved-modal";

type PosteFixeItem = {
  name: string;
  sector: string;
  startDate: string;
  lastUpdate: string;
  campaign: string;
  progress: number;
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
type ObservationPhaseName =
  | "Fleuraison"
  | "Nouaison"
  | "Chute physiologique"
  | "Fertilisation"
  | "Irrigation";
type ObservationSecondaryMode = "input" | "chips";

type FleuraisonFormState = {
  startDate: string;
  endDate: string;
  densityValue: string;
  secondaryValue: string;
  notes: string;
  images: string[];
};

type FleuraisonSeedNote = {
  id: string;
  savedAt: string;
  noteType: FleuraisonNoteType;
  observationDate: string;
  densityValue: string;
  secondaryValue: string;
  notes: string;
  images: string[];
};

type FertilisationOrganicMatter = "Riche" | "Modérée" | "Faible";
type FertilisationSoilPh = "Acide" | "Neutre" | "Basique";
type FertilisationQuality = "Bonne" | "Moyenne" | "Faible";
type FertilisationDeficiencyRisk = "Aucun" | "Carence P" | "Carence Mg";

type FertilisationSoilObservation = {
  id: string;
  title: string;
  date: string;
  organicMatter: FertilisationOrganicMatter;
  soilPh: FertilisationSoilPh;
  waterRetention: FertilisationQuality;
  npkLevel: FertilisationQuality;
  deficiencyRisk: FertilisationDeficiencyRisk;
};

type FertilisationApportIntervention = {
  id: string;
  title: string;
  date: string;
  product: string;
  quantity: string;
  dose: string;
};

type FertilisationPosteState = {
  trackingStartDate: string;
  trackingEndDate: string;
  soilObservations: FertilisationSoilObservation[];
  apports: FertilisationApportIntervention[];
};

type FertilisationSoilFormState = Omit<FertilisationSoilObservation, "id" | "title">;
type FertilisationApportFormState = Omit<FertilisationApportIntervention, "id" | "title">;
type FertilisationSheetMode = "soil" | "apport";

type IrrigationProgram = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  frequencyDays: string;
  volumePerIrrigation: string;
};

type IrrigationStressType =
  | "Panne système d’irrigation"
  | "Manque d’eau"
  | "Qualité d’eau"
  | "Vague de chaleur";

type IrrigationStressObservation = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  type: IrrigationStressType;
  durationDays: string;
  note: string;
};

type IrrigationPosteState = {
  trackingStartDate: string;
  trackingEndDate: string;
  programs: IrrigationProgram[];
  stressObservations: IrrigationStressObservation[];
};

type IrrigationProgramFormState = Omit<IrrigationProgram, "id" | "title">;
type IrrigationStressFormState = Omit<IrrigationStressObservation, "id" | "title">;
type IrrigationSheetMode = "program" | "stress";

function getCurrentIsoDate(): string {
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
  Fertilisation: {
    title: "Fertilisation",
    densityLabel: "Niveau",
    densityOptions: ["Bonne"],
    secondaryLabel: "Valeur",
    secondaryMode: "input",
    emptySubtitle: "Ajoutez votre première observation de fertilisation.",
  },
  Irrigation: {
    title: "Irrigation",
    densityLabel: "Niveau",
    densityOptions: ["Bonne"],
    secondaryLabel: "Valeur",
    secondaryMode: "input",
    emptySubtitle: "Ajoutez votre première observation d'irrigation.",
  },
};

function isObservationPhaseName(value: string): value is ObservationPhaseName {
  return value in observationPhaseConfigs;
}

function getObservationNotesKey(posteName: string, phaseName: ObservationPhaseName): string {
  return `${posteName}::${phaseName}`;
}

function createDefaultFleuraisonForm(
  phaseName: ObservationPhaseName
): FleuraisonFormState {
  const phaseConfig = observationPhaseConfigs[phaseName];
  return {
    startDate: getCurrentIsoDate(),
    endDate: "",
    densityValue: phaseConfig.densityOptions[0] ?? "",
    secondaryValue:
      phaseConfig.secondaryMode === "input"
        ? "0"
        : (phaseConfig.secondaryOptions?.[0] ?? ""),
    notes: "",
    images: [],
  };
}

const defaultFleuraisonForm: FleuraisonFormState = createDefaultFleuraisonForm("Fleuraison");
const fleuraisonSeedImage = "/notesimages/istockphoto-1147544807-612x612.jpg";

const fertilisationOrganicMatterOptions: FertilisationOrganicMatter[] = [
  "Riche",
  "Modérée",
  "Faible",
];
const fertilisationSoilPhOptions: FertilisationSoilPh[] = ["Acide", "Neutre", "Basique"];
const fertilisationQualityOptions: FertilisationQuality[] = ["Bonne", "Moyenne", "Faible"];
const fertilisationDeficiencyRiskOptions: FertilisationDeficiencyRisk[] = [
  "Aucun",
  "Carence P",
  "Carence Mg",
];
const fertilisationProductOptions = [
  "Acide sulfurique",
  "Acide phosphorique",
  "Ammonitrate",
  "Nitrate de potasse",
] as const;
const irrigationStressTypeOptions: IrrigationStressType[] = [
  "Panne système d’irrigation",
  "Manque d’eau",
  "Qualité d’eau",
  "Vague de chaleur",
];

function createDefaultFertilisationSoilForm(): FertilisationSoilFormState {
  return {
    date: getCurrentIsoDate(),
    organicMatter: fertilisationOrganicMatterOptions[0],
    soilPh: fertilisationSoilPhOptions[1],
    waterRetention: fertilisationQualityOptions[0],
    npkLevel: fertilisationQualityOptions[0],
    deficiencyRisk: fertilisationDeficiencyRiskOptions[0],
  };
}

function createDefaultFertilisationApportForm(): FertilisationApportFormState {
  return {
    date: getCurrentIsoDate(),
    product: fertilisationProductOptions[0],
    quantity: "",
    dose: "",
  };
}

function createFertilisationSoilFormFromRecord(
  record: FertilisationSoilObservation
): FertilisationSoilFormState {
  return {
    date: record.date,
    organicMatter: record.organicMatter,
    soilPh: record.soilPh,
    waterRetention: record.waterRetention,
    npkLevel: record.npkLevel,
    deficiencyRisk: record.deficiencyRisk,
  };
}

function createFertilisationApportFormFromRecord(
  record: FertilisationApportIntervention
): FertilisationApportFormState {
  return {
    date: record.date,
    product: record.product,
    quantity: record.quantity,
    dose: record.dose,
  };
}

function createDefaultIrrigationProgramForm(): IrrigationProgramFormState {
  return {
    startDate: getCurrentIsoDate(),
    endDate: "",
    frequencyDays: "",
    volumePerIrrigation: "",
  };
}

function createDefaultIrrigationStressForm(): IrrigationStressFormState {
  return {
    startDate: getCurrentIsoDate(),
    endDate: "",
    type: irrigationStressTypeOptions[0],
    durationDays: "",
    note: "",
  };
}

function createIrrigationProgramFormFromRecord(
  record: IrrigationProgram
): IrrigationProgramFormState {
  return {
    startDate: record.startDate,
    endDate: record.endDate,
    frequencyDays: record.frequencyDays,
    volumePerIrrigation: record.volumePerIrrigation,
  };
}

function createIrrigationStressFormFromRecord(
  record: IrrigationStressObservation
): IrrigationStressFormState {
  return {
    startDate: record.startDate,
    endDate: record.endDate,
    type: record.type,
    durationDays: record.durationDays,
    note: record.note,
  };
}

function getFertilisationAllDates(
  soilObservations: FertilisationSoilObservation[],
  apports: FertilisationApportIntervention[]
): string[] {
  return [...soilObservations.map((item) => item.date), ...apports.map((item) => item.date)].filter(
    Boolean
  );
}

function getFertilisationTrackingStartDate(
  soilObservations: FertilisationSoilObservation[],
  apports: FertilisationApportIntervention[]
): string {
  return getFertilisationAllDates(soilObservations, apports).sort(
    (a, b) => parseIsoDateToTime(a) - parseIsoDateToTime(b)
  )[0] ?? "";
}

function getDerivedFertilisationStatus(
  fertilisationState: FertilisationPosteState
): ObservationItem["status"] {
  const trackingStartDate =
    fertilisationState.trackingStartDate ||
    getFertilisationTrackingStartDate(
      fertilisationState.soilObservations,
      fertilisationState.apports
    );

  if (!trackingStartDate) {
    return "Pas commencé";
  }

  const hasSoilObservation = fertilisationState.soilObservations.length > 0;
  const hasApport = fertilisationState.apports.length > 0;

  return fertilisationState.trackingEndDate && hasSoilObservation && hasApport
    ? "Terminé"
    : "En cours";
}

function getIrrigationAllDates(
  programs: IrrigationProgram[],
  stressObservations: IrrigationStressObservation[]
): string[] {
  return [
    ...programs.map((item) => item.startDate),
    ...programs.map((item) => item.endDate),
    ...stressObservations.map((item) => item.startDate),
    ...stressObservations.map((item) => item.endDate),
  ].filter(Boolean);
}

function getIrrigationTrackingStartDate(
  programs: IrrigationProgram[],
  stressObservations: IrrigationStressObservation[]
): string {
  return getIrrigationAllDates(programs, stressObservations).sort(
    (a, b) => parseIsoDateToTime(a) - parseIsoDateToTime(b)
  )[0] ?? "";
}

function getDerivedIrrigationStatus(
  irrigationState: IrrigationPosteState
): ObservationItem["status"] {
  const trackingStartDate =
    irrigationState.trackingStartDate ||
    getIrrigationTrackingStartDate(irrigationState.programs, irrigationState.stressObservations);

  if (!trackingStartDate) {
    return "Pas commencé";
  }

  const hasProgram = irrigationState.programs.length > 0;
  const hasStressObservation = irrigationState.stressObservations.length > 0;

  return irrigationState.trackingEndDate && hasProgram && hasStressObservation
    ? "Terminé"
    : "En cours";
}

function areFertilisationSoilFormsEqual(
  firstForm: FertilisationSoilFormState,
  secondForm: FertilisationSoilFormState
): boolean {
  return (
    firstForm.date === secondForm.date &&
    firstForm.organicMatter === secondForm.organicMatter &&
    firstForm.soilPh === secondForm.soilPh &&
    firstForm.waterRetention === secondForm.waterRetention &&
    firstForm.npkLevel === secondForm.npkLevel &&
    firstForm.deficiencyRisk === secondForm.deficiencyRisk
  );
}

function areFertilisationApportFormsEqual(
  firstForm: FertilisationApportFormState,
  secondForm: FertilisationApportFormState
): boolean {
  return (
    firstForm.date === secondForm.date &&
    firstForm.product === secondForm.product &&
    firstForm.quantity === secondForm.quantity &&
    firstForm.dose === secondForm.dose
  );
}

function areIrrigationProgramFormsEqual(
  firstForm: IrrigationProgramFormState,
  secondForm: IrrigationProgramFormState
): boolean {
  return (
    firstForm.startDate === secondForm.startDate &&
    firstForm.endDate === secondForm.endDate &&
    firstForm.frequencyDays === secondForm.frequencyDays &&
    firstForm.volumePerIrrigation === secondForm.volumePerIrrigation
  );
}

function areIrrigationStressFormsEqual(
  firstForm: IrrigationStressFormState,
  secondForm: IrrigationStressFormState
): boolean {
  return (
    firstForm.startDate === secondForm.startDate &&
    firstForm.endDate === secondForm.endDate &&
    firstForm.type === secondForm.type &&
    firstForm.durationDays === secondForm.durationDays &&
    firstForm.note === secondForm.note
  );
}

function createSeedFleuraisonNotes(posteId: string): FleuraisonSeedNote[] {
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
): FleuraisonSeedNote[] {
  if (status === "Pas commencé") {
    return [];
  }

  const baseNotes: FleuraisonSeedNote[] = [
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
): FleuraisonSeedNote[] {
  if (status === "Pas commencé") {
    return [];
  }

  const baseNotes: FleuraisonSeedNote[] = [
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

const initialObservationNotesByKey: Record<string, FleuraisonSeedNote[]> = {
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

function getObservationPhaseNameFromKey(observationKey: string): ObservationPhaseName | null {
  const phaseName = observationKey.split("::")[1];
  if (!phaseName || !isObservationPhaseName(phaseName)) {
    return null;
  }

  return phaseName;
}

function buildObservationFormFromNotes(
  phaseName: ObservationPhaseName,
  notes: FleuraisonSeedNote[]
): FleuraisonFormState | null {
  if (notes.length === 0) {
    return null;
  }

  const sortedByDate = [...notes].sort(
    (first, second) =>
      parseIsoDateToTime(first.observationDate) - parseIsoDateToTime(second.observationDate)
  );
  const startNote = notes.find((note) => note.noteType === "Début") ?? sortedByDate[0];
  const endNote = notes.find((note) => note.noteType === "Finale") ?? null;
  const latestNote = sortedByDate[sortedByDate.length - 1];
  const nextForm = createDefaultFleuraisonForm(phaseName);

  return {
    ...nextForm,
    startDate: startNote?.observationDate ?? "",
    endDate: endNote?.observationDate ?? "",
    densityValue: latestNote?.densityValue ?? nextForm.densityValue,
    secondaryValue: latestNote?.secondaryValue ?? nextForm.secondaryValue,
    notes: latestNote?.notes ?? "",
    images: latestNote?.images ? [...latestNote.images] : [],
  };
}

const initialObservationFormsByKey: Record<string, FleuraisonFormState> = Object.entries(
  initialObservationNotesByKey
).reduce<Record<string, FleuraisonFormState>>((acc, [observationKey, notes]) => {
  const phaseName = getObservationPhaseNameFromKey(observationKey);
  if (!phaseName) {
    return acc;
  }

  const initialForm = buildObservationFormFromNotes(phaseName, notes);
  if (initialForm) {
    acc[observationKey] = initialForm;
  }

  return acc;
}, {});

type PosteConfig = {
  irrigationType: string;
  waterSource: string;
  waterQuality: string;
};

type ObservationUnsavedContext =
  | "exit-observation"
  | "close-fertilisation-sheet"
  | "close-irrigation-sheet";

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
    progress: 33,
  },
  {
    name: "Poste Fixe 7642",
    sector: "Secteur S3",
    startDate: "12 Mai",
    lastUpdate: "08 Juil",
    campaign: "2025-2026",
    progress: 67,
  },
  {
    name: "Poste Fixe 5097",
    sector: "Secteur S4",
    startDate: "20 Mai",
    lastUpdate: "27 Juil",
    campaign: "2025-2026",
    progress: 100,
  },
  {
    name: "Poste Fixe 3318",
    sector: "Secteur S5",
    startDate: "24 Mai",
    lastUpdate: "02 Août",
    campaign: "2025-2026",
    progress: 67,
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
    progress: 33,
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
      status: "Terminé",
      tone: "teal",
    },
    {
      name: "Irrigation",
      lastUpdate: "20 Juil",
      icon: "water_drop",
      status: "En cours",
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
      status: "En cours",
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

function createSeedFertilisationState(
  posteName: string,
  status: ObservationItem["status"]
): FertilisationPosteState {
  const posteKey = posteName.toLowerCase().replace(/\s+/g, "-");
  const baseSoilObservation: FertilisationSoilObservation = {
    id: `${posteKey}-soil-1`,
    title: "Analyse de sol 1",
    date: "2026-07-21",
    organicMatter: "Riche",
    soilPh: "Neutre",
    waterRetention: "Bonne",
    npkLevel: "Bonne",
    deficiencyRisk: "Aucun",
  };
  const baseSoilObservationTwo: FertilisationSoilObservation = {
    id: `${posteKey}-soil-2`,
    title: "Analyse de sol 2",
    date: "2026-07-27",
    organicMatter: "Modérée",
    soilPh: "Neutre",
    waterRetention: "Moyenne",
    npkLevel: "Moyenne",
    deficiencyRisk: "Carence Mg",
  };
  const baseApportOne: FertilisationApportIntervention = {
    id: `${posteKey}-apport-1`,
    title: "Apport 1",
    date: "2026-07-29",
    product: "ACIDE SULFURIQUE",
    quantity: "5.8",
    dose: "1.5",
  };
  const baseApportTwo: FertilisationApportIntervention = {
    id: `${posteKey}-apport-2`,
    title: "Apport 2",
    date: "2026-07-31",
    product: "ACIDE PHOSPHORIQUE",
    quantity: "4.2",
    dose: "1.2",
  };

  if (status === "Pas commencé") {
    return {
      trackingStartDate: "",
      trackingEndDate: "",
      soilObservations: [],
      apports: [],
    };
  }

  if (status === "En cours") {
    return {
      trackingStartDate: "2026-07-21",
      trackingEndDate: "",
      soilObservations: [baseSoilObservationTwo, baseSoilObservation],
      apports: [baseApportTwo, baseApportOne],
    };
  }

  return {
    trackingStartDate: "2026-07-21",
    trackingEndDate: "2026-07-31",
    soilObservations: [baseSoilObservationTwo, baseSoilObservation],
    apports: [baseApportTwo, baseApportOne],
  };
}

const initialFertilisationByPoste: Record<string, FertilisationPosteState> = Object.fromEntries(
  postesFixes.map((poste) => {
    const fertilisationObservation = (
      posteObservationsByPoste[poste.name] ?? posteObservationsByPoste["Poste Fixe 1254"]
    ).find((observation) => observation.name === "Fertilisation");

    return [
      poste.name,
      createSeedFertilisationState(
        poste.name,
        fertilisationObservation?.status ?? "Pas commencé"
      ),
    ];
  })
);

function createSeedIrrigationState(
  posteName: string,
  status: ObservationItem["status"]
): IrrigationPosteState {
  const posteKey = posteName.toLowerCase().replace(/\s+/g, "-");
  const baseProgram: IrrigationProgram = {
    id: `${posteKey}-program-1`,
    title: "Programme 1",
    startDate: "2026-03-01",
    endDate: "2026-05-01",
    frequencyDays: "3",
    volumePerIrrigation: "50",
  };
  const baseProgramTwo: IrrigationProgram = {
    id: `${posteKey}-program-2`,
    title: "Programme 2",
    startDate: "2026-05-02",
    endDate: "2026-06-18",
    frequencyDays: "4",
    volumePerIrrigation: "42",
  };
  const baseStressObservation: IrrigationStressObservation = {
    id: `${posteKey}-stress-1`,
    title: "Observation 1",
    startDate: "2026-03-01",
    endDate: "2026-03-03",
    type: "Panne système d’irrigation",
    durationDays: "3",
    note: "Arrêt temporaire sur la ligne sud, reprise après remplacement du filtre.",
  };
  const baseStressObservationTwo: IrrigationStressObservation = {
    id: `${posteKey}-stress-2`,
    title: "Observation 2",
    startDate: "2026-05-22",
    endDate: "2026-05-24",
    type: "Vague de chaleur",
    durationDays: "2",
    note: "Hausse de la fréquence d’irrigation pendant le pic thermique.",
  };

  if (status === "Pas commencé") {
    return {
      trackingStartDate: "",
      trackingEndDate: "",
      programs: [],
      stressObservations: [],
    };
  }

  if (status === "En cours") {
    return {
      trackingStartDate: "2026-03-01",
      trackingEndDate: "",
      programs: [baseProgramTwo, baseProgram],
      stressObservations: [baseStressObservation],
    };
  }

  return {
    trackingStartDate: "2026-03-01",
    trackingEndDate: "2026-06-18",
    programs: [baseProgramTwo, baseProgram],
    stressObservations: [baseStressObservationTwo, baseStressObservation],
  };
}

const initialIrrigationByPoste: Record<string, IrrigationPosteState> = Object.fromEntries(
  postesFixes.map((poste) => {
    const irrigationObservation = (
      posteObservationsByPoste[poste.name] ?? posteObservationsByPoste["Poste Fixe 1254"]
    ).find((observation) => observation.name === "Irrigation");

    return [
      poste.name,
      createSeedIrrigationState(poste.name, irrigationObservation?.status ?? "Pas commencé"),
    ];
  })
);

const defaultPosteObservations = posteObservationsByPoste["Poste Fixe 1254"];
const groupedTrackingObservationNames = new Set<ObservationPhaseName>([
  "Fertilisation",
  "Irrigation",
]);

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

function getObservationDerivedStatus(
  observationForm: FleuraisonFormState | null
): ObservationItem["status"] {
  if (!observationForm || !observationForm.startDate) {
    return "Pas commencé";
  }
  if (observationForm.endDate) {
    return "Terminé";
  }

  return "En cours";
}

function areObservationFormsEqual(
  firstForm: FleuraisonFormState,
  secondForm: FleuraisonFormState
): boolean {
  if (firstForm.startDate !== secondForm.startDate) return false;
  if (firstForm.endDate !== secondForm.endDate) return false;
  if (firstForm.densityValue !== secondForm.densityValue) return false;
  if (firstForm.secondaryValue !== secondForm.secondaryValue) return false;
  if (firstForm.notes !== secondForm.notes) return false;
  if (firstForm.images.length !== secondForm.images.length) return false;

  for (let index = 0; index < firstForm.images.length; index += 1) {
    if (firstForm.images[index] !== secondForm.images[index]) return false;
  }

  return true;
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
const compactDatePlaceholder = "mm/dd/yyyy";
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
const posteProgressSteps = 3;
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

type PostFixePreviewSetup = {
  selectedPoste: PosteFixeItem | null;
  selectedObservation: ObservationItem | null;
  isEditingConfig: boolean;
  configDraft: PosteConfig;
  showUnsavedModal: boolean;
  showObservationUnsavedModal: boolean;
  isObservationEditMode: boolean;
  observationFormsByKey: Record<string, FleuraisonFormState>;
  fleuraisonForm: FleuraisonFormState;
  activeFertilisationTab: FertilisationSheetMode;
  isFertilisationSheetOpen: boolean;
  isFertilisationSheetEditing: boolean;
  fertilisationSheetMode: FertilisationSheetMode;
  selectedFertilisationSoilId: string | null;
  selectedFertilisationApportId: string | null;
  isCreatingFertilisationSoil: boolean;
  isCreatingFertilisationApport: boolean;
  fertilisationSoilForm: FertilisationSoilFormState;
  fertilisationApportForm: FertilisationApportFormState;
  isFertilisationCurrentDateEnd: boolean;
  activeIrrigationTab: IrrigationSheetMode;
  isIrrigationSheetOpen: boolean;
  isIrrigationSheetEditing: boolean;
  irrigationSheetMode: IrrigationSheetMode;
  selectedIrrigationProgramId: string | null;
  selectedIrrigationStressId: string | null;
  isCreatingIrrigationProgram: boolean;
  isCreatingIrrigationStress: boolean;
  irrigationProgramForm: IrrigationProgramFormState;
  irrigationStressForm: IrrigationStressFormState;
};

function cloneObservationForms(
  forms: Record<string, FleuraisonFormState>
): Record<string, FleuraisonFormState> {
  return Object.fromEntries(
    Object.entries(forms).map(([key, form]) => [
      key,
      {
        ...form,
        images: [...form.images],
      },
    ])
  );
}

function buildPostFixePreviewSetup(
  previewState?: PostFixePreviewState,
  previewObservationPhase: ObservationPhaseName = "Fleuraison"
): PostFixePreviewSetup | null {
  if (!previewState) {
    return null;
  }

  const effectiveObservationPhase =
    previewState === "observation-edit-fleuraison"
      ? "Fleuraison"
      : previewState === "observation-edit-nouaison"
        ? "Nouaison"
        : previewState === "observation-edit-chute"
          ? "Chute physiologique"
          : previewObservationPhase;

  const overviewPoste = postesFixes.find((poste) => poste.name === "Poste Fixe 5097") ?? postesFixes[0];
  const conduitePoste = postesFixes.find((poste) => poste.name === "Poste Fixe 9026") ?? postesFixes[0];
  const editPoste =
    effectiveObservationPhase === "Fertilisation" || effectiveObservationPhase === "Irrigation"
      ? conduitePoste
      : postesFixes.find((poste) => poste.name === "Poste Fixe 1254") ?? postesFixes[0];
  const readonlyPoste =
    effectiveObservationPhase === "Fertilisation" || effectiveObservationPhase === "Irrigation"
      ? conduitePoste
      : postesFixes.find((poste) => poste.name === "Poste Fixe 5097") ?? postesFixes[0];
  const editObservation =
    getPosteObservations(editPoste.name).find(
      (observation) => observation.name === effectiveObservationPhase
    ) ??
    getPosteObservations(editPoste.name)[0] ??
    null;
  const conduiteObservation =
    getPosteObservations(conduitePoste.name).find(
      (observation) => observation.name === "Fertilisation"
    ) ??
    getPosteObservations(conduitePoste.name)[0] ??
    null;
  const conduiteIrrigationObservation =
    getPosteObservations(conduitePoste.name).find(
      (observation) => observation.name === "Irrigation"
    ) ??
    getPosteObservations(conduitePoste.name)[0] ??
    null;
  const readonlyObservation =
    getPosteObservations(readonlyPoste.name).find(
      (observation) => observation.name === effectiveObservationPhase
    ) ??
    getPosteObservations(readonlyPoste.name)[0] ??
    null;
  const observationForms = cloneObservationForms(initialObservationFormsByKey);
  const overviewObservationKey = getObservationNotesKey(overviewPoste.name, "Nouaison");
  const overviewForm = observationForms[overviewObservationKey] ?? createDefaultFleuraisonForm("Nouaison");
  observationForms[overviewObservationKey] = {
    ...overviewForm,
    startDate: overviewForm.startDate || getCurrentIsoDate(),
    endDate: "",
    images: [...overviewForm.images],
  };
  const editObservationKey = getObservationNotesKey(editPoste.name, effectiveObservationPhase);
  const readonlyObservationKey = getObservationNotesKey(readonlyPoste.name, effectiveObservationPhase);
  const editFormSource =
    observationForms[editObservationKey] ?? createDefaultFleuraisonForm(effectiveObservationPhase);
  const editForm: FleuraisonFormState = {
    ...editFormSource,
    endDate: "",
    images: [...editFormSource.images],
  };
  const readonlyFormSource =
    observationForms[readonlyObservationKey] ?? createDefaultFleuraisonForm(effectiveObservationPhase);
  const readonlyForm: FleuraisonFormState = {
    ...readonlyFormSource,
    startDate: readonlyFormSource.startDate || getCurrentIsoDate(),
    endDate: readonlyFormSource.endDate || readonlyFormSource.startDate || getCurrentIsoDate(),
    images: [...readonlyFormSource.images],
  };
  observationForms[readonlyObservationKey] = readonlyForm;
  const conduiteFertilisationState = initialFertilisationByPoste[conduitePoste.name] ?? {
    trackingStartDate: "",
    trackingEndDate: "",
    soilObservations: [],
    apports: [],
  };
  const conduiteSoilRecord = conduiteFertilisationState.soilObservations[0] ?? null;
  const conduiteApportRecord = conduiteFertilisationState.apports[0] ?? null;
  const conduiteIrrigationState = initialIrrigationByPoste[conduitePoste.name] ?? {
    trackingStartDate: "",
    trackingEndDate: "",
    programs: [],
    stressObservations: [],
  };
  const conduiteProgramRecord = conduiteIrrigationState.programs[0] ?? null;
  const conduiteStressRecord = conduiteIrrigationState.stressObservations[0] ?? null;

  const baseSetup: PostFixePreviewSetup = {
    selectedPoste: null,
    selectedObservation: null,
    isEditingConfig: false,
    configDraft: defaultPosteConfig,
    showUnsavedModal: false,
    showObservationUnsavedModal: false,
    isObservationEditMode: true,
    observationFormsByKey: observationForms,
    fleuraisonForm: defaultFleuraisonForm,
    activeFertilisationTab: "soil",
    isFertilisationSheetOpen: false,
    isFertilisationSheetEditing: false,
    fertilisationSheetMode: "soil",
    selectedFertilisationSoilId: null,
    selectedFertilisationApportId: null,
    isCreatingFertilisationSoil: false,
    isCreatingFertilisationApport: false,
    fertilisationSoilForm: createDefaultFertilisationSoilForm(),
    fertilisationApportForm: createDefaultFertilisationApportForm(),
    isFertilisationCurrentDateEnd: false,
    activeIrrigationTab: "program",
    isIrrigationSheetOpen: false,
    isIrrigationSheetEditing: false,
    irrigationSheetMode: "program",
    selectedIrrigationProgramId: null,
    selectedIrrigationStressId: null,
    isCreatingIrrigationProgram: false,
    isCreatingIrrigationStress: false,
    irrigationProgramForm: createDefaultIrrigationProgramForm(),
    irrigationStressForm: createDefaultIrrigationStressForm(),
  };

  switch (previewState) {
    case "list-loading":
    case "list-empty":
    case "list-data":
      return baseSetup;
    case "detail-loading":
    case "detail-overview":
      return {
        ...baseSetup,
        selectedPoste: overviewPoste,
      };
    case "conduite-fertilisation-soil-tab":
      return {
        ...baseSetup,
        selectedPoste: conduitePoste,
        selectedObservation: conduiteObservation,
        activeFertilisationTab: "soil",
        fertilisationSheetMode: "soil",
        selectedFertilisationSoilId: conduiteSoilRecord?.id ?? null,
        fertilisationSoilForm: conduiteSoilRecord
          ? createFertilisationSoilFormFromRecord(conduiteSoilRecord)
          : createDefaultFertilisationSoilForm(),
      };
    case "conduite-fertilisation-apport-tab":
      return {
        ...baseSetup,
        selectedPoste: conduitePoste,
        selectedObservation: conduiteObservation,
        activeFertilisationTab: "apport",
        fertilisationSheetMode: "apport",
        selectedFertilisationApportId: conduiteApportRecord?.id ?? null,
        fertilisationApportForm: conduiteApportRecord
          ? createFertilisationApportFormFromRecord(conduiteApportRecord)
          : createDefaultFertilisationApportForm(),
      };
    case "conduite-fertilisation-soil-create":
      return {
        ...baseSetup,
        selectedPoste: conduitePoste,
        selectedObservation: conduiteObservation,
        activeFertilisationTab: "soil",
        isFertilisationSheetOpen: true,
        isFertilisationSheetEditing: true,
        fertilisationSheetMode: "soil",
        isCreatingFertilisationSoil: true,
        fertilisationSoilForm: createDefaultFertilisationSoilForm(),
      };
    case "conduite-fertilisation-soil-view":
      return {
        ...baseSetup,
        selectedPoste: conduitePoste,
        selectedObservation: conduiteObservation,
        activeFertilisationTab: "soil",
        isFertilisationSheetOpen: true,
        isFertilisationSheetEditing: false,
        fertilisationSheetMode: "soil",
        selectedFertilisationSoilId: conduiteSoilRecord?.id ?? null,
        fertilisationSoilForm: conduiteSoilRecord
          ? createFertilisationSoilFormFromRecord(conduiteSoilRecord)
          : createDefaultFertilisationSoilForm(),
        isFertilisationCurrentDateEnd:
          conduiteSoilRecord?.date === conduiteFertilisationState.trackingEndDate,
      };
    case "conduite-fertilisation-soil-unsaved":
      return {
        ...baseSetup,
        selectedPoste: conduitePoste,
        selectedObservation: conduiteObservation,
        showObservationUnsavedModal: true,
        activeFertilisationTab: "soil",
        isFertilisationSheetOpen: true,
        isFertilisationSheetEditing: true,
        fertilisationSheetMode: "soil",
        isCreatingFertilisationSoil: true,
        fertilisationSoilForm: {
          ...createDefaultFertilisationSoilForm(),
          date: "2026-08-03",
          organicMatter: "Faible",
          waterRetention: "Moyenne",
          deficiencyRisk: "Carence Mg",
        },
      };
    case "conduite-fertilisation-apport-create":
      return {
        ...baseSetup,
        selectedPoste: conduitePoste,
        selectedObservation: conduiteObservation,
        activeFertilisationTab: "apport",
        isFertilisationSheetOpen: true,
        isFertilisationSheetEditing: true,
        fertilisationSheetMode: "apport",
        isCreatingFertilisationApport: true,
        fertilisationApportForm: createDefaultFertilisationApportForm(),
      };
    case "conduite-fertilisation-apport-view":
      return {
        ...baseSetup,
        selectedPoste: conduitePoste,
        selectedObservation: conduiteObservation,
        activeFertilisationTab: "apport",
        isFertilisationSheetOpen: true,
        isFertilisationSheetEditing: false,
        fertilisationSheetMode: "apport",
        selectedFertilisationApportId: conduiteApportRecord?.id ?? null,
        fertilisationApportForm: conduiteApportRecord
          ? createFertilisationApportFormFromRecord(conduiteApportRecord)
          : createDefaultFertilisationApportForm(),
        isFertilisationCurrentDateEnd:
          conduiteApportRecord?.date === conduiteFertilisationState.trackingEndDate,
      };
    case "conduite-irrigation-program-tab":
      return {
        ...baseSetup,
        selectedPoste: conduitePoste,
        selectedObservation: conduiteIrrigationObservation,
        activeIrrigationTab: "program",
        irrigationSheetMode: "program",
        selectedIrrigationProgramId: conduiteProgramRecord?.id ?? null,
        irrigationProgramForm: conduiteProgramRecord
          ? createIrrigationProgramFormFromRecord(conduiteProgramRecord)
          : createDefaultIrrigationProgramForm(),
      };
    case "conduite-irrigation-stress-tab":
      return {
        ...baseSetup,
        selectedPoste: conduitePoste,
        selectedObservation: conduiteIrrigationObservation,
        activeIrrigationTab: "stress",
        irrigationSheetMode: "stress",
        selectedIrrigationStressId: conduiteStressRecord?.id ?? null,
        irrigationStressForm: conduiteStressRecord
          ? createIrrigationStressFormFromRecord(conduiteStressRecord)
          : createDefaultIrrigationStressForm(),
      };
    case "conduite-irrigation-program-create":
      return {
        ...baseSetup,
        selectedPoste: conduitePoste,
        selectedObservation: conduiteIrrigationObservation,
        activeIrrigationTab: "program",
        isIrrigationSheetOpen: true,
        isIrrigationSheetEditing: true,
        irrigationSheetMode: "program",
        isCreatingIrrigationProgram: true,
        irrigationProgramForm: createDefaultIrrigationProgramForm(),
      };
    case "conduite-irrigation-program-view":
      return {
        ...baseSetup,
        selectedPoste: conduitePoste,
        selectedObservation: conduiteIrrigationObservation,
        activeIrrigationTab: "program",
        isIrrigationSheetOpen: true,
        isIrrigationSheetEditing: false,
        irrigationSheetMode: "program",
        selectedIrrigationProgramId: conduiteProgramRecord?.id ?? null,
        irrigationProgramForm: conduiteProgramRecord
          ? createIrrigationProgramFormFromRecord(conduiteProgramRecord)
          : createDefaultIrrigationProgramForm(),
      };
    case "conduite-irrigation-program-unsaved":
      return {
        ...baseSetup,
        selectedPoste: conduitePoste,
        selectedObservation: conduiteIrrigationObservation,
        showObservationUnsavedModal: true,
        activeIrrigationTab: "program",
        isIrrigationSheetOpen: true,
        isIrrigationSheetEditing: true,
        irrigationSheetMode: "program",
        isCreatingIrrigationProgram: true,
        irrigationProgramForm: {
          ...createDefaultIrrigationProgramForm(),
          startDate: "2026-08-01",
          endDate: "2026-08-06",
          frequencyDays: "2",
          volumePerIrrigation: "46",
        },
      };
    case "conduite-irrigation-stress-create":
      return {
        ...baseSetup,
        selectedPoste: conduitePoste,
        selectedObservation: conduiteIrrigationObservation,
        activeIrrigationTab: "stress",
        isIrrigationSheetOpen: true,
        isIrrigationSheetEditing: true,
        irrigationSheetMode: "stress",
        isCreatingIrrigationStress: true,
        irrigationStressForm: createDefaultIrrigationStressForm(),
      };
    case "conduite-irrigation-stress-view":
      return {
        ...baseSetup,
        selectedPoste: conduitePoste,
        selectedObservation: conduiteIrrigationObservation,
        activeIrrigationTab: "stress",
        isIrrigationSheetOpen: true,
        isIrrigationSheetEditing: false,
        irrigationSheetMode: "stress",
        selectedIrrigationStressId: conduiteStressRecord?.id ?? null,
        irrigationStressForm: conduiteStressRecord
          ? createIrrigationStressFormFromRecord(conduiteStressRecord)
          : createDefaultIrrigationStressForm(),
      };
    case "conduite-irrigation-stress-unsaved":
      return {
        ...baseSetup,
        selectedPoste: conduitePoste,
        selectedObservation: conduiteIrrigationObservation,
        showObservationUnsavedModal: true,
        activeIrrigationTab: "stress",
        isIrrigationSheetOpen: true,
        isIrrigationSheetEditing: true,
        irrigationSheetMode: "stress",
        isCreatingIrrigationStress: true,
        irrigationStressForm: {
          ...createDefaultIrrigationStressForm(),
          startDate: "2026-08-04",
          endDate: "2026-08-06",
          type: "Manque d’eau",
          durationDays: "2",
          note: "Réduction temporaire du débit observée sur la parcelle ouest.",
        },
      };
    case "observation-readonly":
      return {
        ...baseSetup,
        selectedPoste: readonlyPoste,
        selectedObservation: readonlyObservation,
        isObservationEditMode: false,
        fleuraisonForm: readonlyForm,
      };
    case "observation-unsaved-modal":
      return {
        ...baseSetup,
        selectedPoste: editPoste,
        selectedObservation: editObservation,
        showObservationUnsavedModal: true,
        fleuraisonForm: editForm,
      };
    case "observation-edit":
    case "observation-edit-fleuraison":
    case "observation-edit-nouaison":
    case "observation-edit-chute":
      return {
        ...baseSetup,
        selectedPoste: editPoste,
        selectedObservation: editObservation,
        fleuraisonForm: editForm,
      };
    case "observation-status-not-started": {
      const statusPoste = postesFixes.find((poste) => poste.name === "Poste Fixe 6880") ?? postesFixes[0];
      const statusObservation =
        getPosteObservations(statusPoste.name).find((observation) => observation.name === "Fleuraison") ??
        getPosteObservations(statusPoste.name)[0] ??
        null;

      return {
        ...baseSetup,
        selectedPoste: statusPoste,
        selectedObservation: statusObservation,
        isObservationEditMode: true,
        fleuraisonForm: createDefaultFleuraisonForm("Fleuraison"),
      };
    }
    case "observation-status-in-progress": {
      const statusPoste = postesFixes.find((poste) => poste.name === "Poste Fixe 6880") ?? postesFixes[0];
      const statusObservation =
        getPosteObservations(statusPoste.name).find((observation) => observation.name === "Fleuraison") ??
        getPosteObservations(statusPoste.name)[0] ??
        null;
      const inProgressKey = getObservationNotesKey(statusPoste.name, "Fleuraison");
      const inProgressForm: FleuraisonFormState = {
        ...createDefaultFleuraisonForm("Fleuraison"),
        startDate: getCurrentIsoDate(),
        endDate: "",
        secondaryValue: "2",
        notes: "Observation en cours avec progression visible sur la parcelle.",
        images: [fleuraisonSeedImage],
      };
      observationForms[inProgressKey] = inProgressForm;

      return {
        ...baseSetup,
        selectedPoste: statusPoste,
        selectedObservation: statusObservation,
        isObservationEditMode: true,
        observationFormsByKey: observationForms,
        fleuraisonForm: inProgressForm,
      };
    }
    case "observation-status-done": {
      const statusPoste = postesFixes.find((poste) => poste.name === "Poste Fixe 5097") ?? postesFixes[0];
      const statusObservation =
        getPosteObservations(statusPoste.name).find((observation) => observation.name === "Fleuraison") ??
        getPosteObservations(statusPoste.name)[0] ??
        null;
      const doneKey = getObservationNotesKey(statusPoste.name, "Fleuraison");
      const doneFormSource = observationForms[doneKey] ?? createDefaultFleuraisonForm("Fleuraison");
      const doneForm: FleuraisonFormState = {
        ...doneFormSource,
        startDate: doneFormSource.startDate || getCurrentIsoDate(),
        endDate: doneFormSource.endDate || doneFormSource.startDate || getCurrentIsoDate(),
        images: [...doneFormSource.images],
      };
      observationForms[doneKey] = doneForm;

      return {
        ...baseSetup,
        selectedPoste: statusPoste,
        selectedObservation: statusObservation,
        isObservationEditMode: true,
        observationFormsByKey: observationForms,
        fleuraisonForm: doneForm,
      };
    }
    default:
      return baseSetup;
  }
}

export function WorkerAppPostFixePage({
  showDeviceFrame,
  theme,
  frameTheme,
  frameView,
  previewState,
  previewObservationPhase,
  isInteractive = true,
  embedded = false,
  onLayoutModeChange,
}: WorkerAppPostFixePageProps) {
  const syncStatus: SyncStatus = "idle";
  const previewSetup = buildPostFixePreviewSetup(
    previewState,
    previewObservationPhase ?? "Fleuraison"
  );
  const [selectedPoste, setSelectedPoste] = useState<PosteFixeItem | null>(
    previewSetup?.selectedPoste ?? null
  );
  const [isEditingConfig, setIsEditingConfig] = useState(previewSetup?.isEditingConfig ?? false);
  const [posteConfigs, setPosteConfigs] =
    useState<Record<string, PosteConfig>>(initialPosteConfigs);
  const [configDraft, setConfigDraft] = useState<PosteConfig>(
    previewSetup?.configDraft ?? defaultPosteConfig
  );
  const [showUnsavedModal, setShowUnsavedModal] = useState(previewSetup?.showUnsavedModal ?? false);
  const [showObservationUnsavedModal, setShowObservationUnsavedModal] = useState(
    previewSetup?.showObservationUnsavedModal ?? false
  );
  const [observationUnsavedContext, setObservationUnsavedContext] =
    useState<ObservationUnsavedContext>("exit-observation");
  const [isObservationEditMode, setIsObservationEditMode] = useState(
    previewSetup?.isObservationEditMode ?? true
  );
  const [selectedObservation, setSelectedObservation] = useState<ObservationItem | null>(
    previewSetup?.selectedObservation ?? null
  );
  const fleuraisonImageInputRef = useRef<HTMLInputElement | null>(null);
  const [observationFormsByKey, setObservationFormsByKey] = useState<
    Record<string, FleuraisonFormState>
  >(previewSetup?.observationFormsByKey ?? initialObservationFormsByKey);
  const [fleuraisonForm, setFleuraisonForm] = useState<FleuraisonFormState>(
    previewSetup?.fleuraisonForm ?? defaultFleuraisonForm
  );
  const [fertilisationByPoste, setFertilisationByPoste] = useState<
    Record<string, FertilisationPosteState>
  >(initialFertilisationByPoste);
  const [selectedFertilisationSoilId, setSelectedFertilisationSoilId] = useState<string | null>(
    previewSetup?.selectedFertilisationSoilId ?? null
  );
  const [selectedFertilisationApportId, setSelectedFertilisationApportId] = useState<string | null>(
    previewSetup?.selectedFertilisationApportId ?? null
  );
  const [isCreatingFertilisationSoil, setIsCreatingFertilisationSoil] = useState(
    previewSetup?.isCreatingFertilisationSoil ?? false
  );
  const [isCreatingFertilisationApport, setIsCreatingFertilisationApport] = useState(
    previewSetup?.isCreatingFertilisationApport ?? false
  );
  const [activeFertilisationTab, setActiveFertilisationTab] =
    useState<FertilisationSheetMode>(previewSetup?.activeFertilisationTab ?? "soil");
  const [isFertilisationSheetOpen, setIsFertilisationSheetOpen] = useState(
    previewSetup?.isFertilisationSheetOpen ?? false
  );
  const [isFertilisationSheetEditing, setIsFertilisationSheetEditing] = useState(
    previewSetup?.isFertilisationSheetEditing ?? false
  );
  const [fertilisationSheetMode, setFertilisationSheetMode] =
    useState<FertilisationSheetMode>(previewSetup?.fertilisationSheetMode ?? "soil");
  const [fertilisationSoilForm, setFertilisationSoilForm] = useState<FertilisationSoilFormState>(
    previewSetup?.fertilisationSoilForm ?? createDefaultFertilisationSoilForm()
  );
  const [fertilisationApportForm, setFertilisationApportForm] =
    useState<FertilisationApportFormState>(
      previewSetup?.fertilisationApportForm ?? createDefaultFertilisationApportForm()
    );
  const [isFertilisationCurrentDateEnd, setIsFertilisationCurrentDateEnd] = useState(
    previewSetup?.isFertilisationCurrentDateEnd ?? false
  );
  const [irrigationByPoste, setIrrigationByPoste] = useState<Record<string, IrrigationPosteState>>(
    initialIrrigationByPoste
  );
  const [selectedIrrigationProgramId, setSelectedIrrigationProgramId] = useState<string | null>(
    previewSetup?.selectedIrrigationProgramId ?? null
  );
  const [selectedIrrigationStressId, setSelectedIrrigationStressId] = useState<string | null>(
    previewSetup?.selectedIrrigationStressId ?? null
  );
  const [isCreatingIrrigationProgram, setIsCreatingIrrigationProgram] = useState(
    previewSetup?.isCreatingIrrigationProgram ?? false
  );
  const [isCreatingIrrigationStress, setIsCreatingIrrigationStress] = useState(
    previewSetup?.isCreatingIrrigationStress ?? false
  );
  const [activeIrrigationTab, setActiveIrrigationTab] = useState<IrrigationSheetMode>(
    previewSetup?.activeIrrigationTab ?? "program"
  );
  const [isIrrigationSheetOpen, setIsIrrigationSheetOpen] = useState(
    previewSetup?.isIrrigationSheetOpen ?? false
  );
  const [isIrrigationSheetEditing, setIsIrrigationSheetEditing] = useState(
    previewSetup?.isIrrigationSheetEditing ?? false
  );
  const [irrigationSheetMode, setIrrigationSheetMode] = useState<IrrigationSheetMode>(
    previewSetup?.irrigationSheetMode ?? "program"
  );
  const [irrigationProgramForm, setIrrigationProgramForm] = useState<IrrigationProgramFormState>(
    previewSetup?.irrigationProgramForm ?? createDefaultIrrigationProgramForm()
  );
  const [irrigationStressForm, setIrrigationStressForm] = useState<IrrigationStressFormState>(
    previewSetup?.irrigationStressForm ?? createDefaultIrrigationStressForm()
  );
  const syncBadgeStateClass = styles.syncBadgeIdle;
  const syncIcon = syncStatusIconMap[syncStatus];
  const shouldShowSyncBadge = !embedded;
  const renderSyncBadge = () => (
    <div className={`${styles.syncBadge} ${syncBadgeStateClass}`} role="img" aria-label="Synchronisation inactive">
      <span className={styles.googleSymbol} aria-hidden="true">
        {syncIcon}
      </span>
    </div>
  );
  const resolvedFrameTheme = frameTheme ?? theme;
  const frameClass =
    resolvedFrameTheme === "light" ? styles.androidCanvasLightFrame : styles.androidCanvas;
  const isConfigEditScreen = Boolean(selectedPoste && isEditingConfig);
  const selectedObservationPhaseName: ObservationPhaseName | null =
    selectedObservation != null && isObservationPhaseName(selectedObservation.name)
      ? selectedObservation.name
      : null;
  const activeObservationPhaseName = selectedObservationPhaseName ?? "Fleuraison";
  const isFertilisationScreen = activeObservationPhaseName === "Fertilisation";
  const isIrrigationScreen = activeObservationPhaseName === "Irrigation";
  const activeObservationPhaseConfig = observationPhaseConfigs[activeObservationPhaseName];
  const isObservationScreen = Boolean(selectedPoste && selectedObservationPhaseName);
  const isDetailScreen = Boolean(selectedPoste);
  const isFullScreenFlow = isDetailScreen || isConfigEditScreen || isObservationScreen;
  useEffect(() => {
    onLayoutModeChange?.(isFullScreenFlow ? "fullScreen" : "default");
  }, [isFullScreenFlow, onLayoutModeChange]);

  const selectedObservationNotesKey =
    selectedPoste != null && selectedObservationPhaseName != null
      ? getObservationNotesKey(selectedPoste.name, selectedObservationPhaseName)
      : null;
  const savedObservationFormForPhase =
    selectedObservationNotesKey != null ? observationFormsByKey[selectedObservationNotesKey] : undefined;
  const initialObservationFormForPhase =
    savedObservationFormForPhase != null
      ? savedObservationFormForPhase
      : createDefaultFleuraisonForm(activeObservationPhaseName);
  const selectedFertilisationState =
    selectedPoste != null
      ? (fertilisationByPoste[selectedPoste.name] ?? {
          trackingStartDate: "",
          trackingEndDate: "",
          soilObservations: [],
          apports: [],
        })
      : { trackingStartDate: "", trackingEndDate: "", soilObservations: [], apports: [] };
  const selectedIrrigationState =
    selectedPoste != null
      ? (irrigationByPoste[selectedPoste.name] ?? {
          trackingStartDate: "",
          trackingEndDate: "",
          programs: [],
          stressObservations: [],
        })
      : { trackingStartDate: "", trackingEndDate: "", programs: [], stressObservations: [] };
  const selectedFertilisationSoilRecord = selectedFertilisationState.soilObservations.find(
    (record) => record.id === selectedFertilisationSoilId
  );
  const selectedFertilisationApportRecord = selectedFertilisationState.apports.find(
    (record) => record.id === selectedFertilisationApportId
  );
  const selectedIrrigationProgramRecord = selectedIrrigationState.programs.find(
    (record) => record.id === selectedIrrigationProgramId
  );
  const selectedIrrigationStressRecord = selectedIrrigationState.stressObservations.find(
    (record) => record.id === selectedIrrigationStressId
  );
  const initialFertilisationSoilForm = selectedFertilisationSoilRecord
    ? createFertilisationSoilFormFromRecord(selectedFertilisationSoilRecord)
    : createDefaultFertilisationSoilForm();
  const initialFertilisationApportForm = selectedFertilisationApportRecord
    ? createFertilisationApportFormFromRecord(selectedFertilisationApportRecord)
    : createDefaultFertilisationApportForm();
  const initialIrrigationProgramForm = selectedIrrigationProgramRecord
    ? createIrrigationProgramFormFromRecord(selectedIrrigationProgramRecord)
    : createDefaultIrrigationProgramForm();
  const initialIrrigationStressForm = selectedIrrigationStressRecord
    ? createIrrigationStressFormFromRecord(selectedIrrigationStressRecord)
    : createDefaultIrrigationStressForm();
  const initialFertilisationCurrentDateEnd =
    fertilisationSheetMode === "soil"
      ? selectedFertilisationSoilRecord?.date === selectedFertilisationState.trackingEndDate
      : selectedFertilisationApportRecord?.date === selectedFertilisationState.trackingEndDate;
  const hasFertilisationSoilChanges = !areFertilisationSoilFormsEqual(
    fertilisationSoilForm,
    initialFertilisationSoilForm
  );
  const hasFertilisationApportChanges = !areFertilisationApportFormsEqual(
    fertilisationApportForm,
    initialFertilisationApportForm
  );
  const hasIrrigationProgramChanges = !areIrrigationProgramFormsEqual(
    irrigationProgramForm,
    initialIrrigationProgramForm
  );
  const hasIrrigationStressChanges = !areIrrigationStressFormsEqual(
    irrigationStressForm,
    initialIrrigationStressForm
  );
  const activeFertilisationDate =
    fertilisationSheetMode === "soil" ? fertilisationSoilForm.date : fertilisationApportForm.date;
  const canUseFertilisationCurrentDateAsEnd =
    (fertilisationSheetMode === "soil" || selectedFertilisationState.soilObservations.length > 0) &&
    (fertilisationSheetMode === "apport" || selectedFertilisationState.apports.length > 0);
  const hasActiveFertilisationSheetChanges = isFertilisationSheetOpen
    ? isFertilisationSheetEditing &&
      ((fertilisationSheetMode === "soil"
        ? hasFertilisationSoilChanges
        : hasFertilisationApportChanges) ||
        initialFertilisationCurrentDateEnd !== isFertilisationCurrentDateEnd)
    : false;
  const hasActiveIrrigationSheetChanges = isIrrigationSheetOpen
    ? isIrrigationSheetEditing &&
      (irrigationSheetMode === "program"
        ? hasIrrigationProgramChanges
        : hasIrrigationStressChanges)
    : false;
  const observationFormStatus = isFertilisationScreen
    ? getDerivedFertilisationStatus(selectedFertilisationState)
    : isIrrigationScreen
      ? getDerivedIrrigationStatus(selectedIrrigationState)
    : getObservationDerivedStatus(savedObservationFormForPhase ?? null);
  const isObservationReadOnly = observationFormStatus === "Terminé" && !isObservationEditMode;
  const hasObservationChanges = isObservationScreen && isObservationEditMode
    ? isFertilisationScreen
      ? hasActiveFertilisationSheetChanges
      : isIrrigationScreen
        ? hasActiveIrrigationSheetChanges
      : !areObservationFormsEqual(fleuraisonForm, initialObservationFormForPhase)
    : false;
  let fleuraisonValidationError: string | null = null;
  if (!isFertilisationScreen && !fleuraisonForm.startDate) {
    fleuraisonValidationError = "La date de début est requise.";
  } else if (
    !isFertilisationScreen &&
    fleuraisonForm.endDate &&
    parseIsoDateToTime(fleuraisonForm.endDate) < parseIsoDateToTime(fleuraisonForm.startDate)
  ) {
    fleuraisonValidationError =
      "La date finale doit être postérieure ou égale à la date de début.";
  }
  const hasFleuraisonValidationError = fleuraisonValidationError != null;
  const soilFertilisationValidationError =
    !fertilisationSoilForm.date ? "La date de l'observation est requise." : null;
  const apportDose = Number.parseFloat(fertilisationApportForm.dose);
  const hasApportDoseValue = fertilisationApportForm.dose.trim() !== "";
  const hasValidApportDose = hasApportDoseValue && Number.isFinite(apportDose) && apportDose > 0;
  const apportFertilisationValidationError = !fertilisationApportForm.date
    ? "La date de l'apport est requise."
    : hasApportDoseValue && !hasValidApportDose
        ? "Dose invalide."
        : null;
  const activeFertilisationValidationError =
    fertilisationSheetMode === "soil"
      ? soilFertilisationValidationError
      : apportFertilisationValidationError;
  const isActiveFertilisationSaveDisabled =
    fertilisationSheetMode === "soil"
      ? activeFertilisationValidationError != null
      : !fertilisationApportForm.date || activeFertilisationValidationError != null;
  const isFertilisationSheetReadOnly = isFertilisationSheetOpen && !isFertilisationSheetEditing;
  const irrigationFrequency = Number.parseFloat(irrigationProgramForm.frequencyDays);
  const irrigationVolume = Number.parseFloat(irrigationProgramForm.volumePerIrrigation);
  const irrigationStressDuration = Number.parseFloat(irrigationStressForm.durationDays);
  const hasIrrigationFrequencyValue = irrigationProgramForm.frequencyDays.trim() !== "";
  const hasIrrigationVolumeValue = irrigationProgramForm.volumePerIrrigation.trim() !== "";
  const hasIrrigationStressDurationValue = irrigationStressForm.durationDays.trim() !== "";
  const hasValidIrrigationFrequency =
    hasIrrigationFrequencyValue && Number.isFinite(irrigationFrequency) && irrigationFrequency > 0;
  const hasValidIrrigationVolume =
    hasIrrigationVolumeValue && Number.isFinite(irrigationVolume) && irrigationVolume > 0;
  const hasValidIrrigationStressDuration =
    hasIrrigationStressDurationValue &&
    Number.isFinite(irrigationStressDuration) &&
    irrigationStressDuration > 0;
  const irrigationProgramValidationError = !irrigationProgramForm.startDate
    ? "La date de début est requise."
    : irrigationProgramForm.endDate &&
        parseIsoDateToTime(irrigationProgramForm.endDate) <
          parseIsoDateToTime(irrigationProgramForm.startDate)
      ? "La date fin doit être postérieure ou égale à la date de début."
    : hasIrrigationFrequencyValue && !hasValidIrrigationFrequency
      ? "La fréquence d’irrigation doit être supérieure à 0."
      : hasIrrigationVolumeValue && !hasValidIrrigationVolume
        ? "Le volume par irrigation doit être supérieure à 0."
        : null;
  const irrigationStressValidationError = !irrigationStressForm.startDate
    ? "La date de début est requise."
    : irrigationStressForm.endDate &&
        parseIsoDateToTime(irrigationStressForm.endDate) <
          parseIsoDateToTime(irrigationStressForm.startDate)
      ? "La date fin doit être postérieure ou égale à la date de début."
    : hasIrrigationStressDurationValue && !hasValidIrrigationStressDuration
      ? "La durée doit être supérieure à 0."
      : null;
  const activeIrrigationValidationError =
    irrigationSheetMode === "program"
      ? irrigationProgramValidationError
      : irrigationStressValidationError;
  const isActiveIrrigationSaveDisabled =
    irrigationSheetMode === "program"
      ? !irrigationProgramForm.startDate || activeIrrigationValidationError != null
      : !irrigationStressForm.startDate ||
        activeIrrigationValidationError != null ||
        (hasIrrigationStressDurationValue && !hasValidIrrigationStressDuration);
  const isIrrigationSheetReadOnly = isIrrigationSheetOpen && !isIrrigationSheetEditing;
  const hasSavedConfig = selectedPoste != null ? Boolean(posteConfigs[selectedPoste.name]) : false;
  const shouldShowPosteDetailLoading = Boolean(
    selectedPoste && frameView === "loading" && !isEditingConfig && !isObservationScreen
  );
  const renderPosteProgressMilestones = (completedSteps: number) => {
    const normalizedCompletedSteps = Math.max(0, Math.min(posteProgressSteps, completedSteps));

    return (
      <div className={styles.posteProgressTrack} aria-hidden="true">
        {Array.from({ length: posteProgressSteps }).map((_, index) => (
          <span
            key={index}
            className={`${styles.posteProgressSegment} ${
              index < normalizedCompletedSteps ? styles.posteProgressSegmentDone : ""
            }`}
          />
        ))}
      </div>
    );
  };
  const getPosteObservationsWithFleuraisonState = (posteName: string): ObservationItem[] => {
    const baseObservations = getPosteObservations(posteName);
    return baseObservations.map((observation) => {
      if (observation.name === "Fertilisation") {
        const fertilisationState = fertilisationByPoste[posteName] ?? {
          trackingStartDate: "",
          trackingEndDate: "",
          soilObservations: [],
          apports: [],
        };
        const latestSoilDate = fertilisationState.soilObservations
          .map((item) => item.date)
          .filter(Boolean)
          .sort((a, b) => parseIsoDateToTime(b) - parseIsoDateToTime(a))[0];
        const latestApportDate = fertilisationState.apports
          .map((item) => item.date)
          .filter(Boolean)
          .sort((a, b) => parseIsoDateToTime(b) - parseIsoDateToTime(a))[0];
        const latestDate = [latestSoilDate, latestApportDate]
          .filter((value): value is string => Boolean(value))
          .sort((a, b) => parseIsoDateToTime(b) - parseIsoDateToTime(a))[0];
        const fertilisationStatus = getDerivedFertilisationStatus(fertilisationState);

        return {
          ...observation,
          status: fertilisationStatus,
          lastUpdate: latestDate ? formatDateShortFr(latestDate) : observation.lastUpdate,
        };
      }

      if (observation.name === "Irrigation") {
        const irrigationState = irrigationByPoste[posteName] ?? {
          trackingStartDate: "",
          trackingEndDate: "",
          programs: [],
          stressObservations: [],
        };
        const latestProgramDate = irrigationState.programs
          .map((item) => item.startDate)
          .filter(Boolean)
          .sort((a, b) => parseIsoDateToTime(b) - parseIsoDateToTime(a))[0];
        const latestStressDate = irrigationState.stressObservations
          .flatMap((item) => [item.startDate, item.endDate])
          .filter(Boolean)
          .sort((a, b) => parseIsoDateToTime(b) - parseIsoDateToTime(a))[0];
        const latestDate = [latestProgramDate, latestStressDate]
          .filter((value): value is string => Boolean(value))
          .sort((a, b) => parseIsoDateToTime(b) - parseIsoDateToTime(a))[0];
        const irrigationStatus = getDerivedIrrigationStatus(irrigationState);

        return {
          ...observation,
          status: irrigationStatus,
          lastUpdate: latestDate ? formatDateShortFr(latestDate) : observation.lastUpdate,
        };
      }

      if (!isObservationPhaseName(observation.name)) {
        return observation;
      }

      const phaseForm =
        observationFormsByKey[getObservationNotesKey(posteName, observation.name)] ?? null;
      const phaseStatus = getObservationDerivedStatus(phaseForm);
      const lastUpdateDate = phaseForm?.endDate || phaseForm?.startDate;

      return {
        ...observation,
        status: phaseStatus,
        lastUpdate: lastUpdateDate ? formatDateShortFr(lastUpdateDate) : observation.lastUpdate,
      };
    });
  };
  const selectedPosteObservations =
    selectedPoste != null
      ? getPosteObservationsWithFleuraisonState(selectedPoste.name)
      : defaultPosteObservations;
  const selectedPostePhaseObservations = selectedPosteObservations.filter(
    (observation) => !groupedTrackingObservationNames.has(observation.name as ObservationPhaseName)
  );
  const selectedPosteTrackingObservations = selectedPosteObservations.filter((observation) =>
    groupedTrackingObservationNames.has(observation.name as ObservationPhaseName)
  );
  const selectedPosteCompletedCount = getCompletedCount(selectedPostePhaseObservations);
  const selectedPosteProgress = getProgressFromObservations(selectedPostePhaseObservations);
  const campaignHeaderMeta = "Campagne 2025-2026";
  const posteCards = postesFixes.map((poste) => {
    const observations = getPosteObservationsWithFleuraisonState(poste.name);
    const phaseObservations = observations.filter(
      (observation) => !groupedTrackingObservationNames.has(observation.name as ObservationPhaseName)
    );
    const progress = getProgressFromObservations(phaseObservations);
    const completedCount = getCompletedCount(phaseObservations);
    const status = getPosteStatus(progress);

    return { poste, observations, phaseObservations, progress, completedCount, status };
  });
  const selectedPosteConfig =
    selectedPoste != null
      ? (posteConfigs[selectedPoste.name] ?? emptyPosteConfig)
      : emptyPosteConfig;
  const hasConfigChanges =
    configDraft.irrigationType !== selectedPosteConfig.irrigationType ||
    configDraft.waterSource !== selectedPosteConfig.waterSource ||
    configDraft.waterQuality !== selectedPosteConfig.waterQuality;
  const handleObservationSelect = (observation: ObservationItem) => {
    if (!selectedPoste || !isObservationPhaseName(observation.name)) {
      return;
    }

    setSelectedObservation(observation);
    setShowObservationUnsavedModal(false);

    if (observation.name === "Fertilisation") {
      const fertilisationState = fertilisationByPoste[selectedPoste.name] ?? {
        soilObservations: [],
        apports: [],
      };
      const firstSoilObservation = fertilisationState.soilObservations[0] ?? null;
      const firstApport = fertilisationState.apports[0] ?? null;
      setIsFertilisationSheetOpen(false);
      setIsFertilisationSheetEditing(false);
      setActiveFertilisationTab("soil");
      setFertilisationSheetMode("soil");
      setSelectedFertilisationSoilId(firstSoilObservation?.id ?? null);
      setSelectedFertilisationApportId(firstApport?.id ?? null);
      setIsCreatingFertilisationSoil(false);
      setIsCreatingFertilisationApport(false);
      setFertilisationSoilForm(
        firstSoilObservation
          ? createFertilisationSoilFormFromRecord(firstSoilObservation)
          : createDefaultFertilisationSoilForm()
      );
      setFertilisationApportForm(
        firstApport
          ? createFertilisationApportFormFromRecord(firstApport)
          : createDefaultFertilisationApportForm()
      );
      setIsObservationEditMode(true);
      return;
    }

    if (observation.name === "Irrigation") {
      const irrigationState = irrigationByPoste[selectedPoste.name] ?? {
        trackingStartDate: "",
        trackingEndDate: "",
        programs: [],
        stressObservations: [],
      };
      const firstProgram = irrigationState.programs[0] ?? null;
      const firstStressObservation = irrigationState.stressObservations[0] ?? null;
      setIsIrrigationSheetOpen(false);
      setIsIrrigationSheetEditing(false);
      setActiveIrrigationTab("program");
      setIrrigationSheetMode("program");
      setSelectedIrrigationProgramId(firstProgram?.id ?? null);
      setSelectedIrrigationStressId(firstStressObservation?.id ?? null);
      setIsCreatingIrrigationProgram(false);
      setIsCreatingIrrigationStress(false);
      setIrrigationProgramForm(
        firstProgram
          ? createIrrigationProgramFormFromRecord(firstProgram)
          : createDefaultIrrigationProgramForm()
      );
      setIrrigationStressForm(
        firstStressObservation
          ? createIrrigationStressFormFromRecord(firstStressObservation)
          : createDefaultIrrigationStressForm()
      );
      setIsObservationEditMode(true);
      return;
    }

    const observationKey = getObservationNotesKey(selectedPoste.name, observation.name);
    const existingForm = observationFormsByKey[observationKey] ?? null;
    const existingStatus = getObservationDerivedStatus(existingForm);
    setIsObservationEditMode(existingStatus !== "Terminé");
    setFleuraisonForm(
      existingForm
        ? { ...existingForm, images: [...existingForm.images] }
        : createDefaultFleuraisonForm(observation.name)
    );
  };
  const saveFleuraisonNote = () => {
    if (isFertilisationScreen || !selectedPoste) {
      return false;
    }

    if (!selectedObservationNotesKey || hasFleuraisonValidationError) {
      return false;
    }

    setObservationFormsByKey((prev) => ({
      ...prev,
      [selectedObservationNotesKey]: {
        ...fleuraisonForm,
        images: [...fleuraisonForm.images],
      },
    }));
    setShowObservationUnsavedModal(false);
    setIsObservationEditMode(true);
    setSelectedObservation(null);
    resetFertilisationDrafts();

    return true;
  };
  const saveFertilisationSoilObservation = () => {
    if (!selectedPoste || soilFertilisationValidationError) {
      return false;
    }

    setFertilisationByPoste((prev) => {
      const currentState = prev[selectedPoste.name] ?? { soilObservations: [], apports: [] };
      let nextSoilObservations = currentState.soilObservations;

      if (isCreatingFertilisationSoil) {
        const nextTitle = `Observation ${currentState.soilObservations.length + 1}`;
        const nextRecord: FertilisationSoilObservation = {
          id: `${selectedPoste.name.toLowerCase().replace(/\s+/g, "-")}-soil-${Date.now()}`,
          title: nextTitle,
          ...fertilisationSoilForm,
        };
        nextSoilObservations = [nextRecord, ...currentState.soilObservations];
        setSelectedFertilisationSoilId(nextRecord.id);
        setFertilisationSoilForm(createFertilisationSoilFormFromRecord(nextRecord));
        setIsCreatingFertilisationSoil(false);
      } else if (selectedFertilisationSoilRecord) {
        nextSoilObservations = currentState.soilObservations.map((record) =>
          record.id === selectedFertilisationSoilRecord.id
            ? { ...record, ...fertilisationSoilForm }
            : record
        );
      }

      const nextTrackingStartDate = getFertilisationTrackingStartDate(
        nextSoilObservations,
        currentState.apports
      );
      const selectedRecordWasTrackingEnd =
        selectedFertilisationSoilRecord?.date === currentState.trackingEndDate;
      let nextTrackingEndDate = currentState.trackingEndDate;

      const canCompleteFertilisation =
        nextSoilObservations.length > 0 && currentState.apports.length > 0;

      if (isFertilisationCurrentDateEnd && canCompleteFertilisation) {
        nextTrackingEndDate = fertilisationSoilForm.date;
      } else if (selectedRecordWasTrackingEnd) {
        nextTrackingEndDate = "";
      }

      if (
        nextTrackingStartDate &&
        nextTrackingEndDate &&
        parseIsoDateToTime(nextTrackingEndDate) < parseIsoDateToTime(nextTrackingStartDate)
      ) {
        nextTrackingEndDate = nextTrackingStartDate;
      }

      return {
        ...prev,
        [selectedPoste.name]: {
          ...currentState,
          trackingStartDate: nextTrackingStartDate,
          trackingEndDate: nextTrackingStartDate ? nextTrackingEndDate : "",
          soilObservations: nextSoilObservations,
        },
      };
    });

    return true;
  };
  const saveFertilisationApport = () => {
    if (
      !selectedPoste ||
      !fertilisationApportForm.date ||
      (hasApportDoseValue && !hasValidApportDose)
    ) {
      return false;
    }

    setFertilisationByPoste((prev) => {
      const currentState = prev[selectedPoste.name] ?? { soilObservations: [], apports: [] };
      let nextApports = currentState.apports;

      if (isCreatingFertilisationApport) {
        const nextTitle = `Apport ${currentState.apports.length + 1}`;
        const nextRecord: FertilisationApportIntervention = {
          id: `${selectedPoste.name.toLowerCase().replace(/\s+/g, "-")}-apport-${Date.now()}`,
          title: nextTitle,
          ...fertilisationApportForm,
        };
        nextApports = [nextRecord, ...currentState.apports];
        setSelectedFertilisationApportId(nextRecord.id);
        setFertilisationApportForm(createFertilisationApportFormFromRecord(nextRecord));
        setIsCreatingFertilisationApport(false);
      } else if (selectedFertilisationApportRecord) {
        nextApports = currentState.apports.map((record) =>
          record.id === selectedFertilisationApportRecord.id
            ? { ...record, ...fertilisationApportForm }
            : record
        );
      }

      const nextTrackingStartDate = getFertilisationTrackingStartDate(
        currentState.soilObservations,
        nextApports
      );
      const selectedRecordWasTrackingEnd =
        selectedFertilisationApportRecord?.date === currentState.trackingEndDate;
      let nextTrackingEndDate = currentState.trackingEndDate;

      const canCompleteFertilisation =
        currentState.soilObservations.length > 0 && nextApports.length > 0;

      if (isFertilisationCurrentDateEnd && canCompleteFertilisation) {
        nextTrackingEndDate = fertilisationApportForm.date;
      } else if (selectedRecordWasTrackingEnd) {
        nextTrackingEndDate = "";
      }

      if (
        nextTrackingStartDate &&
        nextTrackingEndDate &&
        parseIsoDateToTime(nextTrackingEndDate) < parseIsoDateToTime(nextTrackingStartDate)
      ) {
        nextTrackingEndDate = nextTrackingStartDate;
      }

      return {
        ...prev,
        [selectedPoste.name]: {
          ...currentState,
          trackingStartDate: nextTrackingStartDate,
          trackingEndDate: nextTrackingStartDate ? nextTrackingEndDate : "",
          apports: nextApports,
        },
      };
    });

    return true;
  };
  const saveFertilisationChanges = () => {
    const soilSaved = hasFertilisationSoilChanges ? saveFertilisationSoilObservation() : true;
    const apportSaved = hasFertilisationApportChanges ? saveFertilisationApport() : true;

    if (!soilSaved || !apportSaved) {
      return false;
    }

    setShowObservationUnsavedModal(false);
    setIsObservationEditMode(true);
    setSelectedObservation(null);
    resetFertilisationDrafts();
    return true;
  };
  const saveIrrigationProgram = () => {
    if (!selectedPoste || irrigationProgramValidationError) {
      return false;
    }

    setIrrigationByPoste((prev) => {
      const currentState = prev[selectedPoste.name] ?? {
        trackingStartDate: "",
        trackingEndDate: "",
        programs: [],
        stressObservations: [],
      };
      let nextPrograms = currentState.programs;

      if (isCreatingIrrigationProgram) {
        const nextTitle = `Programme ${currentState.programs.length + 1}`;
        const nextRecord: IrrigationProgram = {
          id: `${selectedPoste.name.toLowerCase().replace(/\s+/g, "-")}-program-${Date.now()}`,
          title: nextTitle,
          ...irrigationProgramForm,
        };
        nextPrograms = [nextRecord, ...currentState.programs];
        setSelectedIrrigationProgramId(nextRecord.id);
        setIrrigationProgramForm(createIrrigationProgramFormFromRecord(nextRecord));
        setIsCreatingIrrigationProgram(false);
      } else if (selectedIrrigationProgramRecord) {
        nextPrograms = currentState.programs.map((record) =>
          record.id === selectedIrrigationProgramRecord.id
            ? { ...record, ...irrigationProgramForm }
            : record
        );
      }

      const nextTrackingStartDate = getIrrigationTrackingStartDate(
        nextPrograms,
        currentState.stressObservations
      );
      let nextTrackingEndDate =
        nextPrograms.length > 0 && currentState.stressObservations.length > 0
          ? currentState.stressObservations
              .map((record) => record.endDate)
              .filter(Boolean)
              .sort((a, b) => parseIsoDateToTime(b) - parseIsoDateToTime(a))[0] ?? ""
          : "";

      if (
        nextTrackingStartDate &&
        nextTrackingEndDate &&
        parseIsoDateToTime(nextTrackingEndDate) < parseIsoDateToTime(nextTrackingStartDate)
      ) {
        nextTrackingEndDate = nextTrackingStartDate;
      }

      return {
        ...prev,
        [selectedPoste.name]: {
          ...currentState,
          trackingStartDate: nextTrackingStartDate,
          trackingEndDate: nextTrackingStartDate ? nextTrackingEndDate : "",
          programs: nextPrograms,
        },
      };
    });

    return true;
  };
  const saveIrrigationStressObservation = () => {
    if (!selectedPoste || irrigationStressValidationError) {
      return false;
    }

    setIrrigationByPoste((prev) => {
      const currentState = prev[selectedPoste.name] ?? {
        trackingStartDate: "",
        trackingEndDate: "",
        programs: [],
        stressObservations: [],
      };
      let nextStressObservations = currentState.stressObservations;

      if (isCreatingIrrigationStress) {
        const nextTitle = `Observation ${currentState.stressObservations.length + 1}`;
        const nextRecord: IrrigationStressObservation = {
          id: `${selectedPoste.name.toLowerCase().replace(/\s+/g, "-")}-stress-${Date.now()}`,
          title: nextTitle,
          ...irrigationStressForm,
        };
        nextStressObservations = [nextRecord, ...currentState.stressObservations];
        setSelectedIrrigationStressId(nextRecord.id);
        setIrrigationStressForm(createIrrigationStressFormFromRecord(nextRecord));
        setIsCreatingIrrigationStress(false);
      } else if (selectedIrrigationStressRecord) {
        nextStressObservations = currentState.stressObservations.map((record) =>
          record.id === selectedIrrigationStressRecord.id
            ? { ...record, ...irrigationStressForm }
            : record
        );
      }

      const nextTrackingStartDate = getIrrigationTrackingStartDate(
        currentState.programs,
        nextStressObservations
      );
      let nextTrackingEndDate =
        currentState.programs.length > 0 && nextStressObservations.length > 0
          ? nextStressObservations
              .map((record) => record.endDate)
              .filter(Boolean)
              .sort((a, b) => parseIsoDateToTime(b) - parseIsoDateToTime(a))[0] ?? ""
          : "";

      if (
        nextTrackingStartDate &&
        nextTrackingEndDate &&
        parseIsoDateToTime(nextTrackingEndDate) < parseIsoDateToTime(nextTrackingStartDate)
      ) {
        nextTrackingEndDate = nextTrackingStartDate;
      }

      return {
        ...prev,
        [selectedPoste.name]: {
          ...currentState,
          trackingStartDate: nextTrackingStartDate,
          trackingEndDate: nextTrackingStartDate ? nextTrackingEndDate : "",
          stressObservations: nextStressObservations,
        },
      };
    });

    return true;
  };
  const saveIrrigationChanges = () => {
    const programSaved = hasIrrigationProgramChanges ? saveIrrigationProgram() : true;
    const stressSaved = hasIrrigationStressChanges ? saveIrrigationStressObservation() : true;

    if (!programSaved || !stressSaved) {
      return false;
    }

    setShowObservationUnsavedModal(false);
    setIsObservationEditMode(true);
    setSelectedObservation(null);
    resetIrrigationDrafts();
    return true;
  };
  const resetFertilisationDrafts = () => {
    setIsFertilisationSheetOpen(false);
    setIsFertilisationSheetEditing(false);
    setActiveFertilisationTab("soil");
    setFertilisationSheetMode("soil");
    setSelectedFertilisationSoilId(null);
    setSelectedFertilisationApportId(null);
    setIsCreatingFertilisationSoil(false);
    setIsCreatingFertilisationApport(false);
    setFertilisationSoilForm(createDefaultFertilisationSoilForm());
    setFertilisationApportForm(createDefaultFertilisationApportForm());
    setIsFertilisationCurrentDateEnd(false);
  };
  const resetIrrigationDrafts = () => {
    setIsIrrigationSheetOpen(false);
    setIsIrrigationSheetEditing(false);
    setActiveIrrigationTab("program");
    setIrrigationSheetMode("program");
    setSelectedIrrigationProgramId(null);
    setSelectedIrrigationStressId(null);
    setIsCreatingIrrigationProgram(false);
    setIsCreatingIrrigationStress(false);
    setIrrigationProgramForm(createDefaultIrrigationProgramForm());
    setIrrigationStressForm(createDefaultIrrigationStressForm());
  };
  const openFertilisationSoilSheetForCreate = () => {
    setActiveFertilisationTab("soil");
    setFertilisationSheetMode("soil");
    setIsFertilisationSheetEditing(true);
    setIsCreatingFertilisationSoil(true);
    setSelectedFertilisationSoilId(null);
    setFertilisationSoilForm(createDefaultFertilisationSoilForm());
    setIsFertilisationCurrentDateEnd(false);
    setIsFertilisationSheetOpen(true);
  };
  const openFertilisationSoilSheetForEdit = (record: FertilisationSoilObservation) => {
    setActiveFertilisationTab("soil");
    setFertilisationSheetMode("soil");
    setIsFertilisationSheetEditing(false);
    setIsCreatingFertilisationSoil(false);
    setSelectedFertilisationSoilId(record.id);
    setFertilisationSoilForm(createFertilisationSoilFormFromRecord(record));
    setIsFertilisationCurrentDateEnd(record.date === selectedFertilisationState.trackingEndDate);
    setIsFertilisationSheetOpen(true);
  };
  const openFertilisationApportSheetForCreate = () => {
    setActiveFertilisationTab("apport");
    setFertilisationSheetMode("apport");
    setIsFertilisationSheetEditing(true);
    setIsCreatingFertilisationApport(true);
    setSelectedFertilisationApportId(null);
    setFertilisationApportForm(createDefaultFertilisationApportForm());
    setIsFertilisationCurrentDateEnd(false);
    setIsFertilisationSheetOpen(true);
  };
  const openFertilisationApportSheetForEdit = (record: FertilisationApportIntervention) => {
    setActiveFertilisationTab("apport");
    setFertilisationSheetMode("apport");
    setIsFertilisationSheetEditing(false);
    setIsCreatingFertilisationApport(false);
    setSelectedFertilisationApportId(record.id);
    setFertilisationApportForm(createFertilisationApportFormFromRecord(record));
    setIsFertilisationCurrentDateEnd(record.date === selectedFertilisationState.trackingEndDate);
    setIsFertilisationSheetOpen(true);
  };
  const openIrrigationProgramSheetForCreate = () => {
    setActiveIrrigationTab("program");
    setIrrigationSheetMode("program");
    setIsIrrigationSheetEditing(true);
    setIsCreatingIrrigationProgram(true);
    setSelectedIrrigationProgramId(null);
    setIrrigationProgramForm(createDefaultIrrigationProgramForm());
    setIsIrrigationSheetOpen(true);
  };
  const openIrrigationProgramSheetForEdit = (record: IrrigationProgram) => {
    setActiveIrrigationTab("program");
    setIrrigationSheetMode("program");
    setIsIrrigationSheetEditing(false);
    setIsCreatingIrrigationProgram(false);
    setSelectedIrrigationProgramId(record.id);
    setIrrigationProgramForm(createIrrigationProgramFormFromRecord(record));
    setIsIrrigationSheetOpen(true);
  };
  const openIrrigationStressSheetForCreate = () => {
    setActiveIrrigationTab("stress");
    setIrrigationSheetMode("stress");
    setIsIrrigationSheetEditing(true);
    setIsCreatingIrrigationStress(true);
    setSelectedIrrigationStressId(null);
    setIrrigationStressForm(createDefaultIrrigationStressForm());
    setIsIrrigationSheetOpen(true);
  };
  const openIrrigationStressSheetForEdit = (record: IrrigationStressObservation) => {
    setActiveIrrigationTab("stress");
    setIrrigationSheetMode("stress");
    setIsIrrigationSheetEditing(false);
    setIsCreatingIrrigationStress(false);
    setSelectedIrrigationStressId(record.id);
    setIrrigationStressForm(createIrrigationStressFormFromRecord(record));
    setIsIrrigationSheetOpen(true);
  };
  const closeFertilisationSheet = () => {
    if (hasActiveFertilisationSheetChanges) {
      setObservationUnsavedContext("close-fertilisation-sheet");
      setShowObservationUnsavedModal(true);
      return;
    }

    if (fertilisationSheetMode === "soil") {
      if (selectedFertilisationSoilRecord) {
        setFertilisationSoilForm(createFertilisationSoilFormFromRecord(selectedFertilisationSoilRecord));
      } else {
        setFertilisationSoilForm(createDefaultFertilisationSoilForm());
      }
      setIsCreatingFertilisationSoil(false);
    } else {
      if (selectedFertilisationApportRecord) {
        setFertilisationApportForm(
          createFertilisationApportFormFromRecord(selectedFertilisationApportRecord)
        );
      } else {
        setFertilisationApportForm(createDefaultFertilisationApportForm());
      }
      setIsCreatingFertilisationApport(false);
    }
    setIsFertilisationSheetOpen(false);
    setIsFertilisationSheetEditing(false);
  };
  const closeIrrigationSheet = () => {
    if (hasActiveIrrigationSheetChanges) {
      setObservationUnsavedContext("close-irrigation-sheet");
      setShowObservationUnsavedModal(true);
      return;
    }

    if (irrigationSheetMode === "program") {
      if (selectedIrrigationProgramRecord) {
        setIrrigationProgramForm(createIrrigationProgramFormFromRecord(selectedIrrigationProgramRecord));
      } else {
        setIrrigationProgramForm(createDefaultIrrigationProgramForm());
      }
      setIsCreatingIrrigationProgram(false);
    } else {
      if (selectedIrrigationStressRecord) {
        setIrrigationStressForm(createIrrigationStressFormFromRecord(selectedIrrigationStressRecord));
      } else {
        setIrrigationStressForm(createDefaultIrrigationStressForm());
      }
      setIsCreatingIrrigationStress(false);
    }
    setIsIrrigationSheetOpen(false);
    setIsIrrigationSheetEditing(false);
  };
  const saveFertilisationSheet = () => {
    const saved =
      fertilisationSheetMode === "soil"
        ? saveFertilisationSoilObservation()
        : saveFertilisationApport();
    if (!saved) {
      return;
    }

    setIsFertilisationSheetOpen(false);
    setIsFertilisationSheetEditing(false);
  };
  const saveIrrigationSheet = () => {
    const saved =
      irrigationSheetMode === "program" ? saveIrrigationProgram() : saveIrrigationStressObservation();
    if (!saved) {
      return;
    }

    setIsIrrigationSheetOpen(false);
    setIsIrrigationSheetEditing(false);
  };

  const content = (
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
                          resetFertilisationDrafts();
                          setIsObservationEditMode(true);
                          setShowObservationUnsavedModal(false);
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
                        if (isFertilisationScreen && isFertilisationSheetOpen) {
                          if (hasObservationChanges) {
                            setObservationUnsavedContext("exit-observation");
                            setShowObservationUnsavedModal(true);
                            return;
                          }

                          closeFertilisationSheet();
                          return;
                        }

                        if (isIrrigationScreen && isIrrigationSheetOpen) {
                          if (hasObservationChanges) {
                            setObservationUnsavedContext("exit-observation");
                            setShowObservationUnsavedModal(true);
                            return;
                          }

                          closeIrrigationSheet();
                          return;
                        }

                        if (hasObservationChanges) {
                          setObservationUnsavedContext("exit-observation");
                          setShowObservationUnsavedModal(true);
                          return;
                        }

                        setSelectedObservation(null);
                        resetFertilisationDrafts();
                        resetIrrigationDrafts();
                        setIsObservationEditMode(true);
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
                  <div className={styles.fleuraisonSection}>
                    {isFertilisationScreen ? (
                      <div className={styles.fertilisationOverview}>
                        <div className={styles.fleuraisonSectionHeader}>
                          <h3 className={styles.fleuraisonSectionTitle}>Observation</h3>
                        </div>
                        <div className={styles.fertilisationTabs} role="tablist" aria-label="Fertilisation">
                          <button
                            className={`${styles.fertilisationTab} ${
                              activeFertilisationTab === "soil" ? styles.fertilisationTabActive : ""
                            }`}
                            role="tab"
                            aria-selected={activeFertilisationTab === "soil"}
                            type="button"
                            onClick={() => setActiveFertilisationTab("soil")}
                          >
                            Analyse de sol
                          </button>
                          <button
                            className={`${styles.fertilisationTab} ${
                              activeFertilisationTab === "apport" ? styles.fertilisationTabActive : ""
                            }`}
                            role="tab"
                            aria-selected={activeFertilisationTab === "apport"}
                            type="button"
                            onClick={() => setActiveFertilisationTab("apport")}
                          >
                            Apports
                          </button>
                        </div>
                        <div className={styles.fertilisationPanel}>
                          {activeFertilisationTab === "soil" ? (
                            <>
                              {selectedFertilisationState.soilObservations.length > 0 ? (
                                <div className={styles.fertilisationRecordList}>
                                  {selectedFertilisationState.soilObservations.map((observation) => (
                                    <button
                                      key={observation.id}
                                      className={styles.fertilisationRecordButton}
                                      type="button"
                                      onClick={() => openFertilisationSoilSheetForEdit(observation)}
                                    >
                                      <span className={styles.fertilisationRecordContent}>
                                        <span className={styles.fertilisationRecordTop}>
                                          <span className={styles.fertilisationRecordTitle}>
                                            {observation.title}
                                          </span>
                                          <span className={styles.fertilisationRecordDate}>
                                            {formatDateLongFr(observation.date)}
                                          </span>
                                        </span>
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <p className={styles.fertilisationEmpty}>
                                  Aucune observation enregistrée pour l&apos;analyse de sol.
                                </p>
                              )}
                            </>
                          ) : (
                            <>
                              {selectedFertilisationState.apports.length > 0 ? (
                                <div className={styles.fertilisationRecordList}>
                                  {selectedFertilisationState.apports.map((apport) => (
                                    <button
                                      key={apport.id}
                                      className={styles.fertilisationRecordButton}
                                      type="button"
                                      onClick={() => openFertilisationApportSheetForEdit(apport)}
                                    >
                                      <span className={styles.fertilisationRecordContent}>
                                        <span className={styles.fertilisationRecordTop}>
                                          <span className={styles.fertilisationRecordTitle}>
                                            {apport.title}
                                          </span>
                                          <span className={styles.fertilisationRecordDate}>
                                            {formatDateLongFr(apport.date)}
                                          </span>
                                        </span>
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <p className={styles.fertilisationEmpty}>
                                  Aucun apport enregistré pour cette campagne.
                                </p>
                              )}
                            </>
                          )}
                        </div>

                        <div className={styles.fertilisationBottomAction}>
                          <button
                            className={`${styles.fertilisationAddButton} ${styles.fertilisationAddButtonPrimary}`}
                            type="button"
                            onClick={
                              activeFertilisationTab === "soil"
                                ? openFertilisationSoilSheetForCreate
                                : openFertilisationApportSheetForCreate
                            }
                          >
                            Ajouter une observation
                          </button>
                        </div>

                        {isFertilisationSheetOpen ? (
                          <div
                            className={styles.fertilisationSheetOverlay}
                            role="dialog"
                            aria-modal="true"
                            onClick={closeFertilisationSheet}
                          >
                            <div
                              className={styles.fertilisationSheet}
                              onClick={(event) => event.stopPropagation()}
                            >
                              <span className={styles.fleuraisonSheetHandle} aria-hidden="true" />
                              <div className={styles.fertilisationSheetHeader}>
                                <h4 className={styles.fertilisationSheetTitle}>
                                  {fertilisationSheetMode === "soil"
                                    ? isCreatingFertilisationSoil
                                      ? "Nouvelle observation"
                                      : selectedFertilisationSoilRecord?.title ?? "Observation"
                                    : isCreatingFertilisationApport
                                      ? "Nouvel apport"
                                      : selectedFertilisationApportRecord?.title ?? "Apport"}
                                </h4>
                                <p className={styles.fertilisationSheetSubTitle}>
                                  {fertilisationSheetMode === "soil"
                                    ? "Analyse de sol"
                                    : "Intervention d'apport"}
                                  {isFertilisationSheetReadOnly ? " · aperçu" : ""}
                                </p>
                              </div>

                              <div className={styles.fertilisationSheetBody}>
                                {isFertilisationSheetReadOnly ? (
                                  <div className={styles.fertilisationPreviewList}>
                                    <div className={styles.fertilisationPreviewItem}>
                                      <span className={styles.fertilisationPreviewKey}>Date</span>
                                      <span className={styles.fertilisationPreviewValue}>
                                        {formatDateLongFr(
                                          fertilisationSheetMode === "soil"
                                            ? fertilisationSoilForm.date
                                            : fertilisationApportForm.date
                                        )}
                                      </span>
                                    </div>
                                    {fertilisationSheetMode === "soil" ? (
                                      <>
                                        <div className={styles.fertilisationPreviewItem}>
                                          <span className={styles.fertilisationPreviewKey}>
                                            Teneur en matière organique
                                          </span>
                                          <span className={styles.fertilisationPreviewValue}>
                                            {fertilisationSoilForm.organicMatter}
                                          </span>
                                        </div>
                                        <div className={styles.fertilisationPreviewItem}>
                                          <span className={styles.fertilisationPreviewKey}>pH du sol</span>
                                          <span className={styles.fertilisationPreviewValue}>
                                            {fertilisationSoilForm.soilPh}
                                          </span>
                                        </div>
                                        <div className={styles.fertilisationPreviewItem}>
                                          <span className={styles.fertilisationPreviewKey}>
                                            Capacité de rétention d&apos;eau
                                          </span>
                                          <span className={styles.fertilisationPreviewValue}>
                                            {fertilisationSoilForm.waterRetention}
                                          </span>
                                        </div>
                                        <div className={styles.fertilisationPreviewItem}>
                                          <span className={styles.fertilisationPreviewKey}>
                                            Teneur en N, P, K
                                          </span>
                                          <span className={styles.fertilisationPreviewValue}>
                                            {fertilisationSoilForm.npkLevel}
                                          </span>
                                        </div>
                                        <div className={styles.fertilisationPreviewItem}>
                                          <span className={styles.fertilisationPreviewKey}>
                                            Risque de carence
                                          </span>
                                          <span className={styles.fertilisationPreviewValue}>
                                            {fertilisationSoilForm.deficiencyRisk}
                                          </span>
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <div className={styles.fertilisationPreviewItem}>
                                          <span className={styles.fertilisationPreviewKey}>Produit</span>
                                          <span className={styles.fertilisationPreviewValue}>
                                            {fertilisationApportForm.product}
                                          </span>
                                        </div>
                                        <div className={styles.fertilisationPreviewItem}>
                                          <span className={styles.fertilisationPreviewKey}>Quantité</span>
                                          <span className={styles.fertilisationPreviewValue}>
                                            {fertilisationApportForm.quantity || "Non renseignée"}
                                          </span>
                                        </div>
                                        <div className={styles.fertilisationPreviewItem}>
                                          <span className={styles.fertilisationPreviewKey}>Dose</span>
                                          <span className={styles.fertilisationPreviewValue}>
                                            {fertilisationApportForm.dose || "Non renseignée"}
                                          </span>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                ) : (
                                  <>
                                    <label className={styles.fleuraisonField}>
                                      <span className={styles.fleuraisonLabel}>Date</span>
                                      <span className={styles.fleuraisonTimeField}>
                                        <span className={styles.fleuraisonTimeValue}>
                                          {formatDateLongFr(
                                            fertilisationSheetMode === "soil"
                                              ? fertilisationSoilForm.date
                                              : fertilisationApportForm.date
                                          )}
                                        </span>
                                        <span className={styles.fleuraisonTimeIcon} aria-hidden="true">
                                          event
                                        </span>
                                        <input
                                          className={styles.fleuraisonTimeNative}
                                          type="date"
                                          aria-label="Date"
                                          value={
                                            fertilisationSheetMode === "soil"
                                              ? fertilisationSoilForm.date
                                              : fertilisationApportForm.date
                                          }
                                          onChange={(event) => {
                                            const nextDate = event.target.value;
                                            if (fertilisationSheetMode === "soil") {
                                              setFertilisationSoilForm((prev) => ({
                                                ...prev,
                                                date: nextDate,
                                              }));
                                            } else {
                                              setFertilisationApportForm((prev) => ({
                                                ...prev,
                                                date: nextDate,
                                              }));
                                            }
                                          }}
                                        />
                                      </span>
                                    </label>

                                    {fertilisationSheetMode === "soil" ? (
                                      <>
                                        <div className={styles.fleuraisonField}>
                                          <span className={styles.fleuraisonLabel}>
                                            Teneur en matière organique
                                          </span>
                                          <div className={styles.posteEditChips}>
                                            {fertilisationOrganicMatterOptions.map((option) => {
                                              const isActive = fertilisationSoilForm.organicMatter === option;
                                              return (
                                                <button
                                                  key={option}
                                                  type="button"
                                                  className={`${styles.posteEditChip} ${
                                                    isActive ? styles.posteEditChipActive : ""
                                                  }`}
                                                  onClick={() =>
                                                    setFertilisationSoilForm((prev) => ({
                                                      ...prev,
                                                      organicMatter: option,
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

                                        <div className={styles.fleuraisonField}>
                                          <span className={styles.fleuraisonLabel}>pH du sol</span>
                                          <div className={styles.posteEditChips}>
                                            {fertilisationSoilPhOptions.map((option) => {
                                              const isActive = fertilisationSoilForm.soilPh === option;
                                              return (
                                                <button
                                                  key={option}
                                                  type="button"
                                                  className={`${styles.posteEditChip} ${
                                                    isActive ? styles.posteEditChipActive : ""
                                                  }`}
                                                  onClick={() =>
                                                    setFertilisationSoilForm((prev) => ({
                                                      ...prev,
                                                      soilPh: option,
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

                                        <div className={styles.fleuraisonField}>
                                          <span className={styles.fleuraisonLabel}>
                                            Capacité de rétention d&apos;eau
                                          </span>
                                          <div className={styles.posteEditChips}>
                                            {fertilisationQualityOptions.map((option) => {
                                              const isActive = fertilisationSoilForm.waterRetention === option;
                                              return (
                                                <button
                                                  key={option}
                                                  type="button"
                                                  className={`${styles.posteEditChip} ${
                                                    isActive ? styles.posteEditChipActive : ""
                                                  }`}
                                                  onClick={() =>
                                                    setFertilisationSoilForm((prev) => ({
                                                      ...prev,
                                                      waterRetention: option,
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

                                        <div className={styles.fleuraisonField}>
                                          <span className={styles.fleuraisonLabel}>Teneur en N, P, K</span>
                                          <div className={styles.posteEditChips}>
                                            {fertilisationQualityOptions.map((option) => {
                                              const isActive = fertilisationSoilForm.npkLevel === option;
                                              return (
                                                <button
                                                  key={option}
                                                  type="button"
                                                  className={`${styles.posteEditChip} ${
                                                    isActive ? styles.posteEditChipActive : ""
                                                  }`}
                                                  onClick={() =>
                                                    setFertilisationSoilForm((prev) => ({
                                                      ...prev,
                                                      npkLevel: option,
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

                                        <div className={styles.fleuraisonField}>
                                          <span className={styles.fleuraisonLabel}>Risque de carence</span>
                                          <div className={styles.posteEditChips}>
                                            {fertilisationDeficiencyRiskOptions.map((option) => {
                                              const isActive = fertilisationSoilForm.deficiencyRisk === option;
                                              return (
                                                <button
                                                  key={option}
                                                  type="button"
                                                  className={`${styles.posteEditChip} ${
                                                    isActive ? styles.posteEditChipActive : ""
                                                  }`}
                                                  onClick={() =>
                                                    setFertilisationSoilForm((prev) => ({
                                                      ...prev,
                                                      deficiencyRisk: option,
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
                                      </>
                                    ) : (
                                      <>
                                        <div className={styles.fleuraisonField}>
                                          <span className={styles.fleuraisonLabel}>Produit</span>
                                          <div className={styles.posteEditChips}>
                                            {fertilisationProductOptions.map((option) => {
                                              const isActive = fertilisationApportForm.product === option;
                                              return (
                                                <button
                                                  key={option}
                                                  type="button"
                                                  className={`${styles.posteEditChip} ${
                                                    isActive ? styles.posteEditChipActive : ""
                                                  }`}
                                                  onClick={() =>
                                                    setFertilisationApportForm((prev) => ({
                                                      ...prev,
                                                      product: option,
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
                                        <div className={styles.irrigationProgramFields}>
                                          <label className={styles.fleuraisonField}>
                                            <span className={styles.fleuraisonLabel}>Quantité</span>
                                            <input
                                              className={styles.fleuraisonInput}
                                              type="number"
                                              inputMode="decimal"
                                              step="0.1"
                                              min="0"
                                              placeholder="Ex. 5,8"
                                              value={fertilisationApportForm.quantity}
                                              onChange={(event) => {
                                                setFertilisationApportForm((prev) => ({
                                                  ...prev,
                                                  quantity: event.target.value,
                                                }));
                                              }}
                                            />
                                          </label>
                                          <label className={styles.fleuraisonField}>
                                            <span className={styles.fleuraisonLabel}>Dose</span>
                                            <input
                                              className={styles.fleuraisonInput}
                                              type="number"
                                              inputMode="decimal"
                                              step="0.1"
                                              min="0"
                                              placeholder="Ex. 1,5"
                                              value={fertilisationApportForm.dose}
                                              onChange={(event) => {
                                                setFertilisationApportForm((prev) => ({
                                                  ...prev,
                                                  dose: event.target.value,
                                                }));
                                              }}
                                            />
                                          </label>
                                        </div>
                                      </>
                                    )}
                                  </>
                                )}

                                {isFertilisationSheetEditing && activeFertilisationValidationError ? (
                                  <p className={styles.fleuraisonInlineError}>
                                    {activeFertilisationValidationError}
                                  </p>
                                ) : null}
                              </div>

                              <div className={styles.fertilisationSheetFooter}>
                                <div className={styles.fertilisationSheetActions}>
                                  {isFertilisationSheetReadOnly ? (
                                    <button
                                      className={`${styles.posteSaveButton} ${styles.fertilisationSheetSingleAction}`}
                                      type="button"
                                      onClick={() => setIsFertilisationSheetEditing(true)}
                                    >
                                      Modifier
                                    </button>
                                  ) : (
                                    <>
                                      <button
                                        className={styles.posteCancelButton}
                                        type="button"
                                        onClick={closeFertilisationSheet}
                                      >
                                        Annuler
                                      </button>
                                      <button
                                      className={`${styles.posteSaveButton} ${
                                        isActiveFertilisationSaveDisabled
                                          ? styles.posteButtonDisabled
                                          : ""
                                      }`}
                                      type="button"
                                      disabled={isActiveFertilisationSaveDisabled}
                                      onClick={saveFertilisationSheet}
                                    >
                                        Enregistrer
                                      </button>
                                    </>
                                  )}
                                </div>
                                <span
                                  className={styles.fertilisationBottomIndicator}
                                  aria-hidden="true"
                                />
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>

                    ) : isIrrigationScreen ? (
                      <div className={styles.fertilisationOverview}>
                        <div className={styles.fleuraisonSectionHeader}>
                          <h3 className={styles.fleuraisonSectionTitle}>Observation</h3>
                        </div>
                        <div className={styles.fertilisationTabs} role="tablist" aria-label="Irrigation">
                          <button
                            className={`${styles.fertilisationTab} ${
                              activeIrrigationTab === "program" ? styles.fertilisationTabActive : ""
                            }`}
                            role="tab"
                            aria-selected={activeIrrigationTab === "program"}
                            type="button"
                            onClick={() => setActiveIrrigationTab("program")}
                          >
                            Programme d&apos;arrosage
                          </button>
                          <button
                            className={`${styles.fertilisationTab} ${
                              activeIrrigationTab === "stress" ? styles.fertilisationTabActive : ""
                            }`}
                            role="tab"
                            aria-selected={activeIrrigationTab === "stress"}
                            type="button"
                            onClick={() => setActiveIrrigationTab("stress")}
                          >
                            Stress hydrique
                          </button>
                        </div>
                        <div className={styles.fertilisationPanel}>
                          {activeIrrigationTab === "program" ? (
                            selectedIrrigationState.programs.length > 0 ? (
                              <div className={styles.fertilisationRecordList}>
                                {selectedIrrigationState.programs.map((program) => (
                                  <button
                                    key={program.id}
                                    className={styles.fertilisationRecordButton}
                                    type="button"
                                    onClick={() => openIrrigationProgramSheetForEdit(program)}
                                  >
                                    <span className={styles.fertilisationRecordContent}>
                                      <span className={styles.fertilisationRecordTop}>
                                        <span className={styles.fertilisationRecordTitle}>
                                          {program.title}
                                        </span>
                                        <span className={styles.fertilisationRecordDate}>
                                          {formatDateLongFr(program.startDate)}
                                        </span>
                                      </span>
                                    </span>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <p className={styles.fertilisationEmpty}>
                                Aucun programme d&apos;arrosage enregistré.
                              </p>
                            )
                          ) : selectedIrrigationState.stressObservations.length > 0 ? (
                            <div className={styles.fertilisationRecordList}>
                              {selectedIrrigationState.stressObservations.map((observation) => (
                                <button
                                  key={observation.id}
                                  className={styles.fertilisationRecordButton}
                                  type="button"
                                  onClick={() => openIrrigationStressSheetForEdit(observation)}
                                >
                                  <span className={styles.fertilisationRecordContent}>
                                    <span className={styles.fertilisationRecordTop}>
                                      <span className={styles.fertilisationRecordTitle}>
                                        {observation.title}
                                      </span>
                                      <span className={styles.fertilisationRecordDate}>
                                        {formatDateLongFr(observation.startDate)}
                                      </span>
                                    </span>
                                  </span>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className={styles.fertilisationEmpty}>
                              Aucune observation de stress hydrique enregistrée.
                            </p>
                          )}
                        </div>

                        <div className={styles.fertilisationBottomAction}>
                          <button
                            className={`${styles.fertilisationAddButton} ${styles.fertilisationAddButtonPrimary}`}
                            type="button"
                            onClick={
                              activeIrrigationTab === "program"
                                ? openIrrigationProgramSheetForCreate
                                : openIrrigationStressSheetForCreate
                            }
                          >
                            Ajouter une observation
                          </button>
                        </div>

                        {isIrrigationSheetOpen ? (
                          <div
                            className={styles.fertilisationSheetOverlay}
                            role="dialog"
                            aria-modal="true"
                            onClick={closeIrrigationSheet}
                          >
                            <div
                              className={styles.fertilisationSheet}
                              onClick={(event) => event.stopPropagation()}
                            >
                              <span className={styles.fleuraisonSheetHandle} aria-hidden="true" />
                              <div className={styles.fertilisationSheetHeader}>
                                <h4 className={styles.fertilisationSheetTitle}>
                                  {irrigationSheetMode === "program"
                                    ? isCreatingIrrigationProgram
                                      ? "Nouveau programme"
                                      : selectedIrrigationProgramRecord?.title ?? "Programme"
                                    : isCreatingIrrigationStress
                                      ? "Nouvelle observation"
                                      : selectedIrrigationStressRecord?.title ?? "Observation"}
                                </h4>
                                <p className={styles.fertilisationSheetSubTitle}>
                                  {irrigationSheetMode === "program"
                                    ? "Programme d'arrosage"
                                    : "Stress hydrique"}
                                  {isIrrigationSheetReadOnly ? " · aperçu" : ""}
                                </p>
                              </div>

                              <div className={styles.fertilisationSheetBody}>
                                {isIrrigationSheetReadOnly ? (
                                  <>
                                    <div className={styles.fertilisationPreviewList}>
                                      {irrigationSheetMode === "program" ? (
                                        <>
                                          <div className={styles.fertilisationPreviewItem}>
                                            <span className={styles.fertilisationPreviewKey}>Date début</span>
                                            <span className={styles.fertilisationPreviewValue}>
                                              {formatDateLongFr(irrigationProgramForm.startDate)}
                                            </span>
                                          </div>
                                          <div className={styles.fertilisationPreviewItem}>
                                            <span className={styles.fertilisationPreviewKey}>Date fin</span>
                                            <span className={styles.fertilisationPreviewValue}>
                                              {irrigationProgramForm.endDate
                                                ? formatDateLongFr(irrigationProgramForm.endDate)
                                                : "Non définie"}
                                            </span>
                                          </div>
                                          <div className={styles.fertilisationPreviewItem}>
                                            <span className={styles.fertilisationPreviewKey}>
                                              Fréquence d’irrigation (jours)
                                            </span>
                                            <span className={styles.fertilisationPreviewValue}>
                                              {irrigationProgramForm.frequencyDays}
                                            </span>
                                          </div>
                                          <div className={styles.fertilisationPreviewItem}>
                                            <span className={styles.fertilisationPreviewKey}>
                                              Volume par irrigation (m3/ha)
                                            </span>
                                            <span className={styles.fertilisationPreviewValue}>
                                              {irrigationProgramForm.volumePerIrrigation}
                                            </span>
                                          </div>
                                        </>
                                      ) : (
                                        <>
                                          <div className={styles.fertilisationPreviewItem}>
                                            <span className={styles.fertilisationPreviewKey}>Date début</span>
                                            <span className={styles.fertilisationPreviewValue}>
                                              {formatDateLongFr(irrigationStressForm.startDate)}
                                            </span>
                                          </div>
                                          <div className={styles.fertilisationPreviewItem}>
                                            <span className={styles.fertilisationPreviewKey}>Date fin</span>
                                            <span className={styles.fertilisationPreviewValue}>
                                              {irrigationStressForm.endDate
                                                ? formatDateLongFr(irrigationStressForm.endDate)
                                                : "Non définie"}
                                            </span>
                                          </div>
                                          <div className={styles.fertilisationPreviewItem}>
                                            <span className={styles.fertilisationPreviewKey}>Type</span>
                                            <span className={styles.fertilisationPreviewValue}>
                                              {irrigationStressForm.type}
                                            </span>
                                          </div>
                                          <div className={styles.fertilisationPreviewItem}>
                                            <span className={styles.fertilisationPreviewKey}>
                                              Durée (jours)
                                            </span>
                                            <span className={styles.fertilisationPreviewValue}>
                                              {irrigationStressForm.durationDays || "Non renseignée"}
                                            </span>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                    {irrigationSheetMode === "stress" ? (
                                      <div className={styles.fertilisationPreviewNoteCard}>
                                        <span className={styles.fertilisationPreviewNoteLabel}>Note</span>
                                        <p className={styles.fertilisationPreviewNoteBody}>
                                          {irrigationStressForm.note || "Non renseignée"}
                                        </p>
                                      </div>
                                    ) : null}
                                  </>
                                ) : (
                                  <>
                                    {irrigationSheetMode === "program" ? (
                                      <>
                                        <div className={styles.irrigationProgramFields}>
                                          <label className={styles.fleuraisonField}>
                                            <span className={styles.fleuraisonLabel}>Date début</span>
                                            <span className={styles.fleuraisonTimeField}>
                                              <span
                                                className={`${styles.fleuraisonTimeValue} ${
                                                  !irrigationProgramForm.startDate
                                                    ? styles.fleuraisonInputPlaceholder
                                                    : ""
                                                }`}
                                              >
                                                {irrigationProgramForm.startDate
                                                  ? formatDateLongFr(irrigationProgramForm.startDate)
                                                  : compactDatePlaceholder}
                                              </span>
                                              <span className={styles.fleuraisonTimeIcon} aria-hidden="true">
                                                event
                                              </span>
                                              <input
                                                className={styles.fleuraisonTimeNative}
                                                type="date"
                                                aria-label="Date début"
                                                value={irrigationProgramForm.startDate}
                                                onChange={(event) =>
                                                  setIrrigationProgramForm((prev) => ({
                                                    ...prev,
                                                    startDate: event.target.value,
                                                  }))
                                                }
                                              />
                                            </span>
                                          </label>
                                          <label className={styles.fleuraisonField}>
                                            <span className={styles.fleuraisonLabel}>Date fin</span>
                                            <span className={styles.fleuraisonTimeField}>
                                              <span
                                                className={`${styles.fleuraisonTimeValue} ${
                                                  !irrigationProgramForm.endDate
                                                    ? styles.fleuraisonInputPlaceholder
                                                    : ""
                                                }`}
                                              >
                                                {irrigationProgramForm.endDate
                                                  ? formatDateLongFr(irrigationProgramForm.endDate)
                                                  : compactDatePlaceholder}
                                              </span>
                                              <span className={styles.fleuraisonTimeIcon} aria-hidden="true">
                                                event
                                              </span>
                                              <input
                                                className={styles.fleuraisonTimeNative}
                                                type="date"
                                                aria-label="Date fin"
                                                min={irrigationProgramForm.startDate || undefined}
                                                value={irrigationProgramForm.endDate}
                                                onChange={(event) =>
                                                  setIrrigationProgramForm((prev) => ({
                                                    ...prev,
                                                    endDate: event.target.value,
                                                  }))
                                                }
                                              />
                                            </span>
                                          </label>
                                          <label className={styles.fleuraisonField}>
                                            <span className={styles.fleuraisonLabel}>
                                              Fréquence d’irrigation (jours)
                                            </span>
                                            <input
                                              className={styles.fleuraisonInput}
                                              type="number"
                                              min="1"
                                              step="1"
                                              placeholder="Ex. 3"
                                              value={irrigationProgramForm.frequencyDays}
                                              onChange={(event) =>
                                                setIrrigationProgramForm((prev) => ({
                                                  ...prev,
                                                  frequencyDays: event.target.value,
                                                }))
                                              }
                                            />
                                          </label>
                                          <label className={styles.fleuraisonField}>
                                            <span className={styles.fleuraisonLabel}>
                                              Volume par irrigation (m3/ha)
                                            </span>
                                            <input
                                              className={styles.fleuraisonInput}
                                              type="number"
                                              inputMode="decimal"
                                              min="0"
                                              step="0.1"
                                              placeholder="Ex. 50"
                                              value={irrigationProgramForm.volumePerIrrigation}
                                              onChange={(event) =>
                                                setIrrigationProgramForm((prev) => ({
                                                  ...prev,
                                                  volumePerIrrigation: event.target.value,
                                                }))
                                              }
                                            />
                                          </label>
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <div className={styles.irrigationProgramFields}>
                                          <label className={styles.fleuraisonField}>
                                            <span className={styles.fleuraisonLabel}>Date début</span>
                                            <span className={styles.fleuraisonTimeField}>
                                              <span
                                                className={`${styles.fleuraisonTimeValue} ${
                                                  !irrigationStressForm.startDate
                                                    ? styles.fleuraisonInputPlaceholder
                                                    : ""
                                                }`}
                                              >
                                                {irrigationStressForm.startDate
                                                  ? formatDateLongFr(irrigationStressForm.startDate)
                                                  : compactDatePlaceholder}
                                              </span>
                                              <span className={styles.fleuraisonTimeIcon} aria-hidden="true">
                                                event
                                              </span>
                                              <input
                                                className={styles.fleuraisonTimeNative}
                                                type="date"
                                                aria-label="Date début"
                                                value={irrigationStressForm.startDate}
                                                onChange={(event) =>
                                                  setIrrigationStressForm((prev) => ({
                                                    ...prev,
                                                    startDate: event.target.value,
                                                  }))
                                                }
                                              />
                                            </span>
                                          </label>
                                          <label className={styles.fleuraisonField}>
                                            <span className={styles.fleuraisonLabel}>Date fin</span>
                                            <span className={styles.fleuraisonTimeField}>
                                              <span
                                                className={`${styles.fleuraisonTimeValue} ${
                                                  !irrigationStressForm.endDate
                                                    ? styles.fleuraisonInputPlaceholder
                                                    : ""
                                                }`}
                                              >
                                                {irrigationStressForm.endDate
                                                  ? formatDateLongFr(irrigationStressForm.endDate)
                                                  : compactDatePlaceholder}
                                              </span>
                                              <span className={styles.fleuraisonTimeIcon} aria-hidden="true">
                                                event
                                              </span>
                                              <input
                                                className={styles.fleuraisonTimeNative}
                                                type="date"
                                                aria-label="Date fin"
                                                min={irrigationStressForm.startDate || undefined}
                                                value={irrigationStressForm.endDate}
                                                onChange={(event) =>
                                                  setIrrigationStressForm((prev) => ({
                                                    ...prev,
                                                    endDate: event.target.value,
                                                  }))
                                                }
                                              />
                                            </span>
                                          </label>
                                        </div>
                                        <div className={styles.fleuraisonField}>
                                          <span className={styles.fleuraisonLabel}>Type</span>
                                          <div className={styles.posteEditChips}>
                                            {irrigationStressTypeOptions.map((option) => {
                                              const isActive = irrigationStressForm.type === option;
                                              return (
                                                <button
                                                  key={option}
                                                  type="button"
                                                  className={`${styles.posteEditChip} ${
                                                    isActive ? styles.posteEditChipActive : ""
                                                  }`}
                                                  onClick={() =>
                                                    setIrrigationStressForm((prev) => ({
                                                      ...prev,
                                                      type: option,
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
                                        <label className={styles.fleuraisonField}>
                                          <span className={styles.fleuraisonLabel}>Durée (jours)</span>
                                          <input
                                            className={styles.fleuraisonInput}
                                            type="number"
                                            min="0"
                                            step="1"
                                            placeholder="Ex. 3"
                                            value={irrigationStressForm.durationDays}
                                            onChange={(event) =>
                                              setIrrigationStressForm((prev) => ({
                                                ...prev,
                                                durationDays: event.target.value,
                                              }))
                                            }
                                          />
                                        </label>
                                        <label className={styles.fleuraisonField}>
                                          <span className={styles.fleuraisonLabel}>Note</span>
                                          <textarea
                                            className={styles.fleuraisonTextarea}
                                            placeholder="Ajouter une note..."
                                            value={irrigationStressForm.note}
                                            onChange={(event) =>
                                              setIrrigationStressForm((prev) => ({
                                                ...prev,
                                                note: event.target.value,
                                              }))
                                            }
                                          />
                                        </label>
                                      </>
                                    )}
                                  </>
                                )}

                                {isIrrigationSheetEditing && activeIrrigationValidationError ? (
                                  <p className={styles.fleuraisonInlineError}>
                                    {activeIrrigationValidationError}
                                  </p>
                                ) : null}
                              </div>

                              <div className={styles.fertilisationSheetFooter}>
                                <div className={styles.fertilisationSheetActions}>
                                  {isIrrigationSheetReadOnly ? (
                                    <button
                                      className={`${styles.posteSaveButton} ${styles.fertilisationSheetSingleAction}`}
                                      type="button"
                                      onClick={() => setIsIrrigationSheetEditing(true)}
                                    >
                                      Modifier
                                    </button>
                                  ) : (
                                    <>
                                      <button
                                        className={styles.posteCancelButton}
                                        type="button"
                                        onClick={closeIrrigationSheet}
                                      >
                                        Annuler
                                      </button>
                                      <button
                                        className={`${styles.posteSaveButton} ${
                                          isActiveIrrigationSaveDisabled
                                            ? styles.posteButtonDisabled
                                            : ""
                                        }`}
                                        type="button"
                                        disabled={isActiveIrrigationSaveDisabled}
                                        onClick={saveIrrigationSheet}
                                      >
                                        Enregistrer
                                      </button>
                                    </>
                                  )}
                                </div>
                                <span
                                  className={styles.fertilisationBottomIndicator}
                                  aria-hidden="true"
                                />
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>

                    ) : (
                      <>
                      <div className={styles.fleuraisonSectionHeader}>
                        <h3 className={styles.fleuraisonSectionTitle}>Observation</h3>
                        <span
                          className={`${styles.observationStatus} ${
                            observationFormStatus === "En cours"
                              ? styles.observationStatusInProgress
                              : observationFormStatus === "Terminé"
                                ? styles.observationStatusDone
                                : styles.observationStatusNotStarted
                          } ${
                            observationFormStatus === "Pas commencé"
                              ? styles.observationStatusNotStartedForm
                              : ""
                          }`}
                        >
                          {observationFormStatus}
                        </span>
                      </div>
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
                                disabled={isObservationReadOnly}
                                onClick={() =>
                                  !isObservationReadOnly &&
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

                      <div className={styles.fleuraisonDateGrid}>
                        <label className={styles.fleuraisonField}>
                          <span className={styles.fleuraisonLabel}>Date début</span>
                          <span className={styles.fleuraisonTimeField}>
                            <span
                              className={`${styles.fleuraisonTimeValue} ${
                                !fleuraisonForm.startDate ? styles.fleuraisonInputPlaceholder : ""
                              }`}
                            >
                              {fleuraisonForm.startDate
                                ? formatDateLongFr(fleuraisonForm.startDate)
                                : compactDatePlaceholder}
                            </span>
                            <span className={styles.fleuraisonTimeIcon} aria-hidden="true">
                              event
                            </span>
                            <input
                              className={styles.fleuraisonTimeNative}
                              type="date"
                              aria-label="Date de début"
                              disabled={isObservationReadOnly}
                              value={fleuraisonForm.startDate}
                              onChange={(event) =>
                                setFleuraisonForm((prev) => ({
                                  ...prev,
                                  startDate: event.target.value,
                                }))
                              }
                            />
                          </span>
                        </label>

                        <label className={styles.fleuraisonField}>
                          <span className={styles.fleuraisonLabel}>Date fin</span>
                          <span className={styles.fleuraisonTimeField}>
                            <span
                              className={`${styles.fleuraisonTimeValue} ${
                                !fleuraisonForm.endDate ? styles.fleuraisonInputPlaceholder : ""
                              }`}
                            >
                              {fleuraisonForm.endDate
                                ? formatDateLongFr(fleuraisonForm.endDate)
                                : compactDatePlaceholder}
                            </span>
                            <span className={styles.fleuraisonTimeIcon} aria-hidden="true">
                              event
                            </span>
                            <input
                              className={styles.fleuraisonTimeNative}
                              type="date"
                              aria-label="Date de fin"
                              disabled={isObservationReadOnly}
                              value={fleuraisonForm.endDate}
                              onChange={(event) =>
                                setFleuraisonForm((prev) => ({
                                  ...prev,
                                  endDate: event.target.value,
                                }))
                              }
                            />
                          </span>
                        </label>
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
                                  disabled={isObservationReadOnly}
                                  onClick={() =>
                                    !isObservationReadOnly &&
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
                            disabled={isObservationReadOnly}
                            placeholder="Saisir une valeur"
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
                                disabled={isObservationReadOnly}
                                aria-label="Supprimer l'image"
                                onClick={() =>
                                  !isObservationReadOnly &&
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
                            disabled={isObservationReadOnly}
                            onClick={() => !isObservationReadOnly && fleuraisonImageInputRef.current?.click()}
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
                            disabled={isObservationReadOnly}
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
                          readOnly={isObservationReadOnly}
                          value={fleuraisonForm.notes}
                          onChange={(event) =>
                            setFleuraisonForm((prev) => ({ ...prev, notes: event.target.value }))
                          }
                        />
                      </label>
                    </div>
                    </>
                    )}
                  </div>

                  {!isFertilisationScreen && !isIrrigationScreen ? (
                    <div className={styles.posteEditActions}>
                      {isObservationReadOnly ? (
                        <button
                          className={styles.posteSaveButton}
                          type="button"
                          onClick={() => setIsObservationEditMode(true)}
                        >
                          Modifier
                        </button>
                      ) : (
                        <button
                          className={`${styles.posteSaveButton} ${
                            hasFleuraisonValidationError ? styles.posteButtonDisabled : ""
                          }`}
                          type="button"
                          disabled={hasFleuraisonValidationError}
                          onClick={saveFleuraisonNote}
                        >
                          {observationFormStatus === "Terminé"
                            ? "Enregistrer les modifications"
                            : "Enregistrer"}
                        </button>
                      )}
                    </div>
                  ) : null}
                  {showObservationUnsavedModal ? (
                    <div className={styles.unsavedOverlay} role="dialog" aria-modal="true">
                      <div className={styles.unsavedCard}>
                        <h4 className={styles.unsavedTitle}>Enregistrer les modifications ?</h4>
                        <p className={styles.unsavedText}>
                          Vos changements seront perdus si vous quittez sans enregistrer.
                        </p>
                        <div className={styles.unsavedActions}>
                          <button
                            className={styles.unsavedSecondary}
                            type="button"
                            onClick={() => {
                              setShowObservationUnsavedModal(false);
                              if (observationUnsavedContext === "close-fertilisation-sheet") {
                                if (fertilisationSheetMode === "soil") {
                                  if (selectedFertilisationSoilRecord) {
                                    setFertilisationSoilForm(
                                      createFertilisationSoilFormFromRecord(
                                        selectedFertilisationSoilRecord
                                      )
                                    );
                                  } else {
                                    setFertilisationSoilForm(createDefaultFertilisationSoilForm());
                                  }
                                  setIsCreatingFertilisationSoil(false);
                                } else {
                                  if (selectedFertilisationApportRecord) {
                                    setFertilisationApportForm(
                                      createFertilisationApportFormFromRecord(
                                        selectedFertilisationApportRecord
                                      )
                                    );
                                  } else {
                                    setFertilisationApportForm(createDefaultFertilisationApportForm());
                                  }
                                  setIsCreatingFertilisationApport(false);
                                }
                                setIsFertilisationSheetOpen(false);
                                setIsFertilisationSheetEditing(false);
                                return;
                              }

                              if (observationUnsavedContext === "close-irrigation-sheet") {
                                if (irrigationSheetMode === "program") {
                                  if (selectedIrrigationProgramRecord) {
                                    setIrrigationProgramForm(
                                      createIrrigationProgramFormFromRecord(
                                        selectedIrrigationProgramRecord
                                      )
                                    );
                                  } else {
                                    setIrrigationProgramForm(createDefaultIrrigationProgramForm());
                                  }
                                  setIsCreatingIrrigationProgram(false);
                                } else {
                                  if (selectedIrrigationStressRecord) {
                                    setIrrigationStressForm(
                                      createIrrigationStressFormFromRecord(
                                        selectedIrrigationStressRecord
                                      )
                                    );
                                  } else {
                                    setIrrigationStressForm(createDefaultIrrigationStressForm());
                                  }
                                  setIsCreatingIrrigationStress(false);
                                }
                                setIsIrrigationSheetOpen(false);
                                setIsIrrigationSheetEditing(false);
                                return;
                              }

                              setSelectedObservation(null);
                              resetFertilisationDrafts();
                              resetIrrigationDrafts();
                              setIsObservationEditMode(true);
                            }}
                          >
                            Quitter
                          </button>
                          <button
                            className={styles.unsavedPrimary}
                            type="button"
                            onClick={() => {
                              if (observationUnsavedContext === "close-fertilisation-sheet") {
                                saveFertilisationSheet();
                              } else if (observationUnsavedContext === "close-irrigation-sheet") {
                                saveIrrigationSheet();
                              } else if (isFertilisationScreen) {
                                saveFertilisationChanges();
                              } else if (isIrrigationScreen) {
                                saveIrrigationChanges();
                              } else {
                                saveFleuraisonNote();
                              }
                            }}
                          >
                            Enregistrer
                          </button>
                        </div>
                      </div>
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
                          resetFertilisationDrafts();
                          setIsObservationEditMode(true);
                          setShowObservationUnsavedModal(false);
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
                        {selectedPosteCompletedCount} / {selectedPostePhaseObservations.length}{" "}
                        observations complétées · {selectedPosteProgress}%
                      </p>
                      <div className={styles.posteProgressRow}>
                        {renderPosteProgressMilestones(selectedPosteCompletedCount)}
                      </div>
                    </div>
                  </div>

                  <h3 className={`${styles.posteSectionTitle} ${styles.posteSectionTitleObservations}`}>
                    Observations
                  </h3>
                  <div className={styles.posteObservationGroups}>
                    <div className={styles.posteObservationsCard}>
                      {selectedPostePhaseObservations.map((observation, index) => (
                        <button
                          key={observation.name}
                          type="button"
                          className={`${styles.observationRow} ${
                            index < selectedPostePhaseObservations.length - 1
                              ? styles.observationRowBorder
                              : ""
                          }`}
                          onClick={() => handleObservationSelect(observation)}
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

                    {selectedPosteTrackingObservations.length > 0 ? (
                      <div className={styles.posteObservationGroupSection}>
                        <h3
                          className={`${styles.posteSectionTitle} ${styles.posteSectionTitleObservations}`}
                        >
                          Conduite culturale
                        </h3>
                        <div className={styles.posteObservationsCard}>
                          {selectedPosteTrackingObservations.map((observation, index) => (
                            <button
                              key={observation.name}
                              type="button"
                              className={`${styles.observationRow} ${
                                index < selectedPosteTrackingObservations.length - 1
                                  ? styles.observationRowBorder
                                  : ""
                              }`}
                              onClick={() => handleObservationSelect(observation)}
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
                              <span className={styles.posteArrow} aria-hidden="true">
                                chevron_right
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
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
                    {shouldShowSyncBadge ? renderSyncBadge() : null}
                    <span className={styles.homeAvatar} aria-label="User avatar">
                      OE
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.postesFixesList}>
                {posteCards.map(
                  ({
                    poste,
                    phaseObservations: postePhaseObservations,
                    progress: posteProgress,
                    completedCount: posteCompletedCount,
                    status: posteStatus,
                  }) => {

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
                          {posteCompletedCount} / {postePhaseObservations.length} observations
                          complétées · {posteProgress}%
                        </p>
                        <div className={styles.posteProgressRow}>
                          {renderPosteProgressMilestones(posteCompletedCount)}
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
                    {shouldShowSyncBadge ? renderSyncBadge() : null}
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
                    {shouldShowSyncBadge ? renderSyncBadge() : null}
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
  );

  if (embedded) {
    return content;
  }

  return (
    <div
      className={showDeviceFrame ? frameClass : styles.androidCanvasNoFrame}
      style={!isInteractive ? { pointerEvents: "none" } : undefined}
    >
      <div
        className={`${styles.androidScreen} ${
          theme === "dark" ? styles.androidScreenDark : styles.androidScreenLight
        }`}
      >
        <WorkerAppStatusBar theme={theme} />
        {content}
        {!isFullScreenFlow ? <WorkerAppHomeBottomBarScreen activeIndex={2} /> : null}
        {isFullScreenFlow ? <WorkerAppNavigationScreen surface="page" /> : null}
        {!isFullScreenFlow ? <WorkerAppNavigationScreen /> : null}
      </div>
    </div>
  );
}
