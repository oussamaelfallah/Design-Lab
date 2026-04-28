"use client";

import { useMemo, useState } from "react";
import styles from "./worker-app.module.css";
import { WorkerAppHomeBottomBarScreen } from "./screens/home-bottom-bar-screen";
import { WorkerAppNavigationScreen } from "./screens/navigation-screen";
import { WorkerAppStatusBar } from "./screens/status-bar";

type TravailJobType = "estimation" | "calibre";
type TravailJobStatus = "late" | "due_today" | "scheduled" | "done";

type TravailJob = {
  id: string;
  type: TravailJobType;
  parcelName: string;
  sectorName: string;
  year: number;
  yearlySequence: number;
  displayTitle: string;
  displayMeta: string;
  referenceName: string;
  capturedImages: number;
  targetImages: number;
  remainingImages: number;
  dueDate: string;
  status: TravailJobStatus;
};

const STATUS_SORT_ORDER: Record<TravailJobStatus, number> = {
  late: 0,
  due_today: 1,
  scheduled: 2,
  done: 3,
};

const STATUS_LABELS: Record<TravailJobStatus, string> = {
  late: "En retard",
  due_today: "À faire aujourd'hui",
  scheduled: "Planifié",
  done: "Terminé",
};

const SEED_JOBS: TravailJob[] = [
  {
    id: "est-1",
    type: "estimation",
    parcelName: "Parcelle 10112",
    sectorName: "Secteur S4",
    year: 2026,
    yearlySequence: 2,
    displayTitle: "Parcelle 10112",
    displayMeta: "Estimation 2026 • #2 • Secteur S4",
    referenceName: "Parcelle10112_EST26_2",
    capturedImages: 6,
    targetImages: 10,
    remainingImages: 4,
    dueDate: "2026-04-20",
    status: "late",
  },
  {
    id: "est-2",
    type: "estimation",
    parcelName: "Parcelle 20453",
    sectorName: "Secteur S1",
    year: 2026,
    yearlySequence: 1,
    displayTitle: "Parcelle 20453",
    displayMeta: "Estimation 2026 • #1 • Secteur S1",
    referenceName: "Parcelle20453_EST26_1",
    capturedImages: 0,
    targetImages: 8,
    remainingImages: 8,
    dueDate: "2026-04-28",
    status: "due_today",
  },
  {
    id: "est-3",
    type: "estimation",
    parcelName: "Parcelle 33701",
    sectorName: "Secteur S2",
    year: 2026,
    yearlySequence: 1,
    displayTitle: "Parcelle 33701",
    displayMeta: "Estimation 2026 • #1 • Secteur S2",
    referenceName: "Parcelle33701_EST26_1",
    capturedImages: 3,
    targetImages: 12,
    remainingImages: 9,
    dueDate: "2026-05-05",
    status: "scheduled",
  },
  {
    id: "est-4",
    type: "estimation",
    parcelName: "Parcelle 47822",
    sectorName: "Secteur S3",
    year: 2026,
    yearlySequence: 1,
    displayTitle: "Parcelle 47822",
    displayMeta: "Estimation 2026 • #1 • Secteur S3",
    referenceName: "Parcelle47822_EST26_1",
    capturedImages: 10,
    targetImages: 10,
    remainingImages: 0,
    dueDate: "2026-04-15",
    status: "done",
  },
  {
    id: "cal-1",
    type: "calibre",
    parcelName: "Parcelle 10112",
    sectorName: "Secteur S2",
    year: 2026,
    yearlySequence: 1,
    displayTitle: "Parcelle 10112",
    displayMeta: "Calibre 2026 • #1 • Secteur S2",
    referenceName: "Parcelle10112_CAL26_1",
    capturedImages: 2,
    targetImages: 15,
    remainingImages: 13,
    dueDate: "2026-04-22",
    status: "late",
  },
  {
    id: "cal-2",
    type: "calibre",
    parcelName: "Parcelle 20453",
    sectorName: "Secteur S1",
    year: 2026,
    yearlySequence: 1,
    displayTitle: "Parcelle 20453",
    displayMeta: "Calibre 2026 • #1 • Secteur S1",
    referenceName: "Parcelle20453_CAL26_1",
    capturedImages: 7,
    targetImages: 7,
    remainingImages: 0,
    dueDate: "2026-04-10",
    status: "done",
  },
  {
    id: "cal-3",
    type: "calibre",
    parcelName: "Parcelle 58914",
    sectorName: "Secteur S5",
    year: 2026,
    yearlySequence: 1,
    displayTitle: "Parcelle 58914",
    displayMeta: "Calibre 2026 • #1 • Secteur S5",
    referenceName: "Parcelle58914_CAL26_1",
    capturedImages: 0,
    targetImages: 10,
    remainingImages: 10,
    dueDate: "2026-05-12",
    status: "scheduled",
  },
];

function smartSort(jobs: TravailJob[]): TravailJob[] {
  return [...jobs].sort((a, b) => {
    const statusDiff = STATUS_SORT_ORDER[a.status] - STATUS_SORT_ORDER[b.status];
    if (statusDiff !== 0) return statusDiff;
    const dateDiff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    if (dateDiff !== 0) return dateDiff;
    return a.capturedImages / a.targetImages - b.capturedImages / b.targetImages;
  });
}

function getSectionCount(jobs: TravailJob[]): string {
  const done = jobs.filter((j) => j.status === "done").length;
  return `${done}/${jobs.length} terminées`;
}

type FilterTab = "tous" | "estimation" | "calibre";

const FILTER_LABELS: Record<FilterTab, string> = {
  tous: "Tous",
  estimation: "Estimation",
  calibre: "Calibre",
};

type WorkerAppTravailPageProps = {
  showDeviceFrame: boolean;
  theme: "dark" | "light";
  frameTheme?: "dark" | "light";
  embedded?: boolean;
};

export function WorkerAppTravailPage({
  showDeviceFrame,
  theme,
  frameTheme,
  embedded,
}: WorkerAppTravailPageProps) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("tous");
  const resolvedFrameTheme = frameTheme ?? theme;
  const frameClass =
    resolvedFrameTheme === "light" ? styles.androidCanvasLightFrame : styles.androidCanvas;

  const estimationJobs = useMemo(
    () => smartSort(SEED_JOBS.filter((j) => j.type === "estimation")),
    [],
  );
  const calibreJobs = useMemo(
    () => smartSort(SEED_JOBS.filter((j) => j.type === "calibre")),
    [],
  );

  const mainContent = (
    <div className={styles.travailContent}>
      <div className={styles.homeHeaderRow}>
        <h2 className={styles.homeTitle}>Travail</h2>
        <div className={styles.homeHeaderActions}>
          <span className={styles.homeAvatar} aria-label="User avatar">
            OE
          </span>
        </div>
      </div>

      <div
        className={styles.travailFilterRow}
        role="tablist"
        aria-label="Filtrer les tâches"
      >
        {(["tous", "estimation", "calibre"] as FilterTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeFilter === tab}
            className={`${styles.travailFilterBtn}${activeFilter === tab ? ` ${styles.travailFilterBtnActive}` : ""}`}
            onClick={() => setActiveFilter(tab)}
          >
            {FILTER_LABELS[tab]}
          </button>
        ))}
      </div>

      <div className={styles.travailJobList} role="tabpanel">
        {activeFilter === "tous" ? (
          <>
            <TravailSection title="Estimation" jobs={estimationJobs} />
            <TravailSection title="Calibre" jobs={calibreJobs} />
          </>
        ) : activeFilter === "estimation" ? (
          <TravailJobCards jobs={estimationJobs} />
        ) : (
          <TravailJobCards jobs={calibreJobs} />
        )}
      </div>
    </div>
  );

  if (embedded) {
    return mainContent;
  }

  return (
    <div className={showDeviceFrame ? frameClass : styles.androidCanvasNoFrame}>
      <div
        className={`${styles.androidScreen} ${
          theme === "dark" ? styles.androidScreenDark : styles.androidScreenLight
        }`}
      >
        <WorkerAppStatusBar theme={theme} />
        {mainContent}
        <WorkerAppHomeBottomBarScreen activeIndex={1} />
        <WorkerAppNavigationScreen />
      </div>
    </div>
  );
}

function TravailSection({ title, jobs }: { title: string; jobs: TravailJob[] }) {
  return (
    <div className={styles.travailSection}>
      <div className={styles.travailSectionHeader}>
        <span className={styles.travailSectionTitle}>{title}</span>
        <span className={styles.travailSectionCount}>{getSectionCount(jobs)}</span>
      </div>
      <TravailJobCards jobs={jobs} />
    </div>
  );
}

function TravailJobCards({ jobs }: { jobs: TravailJob[] }) {
  return (
    <div className={styles.travailJobCards}>
      {jobs.map((job) => (
        <TravailJobCard key={job.id} job={job} />
      ))}
    </div>
  );
}

function TravailJobCard({ job }: { job: TravailJob }) {
  const progressPct =
    job.targetImages > 0
      ? Math.min(100, Math.round((job.capturedImages / job.targetImages) * 100))
      : 0;

  const chipClass = {
    late: styles.travailChipLate,
    due_today: styles.travailChipToday,
    scheduled: styles.travailChipScheduled,
    done: styles.travailChipDone,
  }[job.status];

  return (
    <button type="button" className={styles.travailJobCard}>
      <div className={styles.travailJobCardTop}>
        <span className={styles.travailJobTitle}>{job.displayTitle}</span>
        <span className={`${styles.travailChip} ${chipClass}`}>
          {STATUS_LABELS[job.status]}
        </span>
      </div>
      <p className={styles.travailJobMeta}>{job.displayMeta}</p>
      <div className={styles.travailProgressTrack}>
        <div className={styles.travailProgressFill} style={{ width: `${progressPct}%` }} />
      </div>
      <div className={styles.travailProgressRow}>
        <span className={styles.travailProgressLeft}>
          {job.capturedImages} / {job.targetImages} captures
        </span>
        {job.status !== "done" && (
          <span className={styles.travailProgressRight}>{job.remainingImages} restantes</span>
        )}
      </div>
    </button>
  );
}
