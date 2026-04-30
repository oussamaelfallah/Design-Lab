"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import styles from "./worker-app.module.css";
import { WorkerAppHomeBottomBarScreen } from "./screens/home-bottom-bar-screen";
import { WorkerAppNavigationScreen } from "./screens/navigation-screen";
import { WorkerAppStatusBar } from "./screens/status-bar";

const syncStates = [
  { label: "Hors ligne", icon: "wifi_off", offline: true },
  { label: "Cloud Alert", icon: "cloud_alert", offline: false },
  { label: "Cloud Done", icon: "cloud_done", offline: false },
  { label: "Cloud Sync", icon: "cloud_sync", offline: false },
] as const;

type TravailJobType = "estimation" | "calibre";
type TravailFilter = TravailJobType;
type TravailJobStatus = "notStarted" | "inProgress" | "done";
type EstimationDetailTab = "overview" | "map" | "gallery";
type GalleryFilter = "all" | "synced" | "unsynced";
type MapFocus = "all" | "user" | "parcel";
type MapOverlay = "points" | "heatmap";
type DueFilter = "overdue" | "today" | "upcoming";

const GALLERY_IMAGE_A =
  "https://www.figma.com/api/mcp/asset/75d16a2c-668e-422d-85a7-eeb5a3b60544";
const GALLERY_IMAGE_B =
  "https://www.figma.com/api/mcp/asset/d5926dc9-dfd0-4e4e-afe7-68fb5482bb3e";
const GALLERY_IMAGE_C =
  "https://www.figma.com/api/mcp/asset/ab80e10d-b9bf-4384-bf84-d0067a9d2e20";
const GALLERY_IMAGE_D =
  "https://www.figma.com/api/mcp/asset/ee5224bc-30b8-457f-908a-ec234e8a725f";

const TravailLiveMap = dynamic(
  () => import("./components/travail-live-map").then((module) => module.TravailLiveMap),
  { ssr: false }
);

const TravailParcelPreviewMap = dynamic(
  () => import("./components/travail-live-map").then((module) => module.TravailParcelPreviewMap),
  { ssr: false }
);


type TravailJobSeed = {
  id: string;
  type: TravailJobType;
  parcelName: string;
  sectorName: string;
  year: number;
  yearlySequence: number;
  capturedImages: number;
  syncedImages: number;
  targetImages: number;
  dueDate: string;
};

type TravailJob = TravailJobSeed & {
  displayTitle: string;
  displayMeta: string;
  referenceName: string;
  remainingImages: number;
  progressRatio: number;
  status: TravailJobStatus;
  statusLabel: string;
  dueLabel: string;
};

type EstimationDetail = {
  pendingSyncImages: number;
  failedSyncImages: number;
  lastCaptureLabel: string;
  settings: {
    treePercentage: string;
    orientation: string;
    multiImagesEnabled: boolean;
    mode: "Portrait" | "Paysage";
  };
  parcel: {
    fruitType: string;
    variety: string;
    rootstock: string;
    treeCount: number;
    spacing: string;
  };
};

export type TravailFrameView = "data" | "loading" | "empty";
export type TravailPreviewState =
  | "list-data"
  | "list-loading"
  | "list-empty"
  | "detail-overview"
  | "detail-map"
  | "detail-gallery";

type WorkerAppTravailPageProps = {
  showDeviceFrame: boolean;
  theme: "dark" | "light";
  frameTheme?: "dark" | "light";
  embedded?: boolean;
  frameView?: TravailFrameView;
  previewState?: TravailPreviewState;
  isInteractive?: boolean;
  onLayoutModeChange?: (mode: "default" | "fullScreen") => void;
};

function getCurrentIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dateIso: string, days: number): string {
  const nextDate = new Date(`${dateIso}T00:00:00`);
  nextDate.setDate(nextDate.getDate() + days);
  const year = nextDate.getFullYear();
  const month = `${nextDate.getMonth() + 1}`.padStart(2, "0");
  const day = `${nextDate.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseIsoDateToTime(dateIso: string): number {
  return new Date(`${dateIso}T00:00:00`).getTime();
}

function formatShortDateFr(dateIso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(`${dateIso}T00:00:00`));
}

function buildReferenceName(seed: TravailJobSeed): string {
  const normalizedParcelName = seed.parcelName.replace(/\s+/g, "");
  const yearTwoDigits = `${seed.year}`.slice(-2);
  const prefix = seed.type === "estimation" ? "EST" : "CAL";
  return `${normalizedParcelName}_${prefix}${yearTwoDigits}_${seed.yearlySequence}`;
}

function getJobStatus(
  _todayIso: string,
  _dueDate: string,
  capturedImages: number,
  targetImages: number
): TravailJobStatus {
  if (capturedImages >= targetImages) {
    return "done";
  }
  if (capturedImages > 0) {
    return "inProgress";
  }
  return "notStarted";
}

function getStatusLabel(status: TravailJobStatus): string {
  switch (status) {
    case "inProgress":
      return "En cours";
    case "done":
      return "Terminé";
    default:
      return "Planifié";
  }
}

function getDueLabel(status: TravailJobStatus, dueDate: string): string {
  if (status === "done") {
    return "Captures complétées";
  }
  return `Fin : ${formatShortDateFr(dueDate)}`;
}

type EstimationDetailSeed = {
  id: string;
  pendingSyncImages: number;
  failedSyncImages: number;
  lastCaptureLabel: string;
  settings: EstimationDetail["settings"];
  parcel: EstimationDetail["parcel"];
};

const ESTIMATION_DETAILS: EstimationDetailSeed[] = [
  {
    id: "est-10112-2",
    pendingSyncImages: 2,
    failedSyncImages: 1,
    lastCaptureLabel: "Il y a 45 min",
    settings: { treePercentage: "5%", orientation: "Est", multiImagesEnabled: true, mode: "Portrait" },
    parcel: { fruitType: "Orange", variety: "Navel", rootstock: "Carrizo", treeCount: 320, spacing: "6 m × 4 m" },
  },
  {
    id: "est-10118-1",
    pendingSyncImages: 0,
    failedSyncImages: 0,
    lastCaptureLabel: "Il y a 2 h",
    settings: { treePercentage: "8%", orientation: "Ouest", multiImagesEnabled: false, mode: "Paysage" },
    parcel: { fruitType: "Citron", variety: "Eureka", rootstock: "Citrange Troyer", treeCount: 210, spacing: "5 m × 3 m" },
  },
  {
    id: "est-10250-3",
    pendingSyncImages: 2,
    failedSyncImages: 0,
    lastCaptureLabel: "Il y a 1 h",
    settings: { treePercentage: "6%", orientation: "Nord", multiImagesEnabled: true, mode: "Portrait" },
    parcel: { fruitType: "Mandarine", variety: "Clémentine", rootstock: "Poncirus", treeCount: 415, spacing: "5 m × 4 m" },
  },
  {
    id: "est-10450-1",
    pendingSyncImages: 0,
    failedSyncImages: 0,
    lastCaptureLabel: "Il y a 20 min",
    settings: { treePercentage: "10%", orientation: "Sud", multiImagesEnabled: true, mode: "Portrait" },
    parcel: { fruitType: "Pamplemousse", variety: "Star Ruby", rootstock: "Swingle", treeCount: 180, spacing: "7 m × 5 m" },
  },
  {
    id: "est-10300-1",
    pendingSyncImages: 0,
    failedSyncImages: 0,
    lastCaptureLabel: "—",
    settings: { treePercentage: "5%", orientation: "Est", multiImagesEnabled: false, mode: "Portrait" },
    parcel: { fruitType: "Orange", variety: "Valencia", rootstock: "Carrizo", treeCount: 290, spacing: "6 m × 4 m" },
  },
  {
    id: "est-10089-2",
    pendingSyncImages: 0,
    failedSyncImages: 0,
    lastCaptureLabel: "Il y a 3 h",
    settings: { treePercentage: "7%", orientation: "Ouest", multiImagesEnabled: true, mode: "Paysage" },
    parcel: { fruitType: "Citron", variety: "Lisbon", rootstock: "Citrus macrophylla", treeCount: 155, spacing: "5 m × 3.5 m" },
  },
  {
    id: "est-10374-1",
    pendingSyncImages: 1,
    failedSyncImages: 0,
    lastCaptureLabel: "Il y a 30 min",
    settings: { treePercentage: "5%", orientation: "Sud-Est", multiImagesEnabled: true, mode: "Portrait" },
    parcel: { fruitType: "Orange", variety: "Salustiana", rootstock: "Bigaradier", treeCount: 340, spacing: "6 m × 4 m" },
  },
  {
    id: "est-10421-2",
    pendingSyncImages: 3,
    failedSyncImages: 2,
    lastCaptureLabel: "Il y a 1 h 20 min",
    settings: { treePercentage: "8%", orientation: "Nord-Ouest", multiImagesEnabled: true, mode: "Portrait" },
    parcel: { fruitType: "Mandarine", variety: "Nadorcott", rootstock: "Poncirus", treeCount: 203, spacing: "5 m × 3 m" },
  },
  {
    id: "est-10533-1",
    pendingSyncImages: 0,
    failedSyncImages: 0,
    lastCaptureLabel: "—",
    settings: { treePercentage: "6%", orientation: "Est", multiImagesEnabled: false, mode: "Paysage" },
    parcel: { fruitType: "Citron", variety: "Fino", rootstock: "Citrange Carrizo", treeCount: 128, spacing: "4 m × 3 m" },
  },
  {
    id: "est-10601-1",
    pendingSyncImages: 0,
    failedSyncImages: 0,
    lastCaptureLabel: "Il y a 4 h",
    settings: { treePercentage: "5%", orientation: "Sud", multiImagesEnabled: true, mode: "Portrait" },
    parcel: { fruitType: "Orange", variety: "Navelina", rootstock: "Carrizo", treeCount: 276, spacing: "6 m × 4 m" },
  },
  {
    id: "est-10612-3",
    pendingSyncImages: 1,
    failedSyncImages: 1,
    lastCaptureLabel: "Il y a 2 h 30 min",
    settings: { treePercentage: "10%", orientation: "Ouest", multiImagesEnabled: true, mode: "Portrait" },
    parcel: { fruitType: "Pamplemousse", variety: "Marsh", rootstock: "Swingle", treeCount: 142, spacing: "7 m × 5 m" },
  },
  {
    id: "est-10715-1",
    pendingSyncImages: 0,
    failedSyncImages: 0,
    lastCaptureLabel: "—",
    settings: { treePercentage: "7%", orientation: "Nord", multiImagesEnabled: false, mode: "Portrait" },
    parcel: { fruitType: "Mandarine", variety: "Orri", rootstock: "Poncirus", treeCount: 388, spacing: "5 m × 4 m" },
  },
  {
    id: "est-10720-2",
    pendingSyncImages: 0,
    failedSyncImages: 0,
    lastCaptureLabel: "Il y a 10 min",
    settings: { treePercentage: "5%", orientation: "Est", multiImagesEnabled: true, mode: "Paysage" },
    parcel: { fruitType: "Orange", variety: "Cara Cara", rootstock: "Bigaradier", treeCount: 198, spacing: "6 m × 3.5 m" },
  },
  {
    id: "est-10801-1",
    pendingSyncImages: 4,
    failedSyncImages: 0,
    lastCaptureLabel: "Il y a 50 min",
    settings: { treePercentage: "6%", orientation: "Sud-Ouest", multiImagesEnabled: true, mode: "Portrait" },
    parcel: { fruitType: "Citron", variety: "Interdonato", rootstock: "Citrus macrophylla", treeCount: 167, spacing: "5 m × 3 m" },
  },
  {
    id: "est-10840-1",
    pendingSyncImages: 0,
    failedSyncImages: 0,
    lastCaptureLabel: "—",
    settings: { treePercentage: "8%", orientation: "Nord-Est", multiImagesEnabled: false, mode: "Portrait" },
    parcel: { fruitType: "Orange", variety: "Washington Navel", rootstock: "Carrizo", treeCount: 312, spacing: "6 m × 4 m" },
  },
  {
    id: "est-10903-2",
    pendingSyncImages: 0,
    failedSyncImages: 0,
    lastCaptureLabel: "Il y a 35 min",
    settings: { treePercentage: "5%", orientation: "Sud", multiImagesEnabled: true, mode: "Portrait" },
    parcel: { fruitType: "Mandarine", variety: "Hernandina", rootstock: "Citrange Troyer", treeCount: 224, spacing: "5 m × 3.5 m" },
  },
  {
    id: "est-10950-1",
    pendingSyncImages: 2,
    failedSyncImages: 1,
    lastCaptureLabel: "Il y a 1 h 45 min",
    settings: { treePercentage: "7%", orientation: "Ouest", multiImagesEnabled: true, mode: "Paysage" },
    parcel: { fruitType: "Citron", variety: "Primofiori", rootstock: "Citrange Carrizo", treeCount: 145, spacing: "4.5 m × 3 m" },
  },
  {
    id: "est-11005-1",
    pendingSyncImages: 0,
    failedSyncImages: 0,
    lastCaptureLabel: "—",
    settings: { treePercentage: "6%", orientation: "Est", multiImagesEnabled: false, mode: "Portrait" },
    parcel: { fruitType: "Orange", variety: "Navel Lane Late", rootstock: "Carrizo", treeCount: 258, spacing: "6 m × 4 m" },
  },
  {
    id: "est-11042-3",
    pendingSyncImages: 0,
    failedSyncImages: 0,
    lastCaptureLabel: "Il y a 5 h",
    settings: { treePercentage: "10%", orientation: "Nord", multiImagesEnabled: true, mode: "Portrait" },
    parcel: { fruitType: "Pamplemousse", variety: "Ruby Red", rootstock: "Swingle", treeCount: 110, spacing: "7 m × 5 m" },
  },
  {
    id: "est-11100-1",
    pendingSyncImages: 1,
    failedSyncImages: 0,
    lastCaptureLabel: "Il y a 20 min",
    settings: { treePercentage: "5%", orientation: "Sud-Est", multiImagesEnabled: true, mode: "Portrait" },
    parcel: { fruitType: "Mandarine", variety: "Tango", rootstock: "Poncirus", treeCount: 175, spacing: "5 m × 3 m" },
  },
];

function buildTravailJobs(todayIso: string): TravailJob[] {
  const year = Number(todayIso.slice(0, 4));
  const seeds: TravailJobSeed[] = [
    { id: "est-10112-2", type: "estimation", parcelName: "Parcelle 10112", sectorName: "Secteur S4", year, yearlySequence: 2, capturedImages: 116, syncedImages: 78, targetImages: 194, dueDate: addDays(todayIso, -4) },
    { id: "est-10118-1", type: "estimation", parcelName: "Parcelle 10118", sectorName: "Secteur S4", year, yearlySequence: 1, capturedImages: 92, syncedImages: 92, targetImages: 148, dueDate: todayIso },
    { id: "est-10250-3", type: "estimation", parcelName: "Parcelle 10250", sectorName: "Secteur S1", year, yearlySequence: 3, capturedImages: 126, syncedImages: 94, targetImages: 210, dueDate: addDays(todayIso, 3) },
    { id: "est-10450-1", type: "estimation", parcelName: "Parcelle 10450", sectorName: "Secteur S2", year, yearlySequence: 1, capturedImages: 188, syncedImages: 188, targetImages: 246, dueDate: addDays(todayIso, 5) },
    { id: "est-10300-1", type: "estimation", parcelName: "Parcelle 10300", sectorName: "Secteur S3", year, yearlySequence: 1, capturedImages: 0, syncedImages: 0, targetImages: 132, dueDate: addDays(todayIso, 8) },
    { id: "est-10089-2", type: "estimation", parcelName: "Parcelle 10089", sectorName: "Secteur S2", year, yearlySequence: 2, capturedImages: 164, syncedImages: 164, targetImages: 164, dueDate: addDays(todayIso, -1) },
    { id: "est-10374-1", type: "estimation", parcelName: "Parcelle 10374", sectorName: "Secteur S1", year, yearlySequence: 1, capturedImages: 143, syncedImages: 132, targetImages: 204, dueDate: addDays(todayIso, 2) },
    { id: "est-10421-2", type: "estimation", parcelName: "Parcelle 10421", sectorName: "Secteur S5", year, yearlySequence: 2, capturedImages: 87, syncedImages: 82, targetImages: 150, dueDate: addDays(todayIso, -2) },
    { id: "est-10533-1", type: "estimation", parcelName: "Parcelle 10533", sectorName: "Secteur S6", year, yearlySequence: 1, capturedImages: 0, syncedImages: 0, targetImages: 150, dueDate: addDays(todayIso, 10) },
    { id: "est-10601-1", type: "estimation", parcelName: "Parcelle 10601", sectorName: "Secteur S3", year, yearlySequence: 1, capturedImages: 178, syncedImages: 178, targetImages: 178, dueDate: addDays(todayIso, -6) },
    { id: "est-10612-3", type: "estimation", parcelName: "Parcelle 10612", sectorName: "Secteur S2", year, yearlySequence: 3, capturedImages: 62, syncedImages: 59, targetImages: 100, dueDate: addDays(todayIso, -1) },
    { id: "est-10715-1", type: "estimation", parcelName: "Parcelle 10715", sectorName: "Secteur S7", year, yearlySequence: 1, capturedImages: 0, syncedImages: 0, targetImages: 250, dueDate: addDays(todayIso, 14) },
    { id: "est-10720-2", type: "estimation", parcelName: "Parcelle 10720", sectorName: "Secteur S1", year, yearlySequence: 2, capturedImages: 122, syncedImages: 122, targetImages: 122, dueDate: addDays(todayIso, -3) },
    { id: "est-10801-1", type: "estimation", parcelName: "Parcelle 10801", sectorName: "Secteur S5", year, yearlySequence: 1, capturedImages: 120, syncedImages: 116, targetImages: 203, dueDate: addDays(todayIso, 4) },
    { id: "est-10840-1", type: "estimation", parcelName: "Parcelle 10840", sectorName: "Secteur S3", year, yearlySequence: 1, capturedImages: 0, syncedImages: 0, targetImages: 180, dueDate: addDays(todayIso, 7) },
    { id: "est-10903-2", type: "estimation", parcelName: "Parcelle 10903", sectorName: "Secteur S6", year, yearlySequence: 2, capturedImages: 112, syncedImages: 112, targetImages: 162, dueDate: addDays(todayIso, 1) },
    { id: "est-10950-1", type: "estimation", parcelName: "Parcelle 10950", sectorName: "Secteur S4", year, yearlySequence: 1, capturedImages: 138, syncedImages: 129, targetImages: 235, dueDate: addDays(todayIso, -5) },
    { id: "est-11005-1", type: "estimation", parcelName: "Parcelle 11005", sectorName: "Secteur S2", year, yearlySequence: 1, capturedImages: 0, syncedImages: 0, targetImages: 144, dueDate: addDays(todayIso, 9) },
    { id: "est-11042-3", type: "estimation", parcelName: "Parcelle 11042", sectorName: "Secteur S7", year, yearlySequence: 3, capturedImages: 130, syncedImages: 130, targetImages: 130, dueDate: addDays(todayIso, -7) },
    { id: "est-11100-1", type: "estimation", parcelName: "Parcelle 11100", sectorName: "Secteur S1", year, yearlySequence: 1, capturedImages: 45, syncedImages: 36, targetImages: 180, dueDate: addDays(todayIso, 6) },
    { id: "cal-20518-1", type: "calibre", parcelName: "Parcelle 20518", sectorName: "Secteur S5", year, yearlySequence: 1, capturedImages: 86, syncedImages: 42, targetImages: 190, dueDate: addDays(todayIso, -2) },
    { id: "cal-20240-1", type: "calibre", parcelName: "Parcelle 20240", sectorName: "Secteur S1", year, yearlySequence: 1, capturedImages: 74, syncedImages: 74, targetImages: 120, dueDate: addDays(todayIso, 1) },
    { id: "cal-20410-2", type: "calibre", parcelName: "Parcelle 20410", sectorName: "Secteur S6", year, yearlySequence: 2, capturedImages: 110, syncedImages: 110, targetImages: 110, dueDate: addDays(todayIso, -3) },
    { id: "cal-20622-1", type: "calibre", parcelName: "Parcelle 20622", sectorName: "Secteur S3", year, yearlySequence: 1, capturedImages: 28, syncedImages: 0, targetImages: 140, dueDate: addDays(todayIso, 6) },
  ];

  return seeds.map((seed) => {
    const remainingImages = Math.max(seed.targetImages - seed.capturedImages, 0);
    const progressRatio = seed.targetImages === 0 ? 0 : seed.capturedImages / seed.targetImages;
    const status = getJobStatus(todayIso, seed.dueDate, seed.capturedImages, seed.targetImages);
    return {
      ...seed,
      displayTitle: seed.parcelName,
      displayMeta: `${seed.type === "estimation" ? "Estimation Volume" : "Calibre"} ${seed.year} • #${seed.yearlySequence} • ${seed.sectorName}`,
      referenceName: buildReferenceName(seed),
      remainingImages,
      progressRatio,
      status,
      statusLabel: getStatusLabel(status),
      dueLabel: getDueLabel(status, seed.dueDate),
    };
  });
}

function getSortPriority(status: TravailJobStatus): number {
  switch (status) {
    case "inProgress":
      return 0;
    case "notStarted":
      return 1;
    case "done":
      return 2;
  }
}

function sortTravailJobs(a: TravailJob, b: TravailJob): number {
  const priorityDiff = getSortPriority(a.status) - getSortPriority(b.status);
  if (priorityDiff !== 0) {
    return priorityDiff;
  }

  const dueDateDiff = parseIsoDateToTime(a.dueDate) - parseIsoDateToTime(b.dueDate);
  if (dueDateDiff !== 0) {
    return dueDateDiff;
  }

  if (a.status !== "done" && b.status !== "done") {
    const progressDiff = a.progressRatio - b.progressRatio;
    if (progressDiff !== 0) {
      return progressDiff;
    }
  }

  return a.displayTitle.localeCompare(b.displayTitle, "fr");
}

function getEstimationDetail(job: TravailJob): EstimationDetail {
  const seed = ESTIMATION_DETAILS.find((d) => d.id === job.id);
  return {
    pendingSyncImages: seed?.pendingSyncImages ?? 0,
    failedSyncImages: seed?.failedSyncImages ?? 0,
    lastCaptureLabel: seed?.lastCaptureLabel ?? "—",
    settings: seed?.settings ?? { treePercentage: "5%", orientation: "Est", multiImagesEnabled: true, mode: "Portrait" },
    parcel: seed?.parcel ?? { fruitType: "—", variety: "—", rootstock: "—", treeCount: 0, spacing: "—" },
  };
}

function normalizeSearchValue(value: string): string {
  return value
    .toLocaleLowerCase("fr-FR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function buildGalleryImages(job: TravailJob) {
  const sources = [GALLERY_IMAGE_A, GALLERY_IMAGE_B, GALLERY_IMAGE_C, GALLERY_IMAGE_D];
  const count = Math.max(job.capturedImages, 12);
  return {
    dateLabel: "03 déc. 2024",
    images: Array.from({ length: count }, (_, i) => ({
      id: `${job.id}-${i + 1}`,
      src: sources[i % sources.length],
      synced: i < job.syncedImages,
      alt: `${job.displayTitle} capture ${i + 1}`,
    })),
  };
}

export function WorkerAppTravailPage({
  showDeviceFrame,
  theme,
  frameTheme,
  embedded = false,
  frameView = "data",
  previewState,
  isInteractive = true,
  onLayoutModeChange,
}: WorkerAppTravailPageProps) {
  const [syncStateIndex, setSyncStateIndex] = useState(2);
  const [activeFilter, setActiveFilter] = useState<TravailFilter>("estimation");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTravailFiltersSheetOpen, setIsTravailFiltersSheetOpen] = useState(false);
  const [selectedStatusFilters, setSelectedStatusFilters] = useState<TravailJobStatus[]>([]);
  const [selectedDueFilters, setSelectedDueFilters] = useState<DueFilter[]>([]);
  const [selectedEstimationFilters, setSelectedEstimationFilters] = useState<number[]>([]);
  const [selectedSectorFilters, setSelectedSectorFilters] = useState<string[]>([]);

  const todayIso = useMemo(() => getCurrentIsoDate(), []);
  const jobs = useMemo(() => buildTravailJobs(todayIso), [todayIso]);

  const initialJob = useMemo(() => {
    if (
      previewState === "detail-overview" ||
      previewState === "detail-map" ||
      previewState === "detail-gallery"
    ) {
      return jobs.find((j) => j.type === "estimation") ?? null;
    }
    return null;
  }, [previewState, jobs]);

  const [selectedEstimationJob, setSelectedEstimationJob] = useState<TravailJob | null>(initialJob);
  const [activeDetailTab, setActiveDetailTab] = useState<EstimationDetailTab>(
    previewState === "detail-map"
      ? "map"
      : previewState === "detail-gallery"
        ? "gallery"
        : "overview"
  );
  const [galleryFilter, setGalleryFilter] = useState<GalleryFilter>("all");
  const [mapFocus, setMapFocus] = useState<MapFocus>("all");
  const [mapOverlay, setMapOverlay] = useState<MapOverlay>("points");
  const [isMapLayersSheetOpen, setIsMapLayersSheetOpen] = useState(false);
  const [isCameraDemoOpen, setIsCameraDemoOpen] = useState(false);
  const [isDetailScrolled, setIsDetailScrolled] = useState(false);
  const [isParcelleSheetOpen, setIsParcelleSheetOpen] = useState(false);
  const [isEstimationConfigSheetOpen, setIsEstimationConfigSheetOpen] = useState(false);
  const detailContentRef = useRef<HTMLDivElement>(null);
  const syncState = syncStates[syncStateIndex];
  const isOffline = syncState.offline;
  const isMapDetail = Boolean(selectedEstimationJob && activeDetailTab === "map");


  const resolvedFrameTheme = frameTheme ?? theme;
  const frameClass =
    resolvedFrameTheme === "light" ? styles.androidCanvasLightFrame : styles.androidCanvas;

  const filterOptions = useMemo(
    () => ({
      estimations: [1, 2, 3],
      sectors: Array.from(new Set(jobs.map((job) => job.sectorName))).sort((a, b) => a.localeCompare(b, "fr")),
    }),
    [jobs]
  );
  const activeAdvancedFilterCount =
    selectedStatusFilters.length +
    selectedDueFilters.length +
    selectedEstimationFilters.length +
    selectedSectorFilters.length;

  const visibleJobs = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(searchQuery.trim());

    return jobs
      .filter((job) => job.type === activeFilter)
      .filter((job) => {
        const detail = getEstimationDetail(job);
        const matchesSearch =
          normalizedQuery.length === 0 ||
          normalizeSearchValue(
            `${job.displayTitle} ${job.displayMeta} ${job.sectorName} ${job.statusLabel} ${detail.parcel.fruitType} ${detail.parcel.variety}`
          ).includes(normalizedQuery);
        const matchesStatus =
          selectedStatusFilters.length === 0 || selectedStatusFilters.includes(job.status);
        const dueState: DueFilter =
          job.dueDate === todayIso
            ? "today"
            : parseIsoDateToTime(job.dueDate) < parseIsoDateToTime(todayIso)
              ? "overdue"
              : "upcoming";
        const matchesDue = selectedDueFilters.length === 0 || selectedDueFilters.includes(dueState);
        const matchesEstimation =
          job.type !== "estimation" ||
          selectedEstimationFilters.length === 0 ||
          selectedEstimationFilters.includes(job.yearlySequence);
        const matchesSector =
          selectedSectorFilters.length === 0 || selectedSectorFilters.includes(job.sectorName);

        return matchesSearch && matchesStatus && matchesDue && matchesEstimation && matchesSector;
      })
      .sort(sortTravailJobs);
  }, [
    activeFilter,
    jobs,
    searchQuery,
    selectedDueFilters,
    selectedEstimationFilters,
    selectedSectorFilters,
    selectedStatusFilters,
    todayIso,
  ]);
  const jobCounts = useMemo(
    () => ({
      estimation: jobs.filter((job) => job.type === "estimation").length,
      calibre: jobs.filter((job) => job.type === "calibre").length,
    }),
    [jobs]
  );
  const selectedEstimationDetail = selectedEstimationJob
    ? getEstimationDetail(selectedEstimationJob)
    : null;
  const progressionStats =
    selectedEstimationJob && selectedEstimationDetail
      ? {
          syncedImages: Math.max(
            selectedEstimationJob.capturedImages -
              selectedEstimationDetail.pendingSyncImages -
              selectedEstimationDetail.failedSyncImages,
            0
          ),
          uncapturedImages: selectedEstimationJob.remainingImages,
          unsyncedImages:
            selectedEstimationDetail.pendingSyncImages + selectedEstimationDetail.failedSyncImages,
          progressPercentage: Math.round(selectedEstimationJob.progressRatio * 100),
        }
      : null;
  const galleryData = selectedEstimationJob ? buildGalleryImages(selectedEstimationJob) : null;
  const visibleGalleryImages = useMemo(() => {
    if (!galleryData) return [];
    return galleryData.images.filter((image) => {
      if (galleryFilter === "synced") return image.synced;
      if (galleryFilter === "unsynced") return !image.synced;
      return true;
    });
  }, [galleryData, galleryFilter]);
  const detailHeaderTitle =
    activeDetailTab === "gallery"
      ? "Galerie"
      : activeDetailTab === "map"
        ? "Carte"
        : selectedEstimationJob?.displayTitle ?? "";
  const detailHeaderSubtitle =
    activeDetailTab === "gallery"
      ? `${galleryData?.images.length ?? 0} images • Estimation ${selectedEstimationJob?.year} #${
          selectedEstimationJob?.yearlySequence
        } • ${selectedEstimationJob?.sectorName ?? ""}`
      : activeDetailTab === "map"
        ? `${selectedEstimationJob?.displayTitle ?? ""} • Estimation ${selectedEstimationJob?.year} #${
            selectedEstimationJob?.yearlySequence
          } • ${selectedEstimationJob?.sectorName ?? ""}`
      : `Estimation ${selectedEstimationJob?.year} • #${selectedEstimationJob?.yearlySequence} • ${
          selectedEstimationJob?.sectorName ?? ""
        }`;
  const renderStatusBadge = (job: TravailJob) => (
    <span
      className={`${styles.travailJobStatusBadge} ${
        job.status === "inProgress"
          ? styles.travailJobStatusDueToday
          : job.status === "done"
            ? styles.travailJobStatusDone
            : styles.travailJobStatusScheduled
      }`}
    >
      {job.statusLabel}
    </span>
  );

  const toggleFilterValue = useCallback(<T extends string | number,>(
    value: T,
    values: T[],
    setter: (nextValues: T[]) => void
  ) => {
    setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  }, []);

  const clearTravailFilters = useCallback(() => {
    setSelectedStatusFilters([]);
    setSelectedDueFilters([]);
    setSelectedEstimationFilters([]);
    setSelectedSectorFilters([]);
  }, []);

  const renderDetailRows = (rows: { label: string; value: string | number }[]) => (
    <div className={styles.travailDetailRows}>
      {rows.map((row) => (
        <div key={row.label} className={styles.travailDetailRow}>
          <span className={styles.travailDetailLabel}>{row.label}</span>
          <span className={styles.travailDetailValue}>{row.value}</span>
        </div>
      ))}
    </div>
  );

  const openEstimationDetail = (job: TravailJob) => {
    setSelectedEstimationJob(job);
    setActiveDetailTab("overview");
    setGalleryFilter("all");
    setMapFocus("all");
    setMapOverlay("points");
    setIsMapLayersSheetOpen(false);
    setIsCameraDemoOpen(false);
    setIsParcelleSheetOpen(false);
    setIsEstimationConfigSheetOpen(false);
  };

  const closeEstimationDetail = () => {
    setSelectedEstimationJob(null);
    setActiveDetailTab("overview");
    setGalleryFilter("all");
    setMapFocus("all");
    setMapOverlay("points");
    setIsMapLayersSheetOpen(false);
    setIsCameraDemoOpen(false);
    setIsParcelleSheetOpen(false);
    setIsEstimationConfigSheetOpen(false);
  };

  const handleDetailScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setIsDetailScrolled(e.currentTarget.scrollTop > 64);
  }, []);

  const handleDetailBack = useCallback(() => {
    closeEstimationDetail();
  }, []);

  useEffect(() => {
    onLayoutModeChange?.(selectedEstimationJob ? "fullScreen" : "default");
  }, [onLayoutModeChange, selectedEstimationJob]);

  const content = (
    <>
        {isOffline && (
          <div className={styles.offlineBanner} role="status" aria-live="polite">
            <span className={styles.offlineBannerIcon} aria-hidden="true">wifi_off</span>
            Hors ligne — les modifications seront synchronisées à la reconnexion
          </div>
        )}
        {selectedEstimationJob && selectedEstimationDetail ? (
          <>
            {isDetailScrolled && (
                  <div className={styles.travailDetailStickyBar} aria-hidden="true">
                    <button
                      className={styles.travailDetailStickyBack}
                      type="button"
                      onClick={handleDetailBack}
                      aria-label="Retour"
                    >
                      <span aria-hidden="true">arrow_back</span>
                    </button>
                    <span className={styles.travailDetailStickyTitle}>
                      {selectedEstimationJob.displayTitle}
                    </span>
                    <span className={styles.travailDetailStickyProgress}>
                      {selectedEstimationJob.capturedImages}/{selectedEstimationJob.targetImages}
                    </span>
                  </div>
                )}
                <div
                  ref={detailContentRef}
                  onScroll={handleDetailScroll}
                  className={`${styles.secteursContent} ${styles.travailContent} ${styles.travailDetailContent} ${
                    activeDetailTab === "map" ? styles.travailDetailContentMap : ""
                  }`}
                >
                  {/* Header */}
                  {activeDetailTab !== "map" ? (
                    <div className={`${styles.posteDetailHeader} ${styles.travailM3Header}`}>
                    <button
                      className={`${styles.pageBackButton} ${styles.travailM3BackButton}`}
                      type="button"
                      aria-label="Retour"
                      onClick={handleDetailBack}
                    >
                      <span className={styles.pageBackIcon} aria-hidden="true">arrow_back</span>
                    </button>
                    <div className={styles.posteDetailHeaderText}>
                      <h2 className={styles.posteDetailHeaderTitle}>{detailHeaderTitle}</h2>
                      <p className={styles.posteDetailHeaderLocation}>{detailHeaderSubtitle}</p>
                    </div>
                    </div>
                  ) : null}

                  {activeDetailTab === "overview" ? (
                    <>
                      {/* ── Progression ── */}
                      {progressionStats ? (
                        <section className={styles.travailDetailSection}>
                          <h3 className={styles.posteSectionTitle}>Progression</h3>
                          <div className={styles.travailProgressCard}>
                            {/* Donut left — stats right */}
                            <div className={styles.travailProgressLayout}>
                              <div
                                className={styles.travailProgressDonut}
                                aria-hidden="true"
                                style={{
                                  background: `conic-gradient(
                                    var(--ds-brand) 0deg ${selectedEstimationJob.progressRatio * 360}deg,
                                    #ff585b ${selectedEstimationJob.progressRatio * 360}deg ${
                                      (selectedEstimationJob.progressRatio +
                                        selectedEstimationDetail.failedSyncImages / selectedEstimationJob.targetImages) *
                                      360
                                    }deg,
                                    #f59e0b ${
                                      (selectedEstimationJob.progressRatio +
                                        selectedEstimationDetail.failedSyncImages / selectedEstimationJob.targetImages) *
                                      360
                                    }deg ${
                                      (selectedEstimationJob.progressRatio +
                                        progressionStats.unsyncedImages / selectedEstimationJob.targetImages) *
                                      360
                                    }deg,
                                    #eaeaea ${
                                      (selectedEstimationJob.progressRatio +
                                        progressionStats.unsyncedImages / selectedEstimationJob.targetImages) *
                                      360
                                    }deg 360deg
                                  )`,
                                }}
                              >
                                <div className={styles.travailProgressDonutInner}>
                                  <span className={styles.travailProgressDonutCount}>
                                    {selectedEstimationJob.capturedImages}/{selectedEstimationJob.targetImages}
                                  </span>
                                  <span className={styles.travailProgressDonutLabel}>captures</span>
                                </div>
                              </div>

                              <div className={styles.travailProgressRight}>
                                {[
                                  {
                                    label: "Synchronisées",
                                    value: progressionStats.syncedImages,
                                    dotClass: styles.travailProgressLegendDotSynced,
                                  },
                                  {
                                    label: "Non Synchronisées",
                                    value: selectedEstimationDetail.pendingSyncImages,
                                    dotClass: styles.travailProgressLegendDotPending,
                                  },
                                  {
                                    label: "Non capturées",
                                    value: progressionStats.uncapturedImages,
                                    dotClass: styles.travailProgressLegendDotUncaptured,
                                  },
                                ].map((item) => (
                                  <div key={item.label} className={styles.travailProgressRightRow}>
                                    <div className={styles.travailProgressRightLabel}>
                                      <span className={`${styles.travailProgressLegendDot} ${item.dotClass}`} aria-hidden="true" />
                                      <span>{item.label}</span>
                                    </div>
                                    <strong>{item.value}</strong>
                                  </div>
                                ))}

                                <div className={styles.travailProgressRightDivider} />

                                <div className={styles.travailProgressRightRow}>
                                  <span className={styles.travailProgressRightMeta}>Dernière capture</span>
                                  <span className={styles.travailProgressRightMeta}>{selectedEstimationDetail.lastCaptureLabel}</span>
                                </div>
                              </div>
                            </div>

                            {selectedEstimationJob.status === "done" && (
                              <div className={styles.travailDetailDoneNote}>
                                <span aria-hidden="true">check_circle</span>
                                Toutes les captures sont complétées
                              </div>
                            )}
                          </div>
                        </section>
                      ) : null}

                      {/* ── Informations ── */}
                      <section className={styles.travailDetailSection}>
                        <h3 className={styles.posteSectionTitle}>Informations</h3>
                        <div className={styles.posteConfigCard}>
                          {renderDetailRows([
                            {
                              label: "Estimation",
                              value: `Estimation ${selectedEstimationJob.year} #${selectedEstimationJob.yearlySequence}`,
                            },
                            { label: "Échéance", value: selectedEstimationJob.dueLabel.replace("Fin : ", "") },
                          ])}
                          <div className={styles.travailDetailStatusRow}>
                            <span className={styles.travailDetailLabel}>Statut</span>
                            {renderStatusBadge(selectedEstimationJob)}
                          </div>
                          <div className={styles.travailDetailDivider} />
                          <button
                            type="button"
                            className={styles.travailParcelleNavInline}
                            onClick={() => setIsParcelleSheetOpen(true)}
                            aria-label="Ouvrir la fiche parcelle"
                          >
                            <div className={styles.travailParcelleNavIcon} aria-hidden="true">
                              <span>crop</span>
                            </div>
                            <div className={styles.travailParcelleNavText}>
                              <strong>{selectedEstimationJob.displayTitle}</strong>
                              <span>
                                {selectedEstimationDetail.parcel.fruitType} • {selectedEstimationDetail.parcel.variety} •{" "}
                                {selectedEstimationDetail.parcel.treeCount} arbres
                              </span>
                            </div>
                            <span className={styles.travailParcelleNavChevron} aria-hidden="true">chevron_right</span>
                          </button>
                          <div className={styles.travailDetailDivider} />
                          <button
                            type="button"
                            className={styles.travailParcelleNavInline}
                            onClick={() => setIsEstimationConfigSheetOpen(true)}
                            aria-label="Ouvrir la configuration estimation"
                          >
                            <div className={styles.travailParcelleNavIcon} aria-hidden="true">
                              <span>tune</span>
                            </div>
                            <div className={styles.travailParcelleNavText}>
                              <strong>Configuration estimation</strong>
                              <span>
                                {selectedEstimationDetail.settings.treePercentage} • {selectedEstimationDetail.settings.orientation} •{" "}
                                {selectedEstimationDetail.settings.mode}
                              </span>
                            </div>
                            <span className={styles.travailParcelleNavChevron} aria-hidden="true">chevron_right</span>
                          </button>
                        </div>
                      </section>

                    </>
                  ) : activeDetailTab === "map" ? (
                    <section className={styles.travailMapSection}>
                      <div className={styles.travailMapView}>
                        <TravailLiveMap
                          focus={mapFocus}
                          overlay={mapOverlay}
                        />
                        <div className={styles.travailMapTopBar}>
                          <button
                            className={styles.travailMapTopBack}
                            type="button"
                            aria-label="Retour"
                            onClick={handleDetailBack}
                          >
                            <span aria-hidden="true">arrow_back</span>
                          </button>
                          <div className={styles.travailMapTopTitle}>
                            <strong>Carte parcelle</strong>
                            <span>{selectedEstimationJob.displayTitle}</span>
                          </div>
                        </div>
                        <div className={styles.travailMapOverlayTop}>
                          <button
                            type="button"
                            className={styles.travailMapRoundButton}
                            aria-label="Choisir les couches de carte"
                            onClick={() => setIsMapLayersSheetOpen(true)}
                          >
                            <span aria-hidden="true">layers</span>
                          </button>
                          <button
                            type="button"
                            className={styles.travailMapRoundButton}
                            aria-label="Centrer sur la parcelle"
                            onClick={() => setMapFocus("parcel")}
                          >
                            <span aria-hidden="true">crop_free</span>
                          </button>
                        </div>
                        <div className={styles.travailMapOverlayBottom}>
                          <button
                            type="button"
                            className={styles.travailMapRoundButton}
                            aria-label="Me centrer"
                            onClick={() => setMapFocus("user")}
                          >
                            <span aria-hidden="true">my_location</span>
                          </button>
                        </div>
                      </div>
                    </section>
                  ) : (
                    <section className={styles.travailGallerySection}>
                      <div className={styles.travailGalleryFilters} role="tablist" aria-label="Filtres galerie">
                        {[
                          { key: "all" as GalleryFilter, label: "Tout" },
                          { key: "synced" as GalleryFilter, label: "Synchronisées" },
                          { key: "unsynced" as GalleryFilter, label: "Non sync" },
                        ].map((filter) => (
                          <button
                            key={filter.key}
                            type="button"
                            role="tab"
                            aria-selected={galleryFilter === filter.key}
                            className={`${styles.travailGalleryFilter} ${
                              galleryFilter === filter.key ? styles.travailGalleryFilterActive : ""
                            }`}
                            onClick={() => setGalleryFilter(filter.key)}
                          >
                            {filter.label}
                          </button>
                        ))}
                      </div>
                      <div className={styles.travailGalleryDate}>{galleryData?.dateLabel}</div>
                      <div className={styles.travailGalleryGrid}>
                        {visibleGalleryImages.map((image) => (
                          <div key={image.id} className={styles.travailGalleryCard}>
                            <img src={image.src} alt={image.alt} className={styles.travailGalleryImage} />
                            <div className={styles.travailGalleryBadge} aria-hidden="true">
                              <span>{image.synced ? "cloud_done" : "cloud_off"}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                {!isParcelleSheetOpen ? (
                <div className={styles.travailDetailFloatingBar} aria-label="Actions estimation">
                  <div className={styles.travailDetailViewTabs} role="tablist" aria-label="Vue estimation">
                    {[
                      { key: "overview", label: "Aperçu", icon: "overview_key" },
                      { key: "map", label: "Carte", icon: "map" },
                      { key: "gallery", label: "Galerie", icon: "image" },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        className={`${styles.travailDetailViewTab} ${
                          activeDetailTab === tab.key ? styles.travailDetailViewTabActive : ""
                        }`}
                        type="button"
                        role="tab"
                        aria-selected={activeDetailTab === tab.key}
                        onClick={() => setActiveDetailTab(tab.key as EstimationDetailTab)}
                      >
                        <span className={styles.travailDetailViewIcon} aria-hidden="true">
                          {tab.icon}
                        </span>
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    className={styles.travailDetailCameraButton}
                    type="button"
                    aria-label="Ouvrir la caméra"
                    onClick={() => setIsCameraDemoOpen(true)}
                  >
                    <span aria-hidden="true">photo_camera</span>
                  </button>
                </div>
                ) : null}

                {isMapLayersSheetOpen ? (
                  <div
                    className={styles.travailMapLayersSheetOverlay}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Couches de carte"
                    onClick={() => setIsMapLayersSheetOpen(false)}
                  >
                    <div
                      className={styles.travailMapLayersSheet}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className={styles.travailParcelleSheetHandle} aria-hidden="true" />
                      <div className={styles.travailMapLayersHeader}>
                        <div>
                          <h3>Couches de carte</h3>
                          <p>{selectedEstimationJob.displayTitle}</p>
                        </div>
                        <button
                          type="button"
                          className={styles.travailMapLayersClose}
                          aria-label="Fermer"
                          onClick={() => setIsMapLayersSheetOpen(false)}
                        >
                          <span aria-hidden="true">close</span>
                        </button>
                      </div>

                      <div className={styles.travailMapLayerList}>
                        <label className={styles.travailMapLayerOption}>
                          <input
                            type="checkbox"
                            checked={mapOverlay === "heatmap"}
                            onChange={(event) => setMapOverlay(event.target.checked ? "heatmap" : "points")}
                          />
                          <span className={styles.travailMapLayerIcon} aria-hidden="true">blur_on</span>
                          <span className={styles.travailMapLayerText}>
                            <strong>Intensité captures</strong>
                            <span>Zones orange des points de capture</span>
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                ) : null}

                {isParcelleSheetOpen ? (
                  <div
                    className={styles.travailParcelleSheetOverlay}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Fiche parcelle"
                    onClick={() => setIsParcelleSheetOpen(false)}
                  >
                    <div
                      className={styles.travailParcelleSheet}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className={styles.travailParcelleSheetHandle} aria-hidden="true" />
                      <div className={styles.travailParcelleSheetHeader}>
                        <div className={styles.travailParcelleSheetHeaderIcon} aria-hidden="true">
                          <span>crop</span>
                        </div>
                        <div className={styles.travailParcelleSheetHeaderText}>
                          <h3>{selectedEstimationJob.displayTitle}</h3>
                          <p>{selectedEstimationDetail.parcel.fruitType} · {selectedEstimationDetail.parcel.variety}</p>
                        </div>
                        <span className={styles.travailParcelleSheetTag}>Arboriculteur</span>
                      </div>
                      <div className={styles.travailParcelleSheetDivider} aria-hidden="true" />
                      <div className={styles.travailParcelleSheetRows}>
                        {[
                          { label: "Type de fruit", value: selectedEstimationDetail.parcel.fruitType, icon: "spa" },
                          { label: "Variété", value: selectedEstimationDetail.parcel.variety, icon: "eco" },
                          { label: "Porte-greffe", value: selectedEstimationDetail.parcel.rootstock, icon: "agriculture" },
                          { label: "Nombre d’arbres", value: selectedEstimationDetail.parcel.treeCount.toLocaleString("fr-FR"), icon: "park" },
                          { label: "Espacement", value: selectedEstimationDetail.parcel.spacing, icon: "straighten" },
                          { label: "Secteur", value: selectedEstimationJob.sectorName, icon: "map" },
                          { label: "Région", value: "Cap Bon", icon: "location_on" },
                        ].map((item) => (
                          <div key={item.label} className={styles.travailParcelleSheetRow}>
                            <span className={styles.travailParcelleSheetRowIcon} aria-hidden="true">{item.icon}</span>
                            <span className={styles.travailParcelleSheetRowLabel}>{item.label}</span>
                            <span className={styles.travailParcelleSheetRowValue}>{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
                {isEstimationConfigSheetOpen ? (
                  <div
                    className={styles.travailParcelleSheetOverlay}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Configuration estimation"
                    onClick={() => setIsEstimationConfigSheetOpen(false)}
                  >
                    <div
                      className={styles.travailParcelleSheet}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className={styles.travailParcelleSheetHandle} aria-hidden="true" />
                      <div className={styles.travailParcelleSheetHeader}>
                        <div className={styles.travailParcelleSheetHeaderIcon} aria-hidden="true">
                          <span>tune</span>
                        </div>
                        <div className={styles.travailParcelleSheetHeaderText}>
                          <h3>Estimation configuration</h3>
                          <p>{selectedEstimationJob.displayTitle}</p>
                        </div>
                        <span className={styles.travailParcelleSheetTag}>Capture</span>
                      </div>
                      <div className={styles.travailParcelleSheetDivider} aria-hidden="true" />
                      <div className={styles.travailParcelleSheetRows}>
                        {[
                          { label: "Pourcentage d’arbres", value: selectedEstimationDetail.settings.treePercentage, icon: "percent" },
                          { label: "Orientation", value: selectedEstimationDetail.settings.orientation, icon: "explore" },
                          {
                            label: "Multi-images",
                            value: selectedEstimationDetail.settings.multiImagesEnabled ? "Activé" : "Désactivé",
                            icon: "photo_library",
                          },
                          { label: "Mode", value: selectedEstimationDetail.settings.mode, icon: "crop_portrait" },
                        ].map((item) => (
                          <div key={item.label} className={styles.travailParcelleSheetRow}>
                            <span className={styles.travailParcelleSheetRowIcon} aria-hidden="true">{item.icon}</span>
                            <span className={styles.travailParcelleSheetRowLabel}>{item.label}</span>
                            <span className={styles.travailParcelleSheetRowValue}>{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
                {isCameraDemoOpen ? (
                  <div className={styles.travailCameraOverlay} role="dialog" aria-modal="true">
                    <div className={styles.travailCameraHeader}>
                      <button
                        className={styles.pageBackButton}
                        type="button"
                        aria-label="Fermer la caméra"
                        onClick={() => setIsCameraDemoOpen(false)}
                      >
                        <span className={styles.pageBackIcon} aria-hidden="true">close</span>
                      </button>
                      <div className={styles.travailCameraHeaderText}>
                        <h3>Caméra</h3>
                        <p>{selectedEstimationJob.displayTitle}</p>
                      </div>
                    </div>
                    <div className={styles.travailCameraPreview}>
                      <span className={styles.travailCameraGridLine} />
                      <span className={styles.travailCameraGridLine} />
                      <span className={styles.travailCameraGridLineVertical} />
                      <span className={styles.travailCameraGridLineVertical} />
                      <div className={styles.travailCameraFocus}>
                        <span>crop_free</span>
                      </div>
                    </div>
                    <div className={styles.travailCameraFooter}>
                      <span className={styles.travailCameraMode}>Portrait</span>
                      <button className={styles.travailCameraShutter} type="button" aria-label="Capturer">
                        <span />
                      </button>
                      <span className={styles.travailCameraMode}>
                        {selectedEstimationJob.capturedImages} / {selectedEstimationJob.targetImages}
                      </span>
                    </div>
                  </div>
                ) : null}
          </>
        ) : (
        <>
        <div className={`${styles.secteursContent} ${styles.travailContent}`}>
          <div className={styles.posteStickyTop}>
            <div className={styles.homeHeaderRow}>
              <div className={styles.posteFixeTitleBlock}>
                <h2 className={styles.posteFixeTitle}>Travail</h2>
                <p className={styles.posteFixeSubtitle}>Campagne 2025-2026</p>
              </div>
              <div className={styles.homeHeaderActions}>
<button
                  className={styles.syncBadge}
                  type="button"
                  aria-label={syncState.label}
                  onClick={() => setSyncStateIndex((prev) => (prev + 1) % syncStates.length)}
                >
                  <span className={styles.googleSymbol} aria-hidden="true">
                    {syncState.icon}
                  </span>
                </button>
                <span className={styles.homeAvatar} aria-label="User avatar">
                  OE
                </span>
              </div>
            </div>

            <div className={styles.travailSegmentedTabs} role="tablist" aria-label="Filtres travail">
              {[
                { key: "estimation" as TravailFilter, label: "Volume", count: frameView === "empty" ? 0 : jobCounts.estimation },
                { key: "calibre" as TravailFilter, label: "Calibre", count: frameView === "empty" ? 0 : jobCounts.calibre },
              ].map((tab) => (
                <button
                  key={tab.key}
                  className={`${styles.travailSegmentedTab} ${
                    activeFilter === tab.key ? styles.travailSegmentedTabActive : ""
                  }`}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                >
                  <span>{tab.label}</span>
                  <span className={styles.travailSegmentedTabCount}>{tab.count}</span>
                </button>
              ))}
            </div>
            {frameView !== "empty" ? (
            <div className={styles.travailSearchRow}>
              <label className={styles.travailSearchField}>
                <span className={`${styles.googleSymbol} ${styles.travailSearchIcon}`} aria-hidden="true">search</span>
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Rechercher une parcelle"
                  type="search"
                  aria-label="Rechercher une parcelle"
                />
              </label>
              <span className={styles.travailSearchDivider} aria-hidden="true" />
              <button
                className={`${styles.travailFilterButton} ${
                  activeAdvancedFilterCount > 0 ? styles.travailFilterButtonActive : ""
                }`}
                type="button"
                aria-label="Ouvrir les filtres"
                onClick={() => setIsTravailFiltersSheetOpen(true)}
              >
                <span className={`${styles.googleSymbol}`} aria-hidden="true">tune</span>
                {activeAdvancedFilterCount > 0 ? (
                  <span className={styles.travailFilterButtonCount} aria-hidden="true" />
                ) : null}
              </button>
            </div>
            ) : null}
          </div>

          {frameView === "loading" ? (
            <div className={styles.travailJobList} aria-busy="true" aria-label="Chargement en cours">
              {[
                { title: 72, meta: 55, progress: 68 },
                { title: 60, meta: 45, progress: 82 },
                { title: 78, meta: 50, progress: 40 },
                { title: 65, meta: 60, progress: 55 },
              ].map((skeleton, index) => (
                <div key={index} className={`${styles.posteCard} ${styles.travailJobCard}`} aria-hidden="true">
                  <div className={styles.travailJobCardHeader}>
                    <span className={styles.skeletonTitle} style={{ width: `${skeleton.title}%` }} />
                    <span className={styles.skeletonBadge} />
                  </div>
                  <span className={styles.skeletonSub} style={{ width: `${skeleton.meta}%` }} />
                  <span className={styles.skeletonDate} style={{ width: "45%" }} />
                  <span className={styles.skeletonMeta} style={{ width: "30%" }} />
                  <span className={styles.skeletonProgress} style={{ width: `${skeleton.progress}%` }} />
                </div>
              ))}
            </div>
          ) : frameView === "empty" ? (
            <div className={styles.postesEmptyWrap}>
              <div className={styles.postesEmptyCard}>
                <div className={styles.postesEmptyIllustration} aria-hidden="true">
                  <span className={styles.postesEmptyIconMain}>assignment</span>
                </div>
                <div className={styles.postesEmptyText}>
                  <p className={styles.postesEmptyTitle}>Aucun travail assigné</p>
                  <p className={styles.postesEmptySubtitle}>
                    Vos tâches de terrain apparaîtront ici une fois assignées
                  </p>
                </div>
              </div>
            </div>
          ) : visibleJobs.length > 0 ? (
            <div className={styles.travailJobList}>
              {visibleJobs.map((job) => {
                const pendingImages = Math.max(job.capturedImages - job.syncedImages, 0);
                const syncedImages = job.syncedImages;
                const syncedRatio = job.targetImages === 0 ? 0 : (syncedImages / job.targetImages) * 100;
                const pendingRatio = job.targetImages === 0 ? 0 : (pendingImages / job.targetImages) * 100;
                const dueTime = parseIsoDateToTime(job.dueDate);
                const todayTime = parseIsoDateToTime(todayIso);
                const daysUntilDue = Math.ceil((dueTime - todayTime) / 86400000);
                const isOverdue = job.status !== "done" && daysUntilDue < 0;
                const isDueSoon = job.status !== "done" && daysUntilDue >= 0 && daysUntilDue <= 3;
                const isLockedUntilDate = job.status === "notStarted" && daysUntilDue > 0;
                const daysLate = Math.abs(daysUntilDue);
                const dueBadgeLabel =
                  job.status === "done"
                    ? null
                    : isLockedUntilDate
                      ? `dans ${daysUntilDue} j`
                      : isOverdue
                        ? `${daysLate} j retard`
                        : `${Math.max(daysUntilDue, 0)} j restants`;
                const dueText = isLockedUntilDate
                  ? `Début ${formatShortDateFr(job.dueDate)}`
                  : job.dueLabel.replace("Fin : ", "Fin ");
                return (
                  <button
                    key={job.id}
                    type="button"
                    className={`${styles.posteCard} ${styles.travailJobCard} ${job.type === "estimation" && !isLockedUntilDate ? styles.travailJobCardClickable : ""} ${
                      isLockedUntilDate ? styles.travailJobCardLocked : ""
                    }`}
                    onClick={() => {
                      if (job.type === "estimation" && !isLockedUntilDate) openEstimationDetail(job);
                    }}
                  >
                    <div className={styles.travailJobCardHeader}>
                      <div className={styles.travailJobCardTitleBlock}>
                        <h4 className={styles.posteFixeCardTitle}>{job.displayTitle}</h4>
                      </div>
                      <div className={styles.travailJobCardActions}>
                        {isLockedUntilDate ? (
                          <span className={`${styles.travailJobStatusBadge} ${styles.travailJobStatusScheduled}`}>
                            Planifié
                          </span>
                        ) : (
                          renderStatusBadge(job)
                        )}
                      </div>
                    </div>

                    <div className={styles.travailJobMetaRow}>
                      <span>{job.displayMeta}</span>
                    </div>

                    <div className={styles.travailJobDueRow}>
                      <div
                        className={`${styles.travailJobDueChip} ${
                          isOverdue
                            ? styles.travailJobDueChipUrgent
                            : isDueSoon
                              ? styles.travailJobDueChipSoon
                              : ""
                        }`}
                      >
                        <span className={styles.travailJobDueLabel}>{dueText}</span>
                      </div>
                      {dueBadgeLabel ? (
                        <span
                          className={`${styles.travailJobDueBadge} ${
                            isOverdue
                              ? styles.travailJobDueBadgeUrgent
                              : isDueSoon
                                ? styles.travailJobDueBadgeSoon
                                : ""
                          }`}
                        >
                          {dueBadgeLabel}
                        </span>
                      ) : null}
                    </div>

                    <div className={styles.travailJobProgressBlock}>
                      <div className={styles.travailJobProgressHeader}>
                        <span className={styles.travailJobProgressCount}>
                          <strong>{job.capturedImages}/{job.targetImages}</strong> captures
                        </span>
                        <span className={styles.travailJobProgressPercent}>
                          {Math.round(job.progressRatio * 100)}%
                        </span>
                      </div>
                      <div className={styles.travailJobProgressTrack} aria-hidden="true">
                        <span className={styles.travailJobProgressSynced} style={{ width: `${syncedRatio}%` }} />
                        <span className={styles.travailJobProgressPending} style={{ width: `${pendingRatio}%` }} />
                      </div>
                      <div className={styles.travailJobProgressLegend}>
                        <span className={styles.travailJobProgressLegendItem}>
                          <span className={`${styles.travailJobProgressDot} ${styles.travailJobProgressDotSynced}`} />
                          {syncedImages} sync
                        </span>
                        {pendingImages > 0 && (
                          <span className={styles.travailJobProgressLegendItem}>
                            <span className={`${styles.travailJobProgressDot} ${styles.travailJobProgressDotPending}`} />
                            {pendingImages} non sync
                          </span>
                        )}
                        <span className={styles.travailJobProgressLegendItem}>
                          {job.remainingImages} restantes
                        </span>
                      </div>
                    </div>

                  </button>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyStateIcon} aria-hidden="true">
                travel_explore
              </span>
              <h3>Aucun travail trouvé</h3>
              <p>Aucune tâche disponible pour ce filtre.</p>
            </div>
          )}
        </div>
          {isTravailFiltersSheetOpen ? (
            <div
              className={styles.travailFiltersSheetOverlay}
              role="dialog"
              aria-modal="true"
              aria-label="Filtres travail"
              onClick={() => setIsTravailFiltersSheetOpen(false)}
            >
              <div className={styles.travailFiltersSheet} onClick={(event) => event.stopPropagation()}>
                <div className={styles.travailFiltersSheetHandle} aria-hidden="true" />
                <div className={styles.travailFiltersSheetHeader}>
                  <div>
                    <h3>Filtres</h3>
                    <p>Affiner la liste des parcelles</p>
                  </div>
                  <button className={styles.travailFiltersResetButton} type="button" onClick={clearTravailFilters}>
                    Réinitialiser
                  </button>
                </div>
                <div className={styles.travailFiltersGroups}>
                  <section className={styles.travailFiltersGroup}>
                    <div className={styles.travailFiltersGroupHeader}>
                      <span className={styles.travailFiltersGroupIcon} aria-hidden="true">
                        <span className={styles.googleSymbol}>progress_activity</span>
                      </span>
                      <div className={styles.travailFiltersGroupCopy}>
                        <h4>Progression</h4>
                        <p>Filtrer par etat d'avancement</p>
                      </div>
                      <span className={styles.travailFiltersGroupCount}>{selectedStatusFilters.length}</span>
                    </div>
                    <div className={styles.travailFiltersChipGrid}>
                      {[
                        { value: "notStarted" as TravailJobStatus, label: "Planifié" },
                        { value: "inProgress" as TravailJobStatus, label: "En cours" },
                        { value: "done" as TravailJobStatus, label: "Terminé" },
                      ].map((option) => {
                        const selected = selectedStatusFilters.includes(option.value);
                        return (
                          <button
                            key={option.value}
                            className={`${styles.travailFiltersChip} ${selected ? styles.travailFiltersChipActive : ""}`}
                            type="button"
                            onClick={() => toggleFilterValue(option.value, selectedStatusFilters, setSelectedStatusFilters)}
                          >
                            {selected ? <span className={styles.travailFiltersChipCheckmark} aria-hidden="true">check</span> : null}
                            <span className={styles.travailFiltersChipLabel}>{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                  <section className={styles.travailFiltersGroup}>
                    <div className={styles.travailFiltersGroupHeader}>
                      <span className={styles.travailFiltersGroupIcon} aria-hidden="true">
                        <span className={styles.googleSymbol}>schedule</span>
                      </span>
                      <div className={styles.travailFiltersGroupCopy}>
                        <h4>Échéance</h4>
                        <p>Reperer les taches urgentes</p>
                      </div>
                      <span className={styles.travailFiltersGroupCount}>{selectedDueFilters.length}</span>
                    </div>
                    <div className={styles.travailFiltersChipGrid}>
                      {[
                        { value: "overdue" as DueFilter, label: "En retard" },
                        { value: "today" as DueFilter, label: "Aujourd'hui" },
                        { value: "upcoming" as DueFilter, label: "A venir" },
                      ].map((option) => {
                        const selected = selectedDueFilters.includes(option.value);
                        return (
                          <button
                            key={option.value}
                            className={`${styles.travailFiltersChip} ${selected ? styles.travailFiltersChipActive : ""}`}
                            type="button"
                            onClick={() => toggleFilterValue(option.value, selectedDueFilters, setSelectedDueFilters)}
                          >
                            {selected ? <span className={styles.travailFiltersChipCheckmark} aria-hidden="true">check</span> : null}
                            <span className={styles.travailFiltersChipLabel}>{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                  <section className={styles.travailFiltersGroup}>
                    <div className={styles.travailFiltersGroupHeader}>
                      <span className={styles.travailFiltersGroupIcon} aria-hidden="true">
                        <span className={styles.googleSymbol}>filter_3</span>
                      </span>
                      <div className={styles.travailFiltersGroupCopy}>
                        <h4>Estimation</h4>
                        <p>Choisir la serie d'estimation</p>
                      </div>
                      <span className={styles.travailFiltersGroupCount}>{selectedEstimationFilters.length}</span>
                    </div>
                    <div className={`${styles.travailFiltersChipGrid} ${styles.travailFiltersChipGridTight}`}>
                      {filterOptions.estimations.map((estimationNumber) => {
                        const selected = selectedEstimationFilters.includes(estimationNumber);
                        return (
                          <button
                            key={estimationNumber}
                            className={`${styles.travailFiltersChip} ${selected ? styles.travailFiltersChipActive : ""}`}
                            type="button"
                            onClick={() =>
                              toggleFilterValue(
                                estimationNumber,
                                selectedEstimationFilters,
                                setSelectedEstimationFilters
                              )
                            }
                          >
                            {selected ? <span className={styles.travailFiltersChipCheckmark} aria-hidden="true">check</span> : null}
                            <span className={styles.travailFiltersChipLabel}>{`Estimation ${estimationNumber}`}</span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                  <section className={styles.travailFiltersGroup}>
                    <div className={styles.travailFiltersGroupHeader}>
                      <span className={styles.travailFiltersGroupIcon} aria-hidden="true">
                        <span className={styles.googleSymbol}>location_on</span>
                      </span>
                      <div className={styles.travailFiltersGroupCopy}>
                        <h4>Secteurs</h4>
                        <p>Limiter la liste par zone</p>
                      </div>
                      <span className={styles.travailFiltersGroupCount}>{selectedSectorFilters.length}</span>
                    </div>
                    <div className={`${styles.travailFiltersChipGrid} ${styles.travailFiltersChipGridTight}`}>
                      {filterOptions.sectors.map((sector) => {
                        const selected = selectedSectorFilters.includes(sector);
                        return (
                          <button
                            key={sector}
                            className={`${styles.travailFiltersChip} ${selected ? styles.travailFiltersChipActive : ""}`}
                            type="button"
                            onClick={() => toggleFilterValue(sector, selectedSectorFilters, setSelectedSectorFilters)}
                          >
                            {selected ? <span className={styles.travailFiltersChipCheckmark} aria-hidden="true">check</span> : null}
                            <span className={styles.travailFiltersChipLabel}>{sector}</span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                </div>
                <div className={styles.travailFiltersSheetFooter}>
                  <button
                    className={styles.travailFiltersApplyButton}
                    type="button"
                    onClick={() => setIsTravailFiltersSheetOpen(false)}
                  >
                    Afficher {visibleJobs.length} résultats
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </>
        )}
    </>
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
        } ${isMapDetail ? styles.travailMapScreen : ""}`}
      >
        <WorkerAppStatusBar theme={isMapDetail ? "dark" : theme} transparent={isMapDetail} />
        {content}
        {selectedEstimationJob || isTravailFiltersSheetOpen || isEstimationConfigSheetOpen ? null : (
          <WorkerAppHomeBottomBarScreen activeIndex={1} />
        )}
        {isTravailFiltersSheetOpen || isEstimationConfigSheetOpen ? null : (
          <WorkerAppNavigationScreen surface={selectedEstimationJob ? "page" : "default"} />
        )}
      </div>
    </div>
  );
}
