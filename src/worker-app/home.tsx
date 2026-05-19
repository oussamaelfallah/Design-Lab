"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import styles from "./worker-app.module.css";
import { WorkerAppHomeBottomBarScreen } from "./screens/home-bottom-bar-screen";
import { WorkerAppNavigationScreen } from "./screens/navigation-screen";
import { WorkerAppStatusBar } from "./screens/status-bar";
import {
  addDays,
  buildTravailJobs,
  formatShortDateFr,
  getCurrentIsoDate,
  getDueState,
  parseIsoDateToTime,
  type DueFilter,
  type TravailJob,
  type TravailJobType,
} from "./travail-data";

export type HomeFrameView = "data" | "loading" | "empty";
export type HomePreviewState =
  | "home-data"
  | "home-loading"
  | "home-empty"
  | "home-offline"
  | "home-all-complete"
  | "home-travaux-actifs-overdue"
  | "home-travaux-actifs-en-cours"
  | "home-travaux-actifs-planifie"
  | "home-travaux-actifs-empty";

export type HomeTravailNavigationTarget =
  | { kind: "filter"; filter: "active" | "completed" | "estimation" | "calibre" }
  | { kind: "detail"; jobId: string };

type WorkerAppHomePageProps = {
  showDeviceFrame: boolean;
  theme: "dark" | "light";
  frameTheme?: "dark" | "light";
  embedded?: boolean;
  frameView?: HomeFrameView;
  previewState?: HomePreviewState;
  isInteractive?: boolean;
  onOpenTravail?: (target: HomeTravailNavigationTarget) => void;
  onOpenProfile?: () => void;
};

type ProgressMetric = {
  capturedImages: number;
  targetImages: number;
  percent: number;
};

type TypeProgressSummary = ProgressMetric & {
  type: TravailJobType;
  assignedJobs: number;
  completedJobs: number;
};

function getClampedPercent(capturedImages: number, targetImages: number): number {
  if (targetImages <= 0) return 0;
  return Math.min(Math.round((capturedImages / targetImages) * 100), 100);
}

function buildProgressMetric(jobs: TravailJob[]): ProgressMetric {
  const capturedImages = jobs.reduce((sum, job) => sum + job.capturedImages, 0);
  const targetImages = jobs.reduce((sum, job) => sum + job.targetImages, 0);

  return {
    capturedImages,
    targetImages,
    percent: getClampedPercent(capturedImages, targetImages),
  };
}

function getTypeLabel(type: TravailJobType): string {
  return type === "estimation" ? "Estimation" : "Calibre";
}

function getDueLabel(job: TravailJob, todayIso: string): string {
  const dueState = getDueState(job, todayIso);

  if (dueState === "overdue") return "En retard";
  if (dueState === "today") return "Aujourd'hui";
  return `Fin : ${formatShortDateFr(job.dueDate)}`;
}

function getDueClass(dueState: DueFilter): string {
  if (dueState === "overdue") return styles.posteFixeDatesUrgent;
  if (dueState === "today") return styles.posteFixeDatesWarning;
  return "";
}

function getActiveJobPriority(job: TravailJob, todayIso: string): number {
  const dueState = getDueState(job, todayIso);

  if (dueState === "overdue") return 0;
  if (dueState === "today") return 1;
  if (job.status === "inProgress") return 2;
  return 3;
}

function buildActiveJobs(jobs: TravailJob[], todayIso: string): TravailJob[] {
  return jobs
    .filter((job) => job.capturedImages < job.targetImages)
    .sort((a, b) => {
      const priorityDelta = getActiveJobPriority(a, todayIso) - getActiveJobPriority(b, todayIso);
      if (priorityDelta !== 0) return priorityDelta;

      const progressDelta = b.progressRatio - a.progressRatio;
      if (progressDelta !== 0) return progressDelta;

      return parseIsoDateToTime(a.dueDate) - parseIsoDateToTime(b.dueDate);
    });
}

const syncStates = [
  { label: "Hors ligne", icon: "wifi_off", offline: true },
  { label: "Cloud Alert", icon: "cloud_alert", offline: false },
  { label: "Cloud Done", icon: "cloud_done", offline: false },
  { label: "Cloud Sync", icon: "cloud_sync", offline: false },
] as const;

export function WorkerAppHomePage({
  showDeviceFrame,
  theme,
  frameTheme,
  embedded = false,
  frameView = "data",
  previewState = "home-data",
  isInteractive = true,
  onOpenTravail,
  onOpenProfile,
}: WorkerAppHomePageProps) {
  const [syncStateIndex, setSyncStateIndex] = useState(2);
  const syncState = syncStates[syncStateIndex];
  const resolvedFrameTheme = frameTheme ?? theme;
  const frameClass =
    resolvedFrameTheme === "light" ? styles.androidCanvasLightFrame : styles.androidCanvas;
  const todayIso = useMemo(() => getCurrentIsoDate(), []);
  const baseJobs = useMemo(() => buildTravailJobs(todayIso), [todayIso]);
  const jobs = useMemo(() => {
    if (frameView === "empty" || previewState === "home-empty") return [];
    if (
      previewState === "home-all-complete" ||
      previewState === "home-travaux-actifs-empty"
    ) {
      return baseJobs.map((job) => ({
        ...job,
        capturedImages: Math.max(job.capturedImages, job.targetImages),
        syncedImages: Math.max(job.syncedImages, job.targetImages),
        remainingImages: 0,
        progressRatio: 1,
        status: "done" as const,
        statusLabel: "Terminé",
        dueLabel: "Captures complétées",
      }));
    }
    if (previewState === "home-travaux-actifs-en-cours") {
      return baseJobs.map((job, i) => ({
        ...job,
        capturedImages: Math.min(Math.max(job.capturedImages, 1), job.targetImages - 1),
        remainingImages: Math.max(job.targetImages - Math.min(Math.max(job.capturedImages, 1), job.targetImages - 1), 0),
        progressRatio: Math.min(Math.max(job.capturedImages, 1), job.targetImages - 1) / job.targetImages,
        dueDate: addDays(todayIso, 3 + i),
        status: "inProgress" as const,
        statusLabel: "En cours",
      }));
    }
    if (previewState === "home-travaux-actifs-planifie") {
      return baseJobs.map((job, i) => ({
        ...job,
        capturedImages: 0,
        syncedImages: 0,
        remainingImages: job.targetImages,
        progressRatio: 0,
        dueDate: addDays(todayIso, 5 + i),
        status: "notStarted" as const,
        statusLabel: "Planifié",
      }));
    }
    return baseJobs;
  }, [baseJobs, frameView, previewState, todayIso]);
  const isLoading = frameView === "loading" || previewState === "home-loading";
  const isOffline = previewState === "home-offline" || syncState.offline;
  const isAllComplete =
    jobs.length > 0 && jobs.every((job) => job.capturedImages >= job.targetImages);
  const totalProgress = useMemo(() => buildProgressMetric(jobs), [jobs]);
  const completedJobs = jobs.filter((job) => job.capturedImages >= job.targetImages).length;
  const activeJobs = useMemo(() => buildActiveJobs(jobs, todayIso), [jobs, todayIso]);
  const visibleActiveJobs = activeJobs.slice(0, 3);
  const overdueJobsCount = jobs.filter(
    (job) => job.capturedImages < job.targetImages && getDueState(job, todayIso) === "overdue"
  ).length;
  const todayJobsCount = jobs.filter(
    (job) => job.capturedImages < job.targetImages && getDueState(job, todayIso) === "today"
  ).length;
  const pendingSyncImages = jobs.reduce(
    (sum, job) => sum + Math.max(job.capturedImages - job.syncedImages, 0),
    0
  );
  const typeProgress = useMemo<TypeProgressSummary[]>(
    () =>
      (["estimation", "calibre"] as const).map((type) => {
        const typeJobs = jobs.filter((job) => job.type === type);
        const progress = buildProgressMetric(typeJobs);

        return {
          type,
          ...progress,
          assignedJobs: typeJobs.length,
          completedJobs: typeJobs.filter((job) => job.capturedImages >= job.targetImages).length,
        };
      }),
    [jobs]
  );

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    if (
      previewState === "home-travaux-actifs-overdue" ||
      previewState === "home-travaux-actifs-en-cours" ||
      previewState === "home-travaux-actifs-planifie" ||
      previewState === "home-travaux-actifs-empty"
    ) {
      const target = el.querySelector<HTMLElement>("[data-section='travaux-actifs']");
      if (target) {
        const containerRect = el.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        el.scrollTop += targetRect.top - containerRect.top - 12;
      }
    }
  }, [previewState]);

  const openTravail = (target: HomeTravailNavigationTarget) => {
    onOpenTravail?.(target);
  };

  const content = (
    <div ref={contentRef} className={`${styles.secteursContent} ${styles.homeOverviewContent}`}>
      <div className={styles.posteStickyTop}>
        <div className={styles.homeHeaderRow}>
          <div className={styles.posteFixeTitleBlock}>
            <h2 className={styles.posteFixeTitle}>Accueil</h2>
            <p className={styles.posteFixeSubtitle}>Vue rapide de votre travail terrain</p>
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
            <button
              className={styles.homeAvatar}
              type="button"
              aria-label="Ouvrir le profil"
              onClick={() => onOpenProfile?.()}
            >
              OE
            </button>
          </div>
        </div>
      </div>

      <section className={styles.homeProgressSection} aria-labelledby="home-progress-title">
        <h3 id="home-progress-title" className={styles.homeProgressOverviewTitle}>
          Progression
        </h3>

        <div className={styles.homeProgressOverviewCard}>
          {isLoading ? (
            <div className={styles.homeProgressSkeleton} aria-label="Chargement de la progression">
              <span className={styles.homeProgressSkeletonTitle} />
              <span className={styles.homeProgressSkeletonBar} />
              <span className={styles.homeProgressSkeletonStat} />
              <span className={styles.homeProgressSkeletonRow} />
              <span className={styles.homeProgressSkeletonRow} />
            </div>
          ) : jobs.length === 0 ? (
            <div className={styles.homeProgressEmptyState}>
              <p>Aucun travail assigné.</p>
              <span>Votre progression apparaîtra ici une fois les travaux assignés.</span>
            </div>
          ) : (
            <>
              <div className={styles.homeProgressCapturesHeader}>
                <span className={styles.homeProgressCapturesIconWrap} aria-hidden="true">
                  <span>image</span>
                </span>
                <span className={styles.homeProgressCapturesLabel}>Captures</span>
                <span className={styles.homeProgressRemainingPill}>
                  {totalProgress.targetImages > 0
                    ? `${Math.max(totalProgress.targetImages - totalProgress.capturedImages, 0)} restantes`
                    : "Sans objectif"}
                </span>
              </div>

              <button
                className={styles.homeProgressGlobalHero}
                type="button"
                onClick={() => openTravail({ kind: "filter", filter: "active" })}
                aria-label={`Progression captures, ${totalProgress.capturedImages} sur ${totalProgress.targetImages} images, ${totalProgress.percent}%.`}
              >
                <strong className={styles.homeProgressHeroPercent}>
                  {totalProgress.targetImages > 0 ? `${totalProgress.percent}%` : "—"}
                </strong>
                <span className={styles.homeProgressHeroFraction}>
                  {totalProgress.targetImages > 0
                    ? `${totalProgress.capturedImages} / ${totalProgress.targetImages} images réalisées`
                    : "Sans objectif"}
                </span>
                <span
                  className={styles.homeProgressMainBar}
                  aria-hidden="true"
                  style={{ "--progress": `${totalProgress.percent}%` } as CSSProperties}
                />
              </button>
            </>
          )}
        </div>

        {!isLoading && jobs.length > 0 ? (
          <>
            <div className={styles.homeProgressStatsGrid}>
              <button
                className={styles.homeProgressStatCard}
                type="button"
                onClick={() => openTravail({ kind: "filter", filter: "completed" })}
              >
                <div className={styles.homeProgressStatCardHeader}>
                  <span
                    className={`${styles.homeProgressStatIconWrap} ${styles.homeProgressStatIconDone}`}
                    aria-hidden="true"
                  >
                    <span>check_circle</span>
                  </span>
                  <span>Travaux terminés</span>
                </div>
                <div className={styles.homeProgressStatCardValue}>
                  <strong>
                    {completedJobs} / {jobs.length}
                  </strong>
                </div>
                <span className={styles.homeProgressStatCardMeta}>
                  {jobs.length > 0 ? Math.round((completedJobs / jobs.length) * 100) : 0}%
                  terminés
                </span>
              </button>
              <button
                className={styles.homeProgressStatCard}
                type="button"
                onClick={() => openTravail({ kind: "filter", filter: "active" })}
              >
                <div className={styles.homeProgressStatCardHeader}>
                  <span
                    className={`${styles.homeProgressStatIconWrap} ${styles.homeProgressStatIconActive}`}
                    aria-hidden="true"
                  >
                    <span>assignment</span>
                  </span>
                  <span>À compléter</span>
                </div>
                <div className={styles.homeProgressStatCardValue}>
                  <strong>{jobs.length - completedJobs} travaux</strong>
                </div>
                <span className={styles.homeProgressStatCardMeta}>
                  {jobs.length > 0
                    ? Math.round(((jobs.length - completedJobs) / jobs.length) * 100)
                    : 0}
                  % restants
                </span>
              </button>
            </div>

            <div className={styles.homeProgressBreakdownLabel}>Types de travaux</div>

            <div className={styles.homeProgressTypeCard}>
              <div className={styles.homeProgressTypeRows}>
                {typeProgress.map((item) => (
                  <button
                    key={item.type}
                    className={styles.homeProgressTypeRow}
                    type="button"
                    onClick={() => openTravail({ kind: "filter", filter: item.type })}
                    aria-label={`${getTypeLabel(item.type)}, ${item.capturedImages} sur ${item.targetImages} images, ${item.percent}%.`}
                  >
                    <span
                      className={styles.homeProgressMiniRing}
                      aria-hidden="true"
                      style={{ "--progress-deg": `${item.percent * 3.6}deg` } as CSSProperties}
                    >
                      <span>{item.targetImages > 0 ? `${item.percent}%` : "—"}</span>
                    </span>

                    <span className={styles.homeProgressTypeContent}>
                      <span className={styles.homeProgressTypeTop}>
                        <span>{getTypeLabel(item.type)}</span>
                        <strong>
                          {item.completedJobs} / {item.assignedJobs} travaux
                        </strong>
                      </span>
                      <span className={styles.homeProgressTypeMeta}>
                        {item.targetImages > 0
                          ? `${item.capturedImages} / ${item.targetImages} images`
                          : "Sans objectif"}
                      </span>
                    </span>

                    <span className={styles.posteArrow} aria-hidden="true">
                      chevron_right
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </section>

      {!isLoading && jobs.length > 0 ? (
        <>
          <section className={styles.homeTodayCard} aria-labelledby="home-today-title">
            <div>
              <h3 id="home-today-title" className={styles.homeSectionTitle}>
                Aujourd&apos;hui
              </h3>
              <p>
                {overdueJobsCount} en retard · {todayJobsCount} prévu aujourd&apos;hui
              </p>
            </div>
            <button
              className={styles.homeInlineAction}
              type="button"
              onClick={() => openTravail({ kind: "filter", filter: "active" })}
            >
              Voir
              <span className={styles.posteArrow} aria-hidden="true">
                chevron_right
              </span>
            </button>
            {pendingSyncImages > 0 ? (
              <span className={styles.homeSyncNote}>{pendingSyncImages} images à synchroniser</span>
            ) : null}
          </section>

          <section className={styles.homeActiveWorkSection} aria-labelledby="home-active-title" data-section="travaux-actifs">
            <div className={styles.homeSectionHeader}>
              <h3 id="home-active-title" className={styles.homeSectionTitle}>
                Travaux actifs
              </h3>
              <button
                className={styles.homeSectionAction}
                type="button"
                onClick={() => openTravail({ kind: "filter", filter: "active" })}
              >
                Voir tout
              </button>
            </div>

            {visibleActiveJobs.length > 0 ? (
              <div className={styles.homeActiveWorkList}>
                {visibleActiveJobs.map((job) => {
                  const dueState = getDueState(job, todayIso);
                  const progressPercent = getClampedPercent(job.capturedImages, job.targetImages);

                  return (
                    <button
                      key={job.id}
                      className={`${styles.posteCard} ${styles.homeActiveJobCard}`}
                      type="button"
                      onClick={() => openTravail({ kind: "detail", jobId: job.id })}
                    >
                      <div className={styles.posteCardTop}>
                        <h4 className={styles.posteFixeCardTitle}>{job.parcelName}</h4>
                        <div className={styles.posteCardTopActions}>
                          <span
                            className={`${styles.posteStatusBadge} ${
                              job.status === "inProgress"
                                ? styles.posteStatusInProgress
                                : styles.posteStatusNotStarted
                            }`}
                          >
                            {job.statusLabel}
                          </span>
                          <span className={styles.posteArrow} aria-hidden="true">
                            chevron_right
                          </span>
                        </div>
                      </div>
                      <p className={styles.posteFixeCardSubtitle}>
                        {getTypeLabel(job.type)} · {job.sectorName}
                      </p>
                      <span className={`${styles.posteFixeDates} ${getDueClass(dueState)}`}>
                        {getDueLabel(job, todayIso)}
                      </span>
                      <p className={styles.posteProgressLabel}>
                        {job.capturedImages} / {job.targetImages} images · {progressPercent}%
                      </p>
                      <span
                        className={styles.homeActiveJobProgress}
                        aria-hidden="true"
                        style={{ "--progress": `${progressPercent}%` } as CSSProperties}
                      />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className={styles.homeActiveEmptyCard}>
                <p>Aucun travail actif.</p>
                <span>Les travaux assignés sont complétés.</span>
              </div>
            )}
          </section>
        </>
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
        <WorkerAppHomeBottomBarScreen />
        <WorkerAppNavigationScreen />
      </div>
    </div>
  );
}
