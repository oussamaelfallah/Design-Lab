"use client";

import { useCallback, useMemo, useState } from "react";
import styles from "./worker-app.module.css";
import type { HomeTravailNavigationHandler } from "./home";
import { WorkerAppHomeBottomBarScreen } from "./screens/home-bottom-bar-screen";
import { WorkerAppNavigationScreen } from "./screens/navigation-screen";
import { WorkerAppStatusBar } from "./screens/status-bar";
import {
  formatNotificationMeta,
  formatNotificationTimestamp,
  getNotificationIcon,
  getNotificationTab,
  loadNotifications,
  persistNotificationReadState,
  type BoiteTab,
  type WorkerNotification,
} from "./boite-data";

export type BoiteFrameView = "data" | "loading" | "empty";
export type BoitePreviewState =
  | "boite-data"
  | "boite-loading"
  | "boite-empty"
  | "boite-all-read"
  | "boite-tab-alertes"
  | "boite-offline"
  | "boite-sync-failed"
  | "boite-missions-empty"
  | "boite-alertes-empty";

const syncStates = [
  { label: "Cloud Alert", icon: "cloud_alert" },
  { label: "Cloud Done", icon: "cloud_done" },
  { label: "Cloud Sync", icon: "cloud_sync" },
] as const;

type WorkerAppBoitePageProps = {
  showDeviceFrame: boolean;
  theme: "dark" | "light";
  frameTheme?: "dark" | "light";
  embedded?: boolean;
  frameView?: BoiteFrameView;
  previewState?: BoitePreviewState;
  isInteractive?: boolean;
  onOpenTravail?: HomeTravailNavigationHandler;
  onOpenProfile?: () => void;
};

function sortNotifications(notifications: WorkerNotification[]): WorkerNotification[] {
  return [...notifications].sort((a, b) => {
    const aPriority = a.priority === "high" ? 0 : 1;
    const bPriority = b.priority === "high" ? 0 : 1;
    if (a.read !== b.read) return a.read ? 1 : -1;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function getTabCopy(tab: BoiteTab) {
  if (tab === "alertes") {
    return {
      eyebrow: "À sécuriser",
      title: "Alertes opérationnelles",
      description: "Problèmes qui peuvent bloquer le travail ou la synchronisation.",
      emptyTitle: "Aucune alerte",
      emptyText: "Les problèmes de synchronisation ou d’exécution apparaîtront ici.",
      icon: "verified",
    };
  }

  return {
    eyebrow: "À vérifier",
    title: "Mises à jour missions",
    description: "Changements envoyés par l’équipe pour vos missions assignées.",
    emptyTitle: "Aucune mise à jour mission",
    emptyText: "Les changements liés à vos missions apparaîtront ici.",
    icon: "assignment_turned_in",
  };
}

function getNotificationActionLabel(notification: WorkerNotification): string {
  if (notification.jobId) return "Ouvrir";
  if (getNotificationTab(notification.kind) === "alertes") return "Voir";
  return "Consulter";
}

function NotificationRow({
  notification,
  isExpanded,
  onTap,
}: {
  notification: WorkerNotification;
  isExpanded: boolean;
  onTap: () => void;
}) {
  const isHighPriority = notification.priority === "high";
  const isAlert = getNotificationTab(notification.kind) === "alertes";

  return (
    <button
      type="button"
      className={`${styles.boiteUpdateCard} ${isHighPriority ? styles.boiteUpdateCardHigh : ""} ${
        notification.read ? styles.boiteNotificationRowRead : ""
      }`}
      onClick={onTap}
    >
      <div className={styles.boiteUpdateCardIconWrap}>
        <span className={styles.googleSymbol} aria-hidden="true">
          {getNotificationIcon(notification.kind)}
        </span>
      </div>
      <div className={styles.boiteUpdateCardBody}>
        <div className={styles.boiteUpdateMetaLine}>
          <span className={styles.boiteUpdateMetaLabel}>
            {isHighPriority ? "Prioritaire" : "Info"}
          </span>
          <span className={styles.boiteUpdateMetaDot} aria-hidden="true" />
          <span>{formatNotificationTimestamp(notification.createdAt)}</span>
        </div>
        <p className={styles.boiteUpdateTitle}>{notification.headline}</p>
        <p className={styles.boiteUpdateSubtitle}>{formatNotificationMeta(notification.metaParts)}</p>
        {isAlert && isExpanded && notification.expandedBody ? (
          <p className={styles.boiteUpdateDetail}>{notification.expandedBody}</p>
        ) : null}
      </div>
      <div className={styles.boiteUpdateCardSide}>
        {!notification.read ? <span className={styles.boiteUnreadDot} aria-label="Non lu" /> : null}
        <span className={styles.boiteUpdateAction}>{getNotificationActionLabel(notification)}</span>
      </div>
    </button>
  );
}

export function WorkerAppBoitePage({
  showDeviceFrame,
  theme,
  frameTheme,
  embedded = false,
  frameView = "data",
  previewState = "boite-data",
  isInteractive = true,
  onOpenTravail,
  onOpenProfile,
}: WorkerAppBoitePageProps) {
  const [syncStateIndex, setSyncStateIndex] = useState(2);
  const [notifications, setNotifications] = useState<WorkerNotification[]>(() => loadNotifications());
  const [activeTab, setActiveTab] = useState<BoiteTab>(
    previewState === "boite-tab-alertes" ? "alertes" : "missions"
  );
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(
    previewState === "boite-tab-alertes" ? "notif-3" : null
  );

  const isOffline = previewState === "boite-offline";
  const isSyncFailed = previewState === "boite-sync-failed";
  const syncState = isOffline
    ? { label: "Hors ligne", icon: "wifi_off" }
    : isSyncFailed
      ? { label: "Échec de synchronisation", icon: "cloud_alert" }
      : syncStates[syncStateIndex];
  const resolvedFrameTheme = frameTheme ?? theme;
  const frameClass =
    resolvedFrameTheme === "light" ? styles.androidCanvasLightFrame : styles.androidCanvas;

  const isLoading = frameView === "loading" || previewState === "boite-loading";
  const isEmpty = frameView === "empty" || previewState === "boite-empty";
  const forceAllRead = previewState === "boite-all-read";
  const resolvedActiveTab =
    previewState === "boite-tab-alertes" ||
    previewState === "boite-sync-failed" ||
    previewState === "boite-alertes-empty"
      ? "alertes"
      : activeTab;

  const visibleNotifications = useMemo(() => {
    if (isEmpty) return [];
    const baseNotifications = forceAllRead
      ? notifications.map((notification) => ({ ...notification, read: true }))
      : notifications;

    if (previewState === "boite-missions-empty") {
      return baseNotifications.filter((notification) => getNotificationTab(notification.kind) !== "missions");
    }

    if (previewState === "boite-alertes-empty") {
      return baseNotifications.filter((notification) => getNotificationTab(notification.kind) !== "alertes");
    }

    if (previewState === "boite-sync-failed") {
      return baseNotifications.filter((notification) => notification.kind === "alert.sync_failed");
    }

    return baseNotifications;
  }, [forceAllRead, isEmpty, notifications, previewState]);

  const tabCounts = useMemo(
    () => ({
      missions: visibleNotifications.filter((n) => getNotificationTab(n.kind) === "missions" && !n.read).length,
      alertes: visibleNotifications.filter((n) => getNotificationTab(n.kind) === "alertes" && !n.read).length,
    }),
    [visibleNotifications]
  );

  const displayNotifications = useMemo(
    () =>
      sortNotifications(
        visibleNotifications.filter((notification) => getNotificationTab(notification.kind) === resolvedActiveTab)
      ),
    [resolvedActiveTab, visibleNotifications]
  );

  const totalUnreadCount = visibleNotifications.filter((n) => !n.read).length;
  const highPriorityCount = visibleNotifications.filter((n) => n.priority === "high" && !n.read).length;
  const activeTabCopy = getTabCopy(resolvedActiveTab);
  const topNotification = displayNotifications[0];

  const updateNotifications = useCallback(
    (updater: (current: WorkerNotification[]) => WorkerNotification[]) => {
      setNotifications((current) => {
        const next = updater(current);
        persistNotificationReadState(next);
        return next;
      });
    },
    []
  );

  const markAsRead = useCallback(
    (notificationId: string) => {
      updateNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId ? { ...notification, read: true } : notification
        )
      );
    },
    [updateNotifications]
  );

  const handleNotificationTap = useCallback(
    (notification: WorkerNotification) => {
      if (!isInteractive) return;

      if (notification.jobId && onOpenTravail) {
        const opened = onOpenTravail({ kind: "detail", jobId: notification.jobId });
        if (opened !== false) {
          markAsRead(notification.id);
        }
        return;
      }

      if (getNotificationTab(notification.kind) === "alertes") {
        setExpandedAlertId((current) => (current === notification.id ? null : notification.id));
        markAsRead(notification.id);
      }
    },
    [isInteractive, markAsRead, onOpenTravail]
  );

  const content = (
    <div
      className={`${styles.secteursContent} ${styles.boiteContent}`}
      style={!isInteractive ? { pointerEvents: "none" } : undefined}
    >
      <div className={styles.posteStickyTop}>
        <div className={styles.homeHeaderRow}>
          <div className={styles.boiteHeader}>
            <h2 className={styles.boiteTitle}>Boîte</h2>
            <p className={styles.boiteSubStatus}>
              {totalUnreadCount > 0
                ? `${totalUnreadCount} mise${totalUnreadCount > 1 ? "s" : ""} à jour à vérifier`
                : "Opérations à jour"}
            </p>
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
        <section className={styles.boiteBriefingCard} aria-label="Résumé opérationnel">
          <div className={styles.boiteBriefingTop}>
            <span className={styles.boiteBriefingEyebrow}>{activeTabCopy.eyebrow}</span>
            <span className={styles.boiteBriefingCount}>
              {resolvedActiveTab === "missions" ? tabCounts.missions : tabCounts.alertes}
            </span>
          </div>
          <h3>{activeTabCopy.title}</h3>
          <p>{topNotification ? topNotification.headline : activeTabCopy.description}</p>
          <div className={styles.boiteBriefingStats}>
            <span>{highPriorityCount} prioritaires</span>
            <span>{totalUnreadCount} non lus</span>
          </div>
        </section>
        {isOffline || isSyncFailed ? (
          <div className={`${styles.boiteStatusBanner} ${isSyncFailed ? styles.boiteStatusBannerError : ""}`}>
            <span className={styles.googleSymbol} aria-hidden="true">
              {isSyncFailed ? "cloud_alert" : "wifi_off"}
            </span>
            <span>
              {isSyncFailed
                ? "Synchronisation bloquée. Vérifiez les alertes opérationnelles."
                : "Mode hors ligne. Les dernières mises à jour peuvent être incomplètes."}
            </span>
          </div>
        ) : null}
        <div className={styles.boiteTabs} role="tablist" aria-label="Boîte sections">
          {[
            { id: "missions" as BoiteTab, label: "Missions", count: tabCounts.missions, icon: "assignment" },
            { id: "alertes" as BoiteTab, label: "Alertes", count: tabCounts.alertes, icon: "warning" },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`${styles.boiteTab} ${
                resolvedActiveTab === tab.id ? styles.boiteTabActive : ""
              }`}
              type="button"
              role="tab"
              aria-selected={resolvedActiveTab === tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === "missions") setExpandedAlertId(null);
              }}
            >
              <span className={styles.googleSymbol} aria-hidden="true">
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {tab.count > 0 ? <span className={styles.boiteTabCount}>{tab.count}</span> : null}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className={styles.boiteSkeletonCard} aria-busy="true" aria-label="Chargement">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className={styles.boiteSkeletonRow} key={index}>
              <div className={styles.boiteSkeletonDot} />
              <div className={styles.boiteSkeletonIcon} />
              <div className={styles.boiteSkeletonText}>
                <div className={styles.boiteSkeletonTitleLine} />
                <div className={styles.boiteSkeletonSubtitleLine} />
              </div>
              <div className={styles.boiteSkeletonTimeLine} />
            </div>
          ))}
        </div>
      ) : isEmpty || displayNotifications.length === 0 ? (
        <div className={styles.boiteEmptyState}>
          <div className={styles.boiteEmptyIconWrap}>
            <span className={styles.googleSymbol}>
              {activeTabCopy.icon}
            </span>
          </div>
          <h3>{activeTabCopy.emptyTitle}</h3>
          <p>{activeTabCopy.emptyText}</p>
        </div>
      ) : (
        <div className={styles.boiteUpdateList}>
          {displayNotifications.map((notif) => (
            <NotificationRow
              key={notif.id}
              notification={notif}
              isExpanded={expandedAlertId === notif.id}
              onTap={() => handleNotificationTap(notif)}
            />
          ))}
        </div>
      )}
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className={showDeviceFrame ? frameClass : styles.androidCanvasNoFrame}>
      <div
        className={`${styles.androidScreen} ${
          theme === "dark" ? styles.androidScreenDark : styles.androidScreenLight
        }`}
      >
        <WorkerAppStatusBar theme={theme} />
        {content}
        <WorkerAppHomeBottomBarScreen activeIndex={3} />
        <WorkerAppNavigationScreen />
      </div>
    </div>
  );
}
