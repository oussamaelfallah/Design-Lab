"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
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
  type TravailJob,
  type TravailJobType,
} from "./travail-data";

export type HomeFrameView = "data" | "loading" | "empty" | "error";
export type HomePreviewState =
  | "home-data"
  | "home-loading"
  | "home-empty"
  | "home-offline"
  | "home-syncing"
  | "home-error"
  | "home-all-complete"
  | "home-travaux-actifs-overdue"
  | "home-travaux-actifs-en-cours"
  | "home-travaux-actifs-planifie"
  | "home-travaux-actifs-empty";

export type HomeComponentPreviewKind =
  | "today-active"
  | "today-syncing"
  | "today-offline"
  | "today-success"
  | "today-empty"
  | "progress-in-progress"
  | "progress-complete"
  | "progress-not-started"
  | "types-in-progress"
  | "types-complete"
  | "active-overdue"
  | "active-in-progress"
  | "active-planned"
  | "active-empty";

export type HomeTravailNavigationTarget =
  | { kind: "filter"; filter: "active" | "completed" | "estimation" | "calibre" }
  | { kind: "detail"; jobId: string };

export type HomeTravailNavigationHandler = (
  target: HomeTravailNavigationTarget
) => boolean | void;

type WorkerAppHomePageProps = {
  showDeviceFrame: boolean;
  theme: "dark" | "light";
  frameTheme?: "dark" | "light";
  embedded?: boolean;
  frameView?: HomeFrameView;
  previewState?: HomePreviewState;
  isInteractive?: boolean;
  onOpenTravail?: HomeTravailNavigationHandler;
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
        dueDate: addDays(todayIso, 4 + i),
        status: "inProgress" as const,
        statusLabel: "En cours",
      }));
    }
    if (previewState === "home-travaux-actifs-planifie") {
      return baseJobs.map((job, i) => ({
        ...job,
        capturedImages: 0,
        syncedImages: 0,
        targetImages: 150,
        remainingImages: 150,
        progressRatio: 0,
        dueDate: addDays(todayIso, 4 + i),
        status: "notStarted" as const,
        statusLabel: "Planifié",
      }));
    }
    return baseJobs;
  }, [baseJobs, frameView, previewState, todayIso]);
  const isLoading = frameView === "loading" || previewState === "home-loading";
  const isPageError = frameView === "error";
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
  const todayStatus =
    jobs.length === 0
      ? "empty"
      : isAllComplete
        ? "complete"
        : previewState === "home-syncing"
          ? "syncing"
          : previewState === "home-error"
            ? "error"
            : isOffline
              ? "offline"
              : "mixed";
  const syncImageCount = pendingSyncImages > 0 ? pendingSyncImages : 183;
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

      {isPageError ? (
        <section className={styles.homePageErrorWorkspace} aria-labelledby="home-page-error-title">
          <span className={styles.homePageErrorIcon} aria-hidden="true">
            cloud_off
          </span>
          <h3 id="home-page-error-title">Impossible de charger les données</h3>
          <p>Veuillez vérifier votre connexion internet et réessayer.</p>
          <button className={styles.homePageErrorButton} type="button">
            <span className={styles.googleSymbol} aria-hidden="true">
              refresh
            </span>
            <span>Réessayer</span>
          </button>
        </section>
      ) : isLoading ? (
        <section
          className={`${styles.homeTodayCard} ${styles.homeTodayCardSkeleton}`}
          aria-label="Chargement du résumé du jour"
        >
          <div className={styles.homeSkeletonBlock}>
            <span className={styles.homeProgressSkeletonTitle} />
            <span className={styles.homeProgressSkeletonStat} />
          </div>
          <span className={styles.homeProgressSkeletonRow} />
        </section>
      ) : (
        <section className={styles.homeTodayCard} aria-labelledby="home-today-title">
          <div>
            <h3 id="home-today-title" className={styles.homeSectionTitle}>
              Aujourd&apos;hui
            </h3>
            {todayStatus === "empty" ? (
              <p>Aucun travail prévu aujourd&apos;hui</p>
            ) : todayStatus === "complete" ? (
              <p className={styles.homeTodaySuccessLine}>
                <span className={styles.homeTodayInlineIcon} aria-hidden="true">
                  check_circle
                </span>
                <span>Tous les travaux sont terminés</span>
              </p>
            ) : (
              <p>
                <span className={overdueJobsCount > 0 ? styles.homeTodayOverdue : undefined}>
                  {overdueJobsCount} en retard
                </span>
                <span> • {todayJobsCount} prévu aujourd&apos;hui</span>
              </p>
            )}
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
          {todayStatus === "mixed" ? (
            <span className={`${styles.homeSyncNote} ${styles.homeSyncNoteWarning}`}>
              <span className={styles.homeSyncNoteIcon} aria-hidden="true">
                cloud_upload
              </span>
              <span>{syncImageCount} images à synchroniser</span>
            </span>
          ) : todayStatus === "complete" ? (
            <span className={`${styles.homeSyncNote} ${styles.homeSyncNoteSuccess}`}>
              <span className={styles.homeSyncNoteIcon} aria-hidden="true">
                cloud_done
              </span>
              <span>Données synchronisées</span>
            </span>
          ) : todayStatus === "syncing" ? (
            <span className={`${styles.homeSyncNote} ${styles.homeSyncNoteSyncing}`}>
              <span
                className={`${styles.homeSyncNoteIcon} ${styles.homeSyncNoteIconSpinning}`}
                aria-hidden="true"
              >
                sync
              </span>
              <span>Synchronisation de {syncImageCount} images en cours...</span>
            </span>
          ) : todayStatus === "offline" ? (
            <span className={`${styles.homeSyncNote} ${styles.homeSyncNoteOffline}`}>
              <span className={styles.homeSyncNoteIcon} aria-hidden="true">
                cloud_off
              </span>
              <span>Mode hors ligne • {syncImageCount} images en attente</span>
            </span>
          ) : todayStatus === "error" ? (
            <span className={`${styles.homeSyncNote} ${styles.homeSyncNoteError}`}>
              <span className={styles.homeSyncNoteIcon} aria-hidden="true">
                sync_problem
              </span>
              <span>Échec de synchronisation • Réessayer</span>
            </span>
          ) : todayStatus === "empty" ? (
            <span className={`${styles.homeSyncNote} ${styles.homeSyncNoteNeutral}`}>
              <span>Profitez de votre journée !</span>
            </span>
          ) : null}
        </section>
      )}

      {isPageError ? null : (
        <section className={styles.homeProgressSection} aria-labelledby="home-progress-title">
          <h3 id="home-progress-title" className={styles.homeProgressOverviewTitle}>
            Progression du travail
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
                      ? `${Math.max(totalProgress.targetImages - totalProgress.capturedImages, 0)} images restantes`
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
                  <span className={styles.homeProgressHeroHelper}>
                    <span aria-hidden="true">•</span>
                    <span>Avancement global des captures</span>
                  </span>
                </button>
              </>
            )}
          </div>

          {isLoading ? (
            <>
              <div className={styles.homeProgressStatsGrid}>
                {[0, 1].map((item) => (
                  <span className={styles.homeProgressStatSkeleton} key={item}>
                    <span className={styles.homeProgressStatSkeletonIcon} />
                    <span className={styles.homeProgressStatSkeletonContent}>
                      <span />
                      <span />
                    </span>
                  </span>
                ))}
              </div>

              <div className={styles.homeProgressSkeletonTitle} />

              <div className={styles.homeProgressTypeCard}>
                <div className={styles.homeProgressTypeRows}>
                  {[0, 1].map((item) => (
                    <span className={styles.homeProgressTypeSkeletonRow} key={item}>
                      <span className={styles.homeProgressTypeSkeletonRing} />
                      <span className={styles.homeProgressTypeSkeletonContent}>
                        <span className={styles.homeProgressTypeSkeletonLineStrong} />
                        <span className={styles.homeProgressTypeSkeletonLine} />
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : jobs.length > 0 ? (
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
                      {completedJobs} / {jobs.length} travaux
                    </strong>
                  </div>
                  <span className={styles.homeProgressStatCardMeta}>
                    {jobs.length > 0 ? Math.round((completedJobs / jobs.length) * 100) : 0}% du total
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
                    <span>Travaux restants</span>
                  </div>
                  <div className={styles.homeProgressStatCardValue}>
                    <strong>{jobs.length - completedJobs} travaux</strong>
                  </div>
                  <span className={styles.homeProgressStatCardMeta}>À compléter</span>
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
                      aria-label={`Voir les travaux ${getTypeLabel(item.type)}`}
                    >
                      <span
                        className={styles.homeProgressMiniRing}
                        aria-hidden="true"
                        style={{ "--progress-deg": `${item.percent * 3.6}deg` } as CSSProperties}
                      >
                        <span>{item.targetImages > 0 ? `${item.percent}% images` : "—"}</span>
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
                            ? `${item.capturedImages} / ${item.targetImages} images réalisées`
                            : "Sans objectif"}
                        </span>
                        {item.targetImages > 0 ? (
                          <span className={styles.homeProgressTypeRemaining}>
                            {Math.max(item.targetImages - item.capturedImages, 0)} images restantes
                          </span>
                        ) : null}
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
      )}

      {isPageError ? null : isLoading ? (
        <section className={styles.homeActiveWorkSection} aria-label="Chargement des travaux actifs">
          <div className={styles.homeSectionHeader}>
            <span className={styles.homeProgressSkeletonTitle} />
          </div>
          <div className={styles.homeActiveWorkList}>
            {[0, 1, 2].map((item) => (
              <span className={styles.homeActiveJobSkeletonCard} key={item}>
                <span className={styles.homeActiveJobSkeletonTitle} />
                <span className={styles.homeActiveJobSkeletonSubtitle} />
                <span className={styles.homeActiveJobSkeletonMetaRow}>
                  <span />
                  <span />
                </span>
                <span className={styles.homeActiveJobSkeletonProgress} />
              </span>
            ))}
          </div>
        </section>
      ) : jobs.length > 0 ? (
        <>
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
                  const progressPercent = getClampedPercent(job.capturedImages, job.targetImages);
                  const dueTime = parseIsoDateToTime(job.dueDate);
                  const todayTime = parseIsoDateToTime(todayIso);
                  const daysUntilDue = Math.ceil((dueTime - todayTime) / 86400000);
                  const isOverdue = job.status !== "done" && daysUntilDue < 0;
                  const isDueSoon = job.status !== "done" && daysUntilDue >= 0 && daysUntilDue <= 3;
                  const dueBadgeLabel = isOverdue
                    ? `${Math.abs(daysUntilDue)} j retard`
                    : `dans ${Math.max(daysUntilDue, 0)} j`;
                  const remainingCaptures = Math.max(job.targetImages - job.capturedImages, 0);

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
                      <div className={styles.homeActiveJobInfoRow}>
                        <div className={styles.homeActiveJobInfoMain}>
                          <strong
                            className={
                              isOverdue
                                ? styles.homeActiveJobDeadlineOverdue
                                : styles.homeActiveJobDeadline
                            }
                          >
                            Fin {formatShortDateFr(job.dueDate).toLowerCase()}
                          </strong>
                          <span
                            className={`${styles.homeActiveJobDueBadge} ${
                              isOverdue
                                ? styles.homeActiveJobDueBadgeUrgent
                                : isDueSoon
                                  ? styles.homeActiveJobDueBadgeSoon
                                  : styles.homeActiveJobDueBadgeNeutral
                            }`}
                          >
                            {dueBadgeLabel}
                          </span>
                        </div>
                      </div>
                      <div className={styles.homeActiveJobProgressHeader}>
                        <span className={styles.homeActiveJobProgressCount}>
                          <strong>
                            {job.capturedImages} / {job.targetImages}
                          </strong>{" "}
                          captures
                        </span>
                        <span className={styles.homeActiveJobProgressMeta}>
                          <span>• {progressPercent}%</span>
                          <strong>{remainingCaptures} à capturer</strong>
                        </span>
                      </div>
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
                <span className={styles.homeActiveEmptyIcon} aria-hidden="true">
                  task_alt
                </span>
                <p>Aucun travail actif en cours.</p>
                <span>Vos travaux à venir apparaîtront ici le jour de leur début.</span>
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

type WorkerAppHomeComponentPreviewProps = {
  kind: HomeComponentPreviewKind;
};

const componentTypeRows = {
  "types-in-progress": [
    {
      label: "Estimation",
      completedJobs: "2 / 4 travaux",
      images: "94 / 180 images réalisées",
      remaining: "86 images restantes",
      percent: 52,
    },
    {
      label: "Calibre",
      completedJobs: "1 / 2 travaux",
      images: "89 / 168 images réalisées",
      remaining: "79 images restantes",
      percent: 53,
    },
  ],
  "types-complete": [
    {
      label: "Estimation",
      completedJobs: "4 / 4 travaux",
      images: "180 / 180 images réalisées",
      remaining: "0 image restante",
      percent: 100,
    },
    {
      label: "Calibre",
      completedJobs: "2 / 2 travaux",
      images: "168 / 168 images réalisées",
      remaining: "0 image restante",
      percent: 100,
    },
  ],
} as const;

function HomeComponentShell({ children }: { children: ReactNode }) {
  return (
    <div className={`${styles.androidScreen} ${styles.androidScreenLight} ${styles.homeComponentPreview}`}>
      {children}
    </div>
  );
}

function HomeProgressComponentPreview({
  percent,
  captured,
  target,
}: {
  percent: number;
  captured: number;
  target: number;
}) {
  const remaining = Math.max(target - captured, 0);

  return (
    <section className={styles.homeProgressSection} aria-labelledby={`home-progress-${percent}`}>
      <h3 id={`home-progress-${percent}`} className={styles.homeProgressOverviewTitle}>
        Progression du travail
      </h3>
      <div className={styles.homeProgressOverviewCard}>
        <div className={styles.homeProgressCapturesHeader}>
          <span className={styles.homeProgressCapturesIconWrap} aria-hidden="true">
            <span>image</span>
          </span>
          <span className={styles.homeProgressCapturesLabel}>Captures</span>
          <span className={styles.homeProgressRemainingPill}>{remaining} images restantes</span>
        </div>
        <button className={styles.homeProgressGlobalHero} type="button">
          <strong className={styles.homeProgressHeroPercent}>{percent}%</strong>
          <span className={styles.homeProgressHeroFraction}>
            {captured} / {target} images réalisées
          </span>
          <span
            className={styles.homeProgressMainBar}
            aria-hidden="true"
            style={{ "--progress": `${percent}%` } as CSSProperties}
          />
          <span className={styles.homeProgressHeroHelper}>
            <span aria-hidden="true">•</span>
            <span>Avancement global des captures</span>
          </span>
        </button>
      </div>
    </section>
  );
}

function HomeTypeRowsComponentPreview({ kind }: { kind: "types-in-progress" | "types-complete" }) {
  return (
    <section className={styles.homeProgressSection} aria-label="Types de travaux">
      <div className={styles.homeProgressBreakdownLabel}>Types de travaux</div>
      <div className={styles.homeProgressTypeCard}>
        <div className={styles.homeProgressTypeRows}>
          {componentTypeRows[kind].map((item) => (
            <button className={styles.homeProgressTypeRow} type="button" key={item.label}>
              <span
                className={styles.homeProgressMiniRing}
                aria-hidden="true"
                style={{ "--progress-deg": `${item.percent * 3.6}deg` } as CSSProperties}
              >
                <span>{item.percent}% images</span>
              </span>
              <span className={styles.homeProgressTypeContent}>
                <span className={styles.homeProgressTypeTop}>
                  <span>{item.label}</span>
                  <strong>{item.completedJobs}</strong>
                </span>
                <span className={styles.homeProgressTypeMeta}>{item.images}</span>
                <span className={styles.homeProgressTypeRemaining}>{item.remaining}</span>
              </span>
              <span className={styles.posteArrow} aria-hidden="true">
                chevron_right
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function HomeActiveWorkComponentPreview({ kind }: { kind: HomeComponentPreviewKind }) {
  if (kind === "active-empty") {
    return (
      <section className={styles.homeActiveWorkSection} aria-labelledby="home-active-empty">
        <div className={styles.homeSectionHeader}>
          <h3 id="home-active-empty" className={styles.homeSectionTitle}>
            Travaux actifs
          </h3>
        </div>
        <div className={styles.homeActiveEmptyCard}>
          <span className={styles.homeActiveEmptyIcon} aria-hidden="true">
            task_alt
          </span>
          <p>Aucun travail actif en cours.</p>
          <span>Vos travaux à venir apparaîtront ici le jour de leur début.</span>
        </div>
      </section>
    );
  }

  const variants = {
    "active-overdue": {
      title: "Parcelle Nord 12",
      subtitle: "Estimation · Secteur S1",
      status: "En retard",
      statusClass: styles.posteStatusNotStarted,
      dateClass: styles.homeActiveJobDeadlineOverdue,
      date: "Fin 14 mai",
      badge: "5 j retard",
      badgeClass: styles.homeActiveJobDueBadgeUrgent,
      captures: "72 / 140",
      percent: 51,
      remaining: 68,
    },
    "active-in-progress": {
      title: "Parcelle Est 04",
      subtitle: "Calibre · Secteur S2",
      status: "En cours",
      statusClass: styles.posteStatusInProgress,
      dateClass: styles.homeActiveJobDeadline,
      date: "Fin 24 mai",
      badge: "dans 4 j",
      badgeClass: styles.homeActiveJobDueBadgeNeutral,
      captures: "83 / 156",
      percent: 53,
      remaining: 73,
    },
    "active-planned": {
      title: "Parcelle Sud 08",
      subtitle: "Estimation · Secteur S3",
      status: "Planifié",
      statusClass: styles.posteStatusNotStarted,
      dateClass: styles.homeActiveJobDeadline,
      date: "Fin 28 mai",
      badge: "dans 8 j",
      badgeClass: styles.homeActiveJobDueBadgeNeutral,
      captures: "0 / 150",
      percent: 0,
      remaining: 150,
    },
  } as const;
  const item = variants[kind as keyof typeof variants];

  return (
    <section className={styles.homeActiveWorkSection} aria-labelledby={`home-active-${kind}`}>
      <div className={styles.homeSectionHeader}>
        <h3 id={`home-active-${kind}`} className={styles.homeSectionTitle}>
          Travaux actifs
        </h3>
      </div>
      <div className={styles.homeActiveWorkList}>
        <button className={`${styles.posteCard} ${styles.homeActiveJobCard}`} type="button">
          <div className={styles.posteCardTop}>
            <h4 className={styles.posteFixeCardTitle}>{item.title}</h4>
            <div className={styles.posteCardTopActions}>
              <span className={`${styles.posteStatusBadge} ${item.statusClass}`}>{item.status}</span>
              <span className={styles.posteArrow} aria-hidden="true">
                chevron_right
              </span>
            </div>
          </div>
          <p className={styles.posteFixeCardSubtitle}>{item.subtitle}</p>
          <div className={styles.homeActiveJobInfoRow}>
            <div className={styles.homeActiveJobInfoMain}>
              <strong className={item.dateClass}>{item.date}</strong>
              <span className={`${styles.homeActiveJobDueBadge} ${item.badgeClass}`}>
                {item.badge}
              </span>
            </div>
          </div>
          <div className={styles.homeActiveJobProgressHeader}>
            <span className={styles.homeActiveJobProgressCount}>
              <strong>{item.captures}</strong> captures
            </span>
            <span className={styles.homeActiveJobProgressMeta}>
              <span>• {item.percent}%</span>
              <strong>{item.remaining} à capturer</strong>
            </span>
          </div>
          <span
            className={styles.homeActiveJobProgress}
            aria-hidden="true"
            style={{ "--progress": `${item.percent}%` } as CSSProperties}
          />
        </button>
      </div>
    </section>
  );
}

export function WorkerAppHomeComponentPreview({ kind }: WorkerAppHomeComponentPreviewProps) {
  if (kind.startsWith("progress-")) {
    const progress =
      kind === "progress-complete"
        ? { percent: 100, captured: 348, target: 348 }
        : kind === "progress-not-started"
          ? { percent: 0, captured: 0, target: 348 }
          : { percent: 52, captured: 183, target: 348 };

    return (
      <HomeComponentShell>
        <HomeProgressComponentPreview {...progress} />
      </HomeComponentShell>
    );
  }

  if (kind === "types-in-progress" || kind === "types-complete") {
    return (
      <HomeComponentShell>
        <HomeTypeRowsComponentPreview kind={kind} />
      </HomeComponentShell>
    );
  }

  if (kind.startsWith("active-")) {
    return (
      <HomeComponentShell>
        <HomeActiveWorkComponentPreview kind={kind} />
      </HomeComponentShell>
    );
  }

  const todayVariants = {
    "today-active": {
      line: (
        <>
          <span className={styles.homeTodayOverdue}>5 en retard</span>
          <span> • 1 prévu aujourd&apos;hui</span>
        </>
      ),
      noteClass: styles.homeSyncNoteWarning,
      icon: "cloud_upload",
      note: "183 images à synchroniser",
    },
    "today-syncing": {
      line: (
        <>
          <span className={styles.homeTodayOverdue}>5 en retard</span>
          <span> • 1 prévu</span>
        </>
      ),
      noteClass: styles.homeSyncNoteSyncing,
      icon: "sync",
      note: "Synchronisation de 183 images en cours...",
      spinning: true,
    },
    "today-offline": {
      line: (
        <>
          <span className={styles.homeTodayOverdue}>5 en retard</span>
          <span> • 1 prévu</span>
        </>
      ),
      noteClass: styles.homeSyncNoteOffline,
      icon: "cloud_off",
      note: "Mode hors ligne • 183 images en attente",
    },
    "today-success": {
      line: (
        <span className={styles.homeTodaySuccessLine}>
          <span className={styles.homeTodayInlineIcon} aria-hidden="true">
            check_circle
          </span>
          <span>Tous les travaux sont terminés</span>
        </span>
      ),
      noteClass: styles.homeSyncNoteSuccess,
      icon: "cloud_done",
      note: "Données synchronisées",
    },
    "today-empty": {
      line: <span>Aucun travail prévu aujourd&apos;hui</span>,
      noteClass: styles.homeSyncNoteNeutral,
      icon: "",
      note: "Profitez de votre journée !",
    },
  } as const;
  const item = todayVariants[kind as keyof typeof todayVariants];

  return (
    <HomeComponentShell>
      <section className={styles.homeTodayCard} aria-labelledby={`home-today-${kind}`}>
        <div>
          <h3 id={`home-today-${kind}`} className={styles.homeSectionTitle}>
            Aujourd&apos;hui
          </h3>
          <p>{item.line}</p>
        </div>
        <button className={styles.homeInlineAction} type="button">
          Voir
          <span className={styles.posteArrow} aria-hidden="true">
            chevron_right
          </span>
        </button>
        <span className={`${styles.homeSyncNote} ${item.noteClass}`}>
          {item.icon ? (
            <span
              className={`${styles.homeSyncNoteIcon} ${
                "spinning" in item && item.spinning ? styles.homeSyncNoteIconSpinning : ""
              }`}
              aria-hidden="true"
            >
              {item.icon}
            </span>
          ) : null}
          <span>{item.note}</span>
        </span>
      </section>
    </HomeComponentShell>
  );
}
