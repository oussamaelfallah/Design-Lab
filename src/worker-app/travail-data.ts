export type TravailJobType = "estimation" | "calibre";
export type TravailFilter = TravailJobType;
export type TravailJobStatus = "notStarted" | "inProgress" | "done";
export type DueFilter = "overdue" | "today" | "upcoming";

export type TravailJobSeed = {
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

export type TravailJob = TravailJobSeed & {
  displayTitle: string;
  displayMeta: string;
  referenceName: string;
  remainingImages: number;
  progressRatio: number;
  status: TravailJobStatus;
  statusLabel: string;
  dueLabel: string;
};

export type TravailJobDetail = {
  pendingSyncImages: number;
  failedSyncImages: number;
  lastCaptureLabel: string;
  settings: {
    mode: "Manuel" | "Sur plan" | "Sur arbre";
  };
  parcel: {
    fruitType: string;
    variety: string;
    rootstock: string;
    treeCount: number;
    spacing: string;
  };
};

type TravailDetailSeed = {
  id: string;
  pendingSyncImages: number;
  failedSyncImages: number;
  lastCaptureLabel: string;
  settings: TravailJobDetail["settings"];
  parcel: TravailJobDetail["parcel"];
};

export function getCurrentIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(dateIso: string, days: number): string {
  const nextDate = new Date(`${dateIso}T00:00:00`);
  nextDate.setDate(nextDate.getDate() + days);
  const year = nextDate.getFullYear();
  const month = `${nextDate.getMonth() + 1}`.padStart(2, "0");
  const day = `${nextDate.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseIsoDateToTime(dateIso: string): number {
  return new Date(`${dateIso}T00:00:00`).getTime();
}

export function formatShortDateFr(dateIso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(`${dateIso}T00:00:00`));
}

export function getDueState(job: TravailJob, todayIso: string): DueFilter {
  if (job.dueDate === todayIso) {
    return "today";
  }
  if (parseIsoDateToTime(job.dueDate) < parseIsoDateToTime(todayIso)) {
    return "overdue";
  }
  return "upcoming";
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

const ESTIMATION_DETAILS: TravailDetailSeed[] = [
  {
    id: "est-10112-2",
    pendingSyncImages: 2,
    failedSyncImages: 1,
    lastCaptureLabel: "Il y a 45 min",
    settings: { mode: "Sur arbre" },
    parcel: {
      fruitType: "Orange",
      variety: "Navel",
      rootstock: "Carrizo",
      treeCount: 320,
      spacing: "6 m × 4 m",
    },
  },
  {
    id: "est-10118-1",
    pendingSyncImages: 0,
    failedSyncImages: 0,
    lastCaptureLabel: "Il y a 2 h",
    settings: { mode: "Sur plan" },
    parcel: {
      fruitType: "Citron",
      variety: "Eureka",
      rootstock: "Citrange Troyer",
      treeCount: 210,
      spacing: "5 m × 3 m",
    },
  },
  {
    id: "est-10250-3",
    pendingSyncImages: 2,
    failedSyncImages: 0,
    lastCaptureLabel: "Il y a 1 h",
    settings: { mode: "Sur arbre" },
    parcel: {
      fruitType: "Mandarine",
      variety: "Clémentine",
      rootstock: "Poncirus",
      treeCount: 415,
      spacing: "5 m × 4 m",
    },
  },
  {
    id: "est-10450-1",
    pendingSyncImages: 0,
    failedSyncImages: 0,
    lastCaptureLabel: "Il y a 20 min",
    settings: { mode: "Sur arbre" },
    parcel: {
      fruitType: "Pamplemousse",
      variety: "Star Ruby",
      rootstock: "Swingle",
      treeCount: 180,
      spacing: "7 m × 5 m",
    },
  },
  {
    id: "est-10300-1",
    pendingSyncImages: 0,
    failedSyncImages: 0,
    lastCaptureLabel: "—",
    settings: { mode: "Sur arbre" },
    parcel: {
      fruitType: "Orange",
      variety: "Valencia",
      rootstock: "Carrizo",
      treeCount: 290,
      spacing: "6 m × 4 m",
    },
  },
  {
    id: "est-10089-2",
    pendingSyncImages: 0,
    failedSyncImages: 0,
    lastCaptureLabel: "Il y a 3 h",
    settings: { mode: "Sur plan" },
    parcel: {
      fruitType: "Citron",
      variety: "Lisbon",
      rootstock: "Citrus macrophylla",
      treeCount: 155,
      spacing: "5 m × 3.5 m",
    },
  },
  {
    id: "est-10374-1",
    pendingSyncImages: 1,
    failedSyncImages: 0,
    lastCaptureLabel: "Il y a 30 min",
    settings: { mode: "Sur arbre" },
    parcel: {
      fruitType: "Orange",
      variety: "Salustiana",
      rootstock: "Bigaradier",
      treeCount: 340,
      spacing: "6 m × 4 m",
    },
  },
  {
    id: "est-10421-2",
    pendingSyncImages: 3,
    failedSyncImages: 2,
    lastCaptureLabel: "Il y a 1 h 20 min",
    settings: { mode: "Sur arbre" },
    parcel: {
      fruitType: "Mandarine",
      variety: "Nadorcott",
      rootstock: "Poncirus",
      treeCount: 203,
      spacing: "5 m × 3 m",
    },
  },
  {
    id: "est-10533-1",
    pendingSyncImages: 0,
    failedSyncImages: 0,
    lastCaptureLabel: "—",
    settings: { mode: "Sur plan" },
    parcel: {
      fruitType: "Citron",
      variety: "Fino",
      rootstock: "Citrange Carrizo",
      treeCount: 128,
      spacing: "4 m × 3 m",
    },
  },
  {
    id: "est-10601-1",
    pendingSyncImages: 0,
    failedSyncImages: 0,
    lastCaptureLabel: "Il y a 4 h",
    settings: { mode: "Sur arbre" },
    parcel: {
      fruitType: "Orange",
      variety: "Navelina",
      rootstock: "Carrizo",
      treeCount: 276,
      spacing: "6 m × 4 m",
    },
  },
  {
    id: "est-10612-3",
    pendingSyncImages: 1,
    failedSyncImages: 1,
    lastCaptureLabel: "Il y a 2 h 30 min",
    settings: { mode: "Manuel" },
    parcel: {
      fruitType: "Pamplemousse",
      variety: "Marsh",
      rootstock: "Swingle",
      treeCount: 142,
      spacing: "7 m × 5 m",
    },
  },
  {
    id: "est-10715-1",
    pendingSyncImages: 0,
    failedSyncImages: 0,
    lastCaptureLabel: "—",
    settings: { mode: "Manuel" },
    parcel: {
      fruitType: "Mandarine",
      variety: "Orri",
      rootstock: "Poncirus",
      treeCount: 388,
      spacing: "5 m × 4 m",
    },
  },
  {
    id: "est-10720-2",
    pendingSyncImages: 0,
    failedSyncImages: 0,
    lastCaptureLabel: "Il y a 10 min",
    settings: { mode: "Sur plan" },
    parcel: {
      fruitType: "Orange",
      variety: "Cara Cara",
      rootstock: "Bigaradier",
      treeCount: 198,
      spacing: "6 m × 3.5 m",
    },
  },
  {
    id: "est-10801-1",
    pendingSyncImages: 4,
    failedSyncImages: 0,
    lastCaptureLabel: "Il y a 50 min",
    settings: { mode: "Manuel" },
    parcel: {
      fruitType: "Citron",
      variety: "Interdonato",
      rootstock: "Citrus macrophylla",
      treeCount: 167,
      spacing: "5 m × 3 m",
    },
  },
  {
    id: "est-10840-1",
    pendingSyncImages: 0,
    failedSyncImages: 0,
    lastCaptureLabel: "—",
    settings: { mode: "Manuel" },
    parcel: {
      fruitType: "Orange",
      variety: "Washington Navel",
      rootstock: "Carrizo",
      treeCount: 312,
      spacing: "6 m × 4 m",
    },
  },
  {
    id: "est-10903-2",
    pendingSyncImages: 0,
    failedSyncImages: 0,
    lastCaptureLabel: "Il y a 35 min",
    settings: { mode: "Manuel" },
    parcel: {
      fruitType: "Mandarine",
      variety: "Hernandina",
      rootstock: "Citrange Troyer",
      treeCount: 224,
      spacing: "5 m × 3.5 m",
    },
  },
  {
    id: "est-10950-1",
    pendingSyncImages: 2,
    failedSyncImages: 1,
    lastCaptureLabel: "Il y a 1 h 45 min",
    settings: { mode: "Sur plan" },
    parcel: {
      fruitType: "Citron",
      variety: "Primofiori",
      rootstock: "Citrange Carrizo",
      treeCount: 145,
      spacing: "4.5 m × 3 m",
    },
  },
  {
    id: "est-11005-1",
    pendingSyncImages: 0,
    failedSyncImages: 0,
    lastCaptureLabel: "—",
    settings: { mode: "Manuel" },
    parcel: {
      fruitType: "Orange",
      variety: "Navel Lane Late",
      rootstock: "Carrizo",
      treeCount: 258,
      spacing: "6 m × 4 m",
    },
  },
  {
    id: "est-11042-3",
    pendingSyncImages: 0,
    failedSyncImages: 0,
    lastCaptureLabel: "Il y a 5 h",
    settings: { mode: "Manuel" },
    parcel: {
      fruitType: "Pamplemousse",
      variety: "Ruby Red",
      rootstock: "Swingle",
      treeCount: 110,
      spacing: "7 m × 5 m",
    },
  },
  {
    id: "est-11100-1",
    pendingSyncImages: 1,
    failedSyncImages: 0,
    lastCaptureLabel: "Il y a 20 min",
    settings: { mode: "Manuel" },
    parcel: {
      fruitType: "Mandarine",
      variety: "Tango",
      rootstock: "Poncirus",
      treeCount: 175,
      spacing: "5 m × 3 m",
    },
  },
];

const CALIBRE_DETAILS: TravailDetailSeed[] = [
  {
    id: "cal-20518-1",
    pendingSyncImages: 44,
    failedSyncImages: 0,
    lastCaptureLabel: "Il y a 25 min",
    settings: { mode: "Manuel" },
    parcel: {
      fruitType: "Orange",
      variety: "Navel Late",
      rootstock: "Carrizo",
      treeCount: 286,
      spacing: "6 m × 4 m",
    },
  },
  {
    id: "cal-20240-1",
    pendingSyncImages: 0,
    failedSyncImages: 0,
    lastCaptureLabel: "Il y a 1 h",
    settings: { mode: "Sur plan" },
    parcel: {
      fruitType: "Citron",
      variety: "Eureka",
      rootstock: "Citrange Troyer",
      treeCount: 194,
      spacing: "5 m × 3 m",
    },
  },
  {
    id: "cal-20410-2",
    pendingSyncImages: 0,
    failedSyncImages: 0,
    lastCaptureLabel: "Il y a 3 h",
    settings: { mode: "Manuel" },
    parcel: {
      fruitType: "Mandarine",
      variety: "Nadorcott",
      rootstock: "Poncirus",
      treeCount: 248,
      spacing: "5 m × 3.5 m",
    },
  },
  {
    id: "cal-20622-1",
    pendingSyncImages: 28,
    failedSyncImages: 1,
    lastCaptureLabel: "Il y a 40 min",
    settings: { mode: "Manuel" },
    parcel: {
      fruitType: "Pamplemousse",
      variety: "Star Ruby",
      rootstock: "Swingle",
      treeCount: 132,
      spacing: "7 m × 5 m",
    },
  },
];

export function buildTravailJobs(todayIso: string): TravailJob[] {
  const year = Number(todayIso.slice(0, 4));
  const seeds: TravailJobSeed[] = [
    {
      id: "est-10112-2",
      type: "estimation",
      parcelName: "Parcelle 10112",
      sectorName: "Secteur S4",
      year,
      yearlySequence: 2,
      capturedImages: 116,
      syncedImages: 78,
      targetImages: 194,
      dueDate: addDays(todayIso, -4),
    },
    {
      id: "est-10118-1",
      type: "estimation",
      parcelName: "Parcelle 10118",
      sectorName: "Secteur S4",
      year,
      yearlySequence: 1,
      capturedImages: 92,
      syncedImages: 92,
      targetImages: 148,
      dueDate: todayIso,
    },
    {
      id: "est-10250-3",
      type: "estimation",
      parcelName: "Parcelle 10250",
      sectorName: "Secteur S1",
      year,
      yearlySequence: 3,
      capturedImages: 126,
      syncedImages: 94,
      targetImages: 210,
      dueDate: addDays(todayIso, 3),
    },
    {
      id: "est-10450-1",
      type: "estimation",
      parcelName: "Parcelle 10450",
      sectorName: "Secteur S2",
      year,
      yearlySequence: 1,
      capturedImages: 188,
      syncedImages: 188,
      targetImages: 246,
      dueDate: addDays(todayIso, 5),
    },
    {
      id: "est-10300-1",
      type: "estimation",
      parcelName: "Parcelle 10300",
      sectorName: "Secteur S3",
      year,
      yearlySequence: 1,
      capturedImages: 0,
      syncedImages: 0,
      targetImages: 132,
      dueDate: addDays(todayIso, 8),
    },
    {
      id: "est-10089-2",
      type: "estimation",
      parcelName: "Parcelle 10089",
      sectorName: "Secteur S2",
      year,
      yearlySequence: 2,
      capturedImages: 164,
      syncedImages: 164,
      targetImages: 164,
      dueDate: addDays(todayIso, -1),
    },
    {
      id: "est-10374-1",
      type: "estimation",
      parcelName: "Parcelle 10374",
      sectorName: "Secteur S1",
      year,
      yearlySequence: 1,
      capturedImages: 143,
      syncedImages: 132,
      targetImages: 204,
      dueDate: addDays(todayIso, 2),
    },
    {
      id: "est-10421-2",
      type: "estimation",
      parcelName: "Parcelle 10421",
      sectorName: "Secteur S5",
      year,
      yearlySequence: 2,
      capturedImages: 87,
      syncedImages: 82,
      targetImages: 150,
      dueDate: addDays(todayIso, -2),
    },
    {
      id: "est-10533-1",
      type: "estimation",
      parcelName: "Parcelle 10533",
      sectorName: "Secteur S6",
      year,
      yearlySequence: 1,
      capturedImages: 0,
      syncedImages: 0,
      targetImages: 150,
      dueDate: addDays(todayIso, 10),
    },
    {
      id: "est-10601-1",
      type: "estimation",
      parcelName: "Parcelle 10601",
      sectorName: "Secteur S3",
      year,
      yearlySequence: 1,
      capturedImages: 178,
      syncedImages: 178,
      targetImages: 178,
      dueDate: addDays(todayIso, -6),
    },
    {
      id: "est-10612-3",
      type: "estimation",
      parcelName: "Parcelle 10612",
      sectorName: "Secteur S2",
      year,
      yearlySequence: 3,
      capturedImages: 62,
      syncedImages: 59,
      targetImages: 100,
      dueDate: addDays(todayIso, -1),
    },
    {
      id: "est-10715-1",
      type: "estimation",
      parcelName: "Parcelle 10715",
      sectorName: "Secteur S7",
      year,
      yearlySequence: 1,
      capturedImages: 0,
      syncedImages: 0,
      targetImages: 250,
      dueDate: addDays(todayIso, 14),
    },
    {
      id: "est-10720-2",
      type: "estimation",
      parcelName: "Parcelle 10720",
      sectorName: "Secteur S1",
      year,
      yearlySequence: 2,
      capturedImages: 122,
      syncedImages: 122,
      targetImages: 122,
      dueDate: addDays(todayIso, -3),
    },
    {
      id: "est-10801-1",
      type: "estimation",
      parcelName: "Parcelle 10801",
      sectorName: "Secteur S5",
      year,
      yearlySequence: 1,
      capturedImages: 120,
      syncedImages: 116,
      targetImages: 203,
      dueDate: addDays(todayIso, 4),
    },
    {
      id: "est-10840-1",
      type: "estimation",
      parcelName: "Parcelle 10840",
      sectorName: "Secteur S3",
      year,
      yearlySequence: 1,
      capturedImages: 0,
      syncedImages: 0,
      targetImages: 180,
      dueDate: addDays(todayIso, 7),
    },
    {
      id: "est-10903-2",
      type: "estimation",
      parcelName: "Parcelle 10903",
      sectorName: "Secteur S6",
      year,
      yearlySequence: 2,
      capturedImages: 112,
      syncedImages: 112,
      targetImages: 162,
      dueDate: addDays(todayIso, 1),
    },
    {
      id: "est-10950-1",
      type: "estimation",
      parcelName: "Parcelle 10950",
      sectorName: "Secteur S4",
      year,
      yearlySequence: 1,
      capturedImages: 138,
      syncedImages: 129,
      targetImages: 235,
      dueDate: addDays(todayIso, -5),
    },
    {
      id: "est-11005-1",
      type: "estimation",
      parcelName: "Parcelle 11005",
      sectorName: "Secteur S2",
      year,
      yearlySequence: 1,
      capturedImages: 0,
      syncedImages: 0,
      targetImages: 144,
      dueDate: addDays(todayIso, 9),
    },
    {
      id: "est-11042-3",
      type: "estimation",
      parcelName: "Parcelle 11042",
      sectorName: "Secteur S7",
      year,
      yearlySequence: 3,
      capturedImages: 130,
      syncedImages: 130,
      targetImages: 130,
      dueDate: addDays(todayIso, -7),
    },
    {
      id: "est-11100-1",
      type: "estimation",
      parcelName: "Parcelle 11100",
      sectorName: "Secteur S1",
      year,
      yearlySequence: 1,
      capturedImages: 45,
      syncedImages: 36,
      targetImages: 180,
      dueDate: addDays(todayIso, 6),
    },
    {
      id: "cal-20518-1",
      type: "calibre",
      parcelName: "Parcelle 20518",
      sectorName: "Secteur S5",
      year,
      yearlySequence: 1,
      capturedImages: 86,
      syncedImages: 42,
      targetImages: 190,
      dueDate: addDays(todayIso, -2),
    },
    {
      id: "cal-20240-1",
      type: "calibre",
      parcelName: "Parcelle 20240",
      sectorName: "Secteur S1",
      year,
      yearlySequence: 1,
      capturedImages: 74,
      syncedImages: 74,
      targetImages: 120,
      dueDate: addDays(todayIso, 1),
    },
    {
      id: "cal-20410-2",
      type: "calibre",
      parcelName: "Parcelle 20410",
      sectorName: "Secteur S6",
      year,
      yearlySequence: 2,
      capturedImages: 110,
      syncedImages: 110,
      targetImages: 110,
      dueDate: addDays(todayIso, -3),
    },
    {
      id: "cal-20622-1",
      type: "calibre",
      parcelName: "Parcelle 20622",
      sectorName: "Secteur S3",
      year,
      yearlySequence: 1,
      capturedImages: 28,
      syncedImages: 0,
      targetImages: 140,
      dueDate: addDays(todayIso, 6),
    },
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

export function getSortPriority(status: TravailJobStatus): number {
  switch (status) {
    case "inProgress":
      return 0;
    case "notStarted":
      return 1;
    case "done":
      return 2;
  }
}

export function sortTravailJobs(a: TravailJob, b: TravailJob): number {
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

export function getTravailJobDetail(job: TravailJob): TravailJobDetail {
  const seed =
    job.type === "calibre"
      ? CALIBRE_DETAILS.find((detail) => detail.id === job.id)
      : ESTIMATION_DETAILS.find((detail) => detail.id === job.id);

  return {
    pendingSyncImages: seed?.pendingSyncImages ?? 0,
    failedSyncImages: seed?.failedSyncImages ?? 0,
    lastCaptureLabel: seed?.lastCaptureLabel ?? "—",
    settings: seed?.settings ?? { mode: "Manuel" },
    parcel: seed?.parcel ?? {
      fruitType: "—",
      variety: "—",
      rootstock: "—",
      treeCount: 0,
      spacing: "—",
    },
  };
}
