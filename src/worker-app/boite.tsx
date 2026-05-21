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
  loadNotifications,
  persistNotificationReadState,
  type WorkerNotification,
} from "./boite-data";

export type BoiteFrameView = "data" | "loading" | "empty";
export type BoitePreviewState =
  | "boite-data"
  | "boite-loading"
  | "boite-empty"
  | "boite-all-read"
  | "boite-tab-alertes";

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
  return [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function NotificationRow({
  notification,
  onTap,
}: {
  notification: WorkerNotification;
  onTap: () => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.boiteNotificationRow} ${
        notification.read ? styles.boiteNotificationRowRead : ""
      }`}
      onClick={onTap}
    >
      <div className={styles.boiteUnreadIndicator}>
        {!notification.read ? <span className={styles.boiteUnreadDot} aria-hidden="true" /> : null}
      </div>
      <div className={styles.boiteNotificationIconWrap}>
        <span className={styles.googleSymbol}>{getNotificationIcon(notification.kind)}</span>
      </div>
      <div className={styles.boiteNotificationBody}>
        <p className={styles.boiteNotificationTitle}>{notification.headline}</p>
        <p className={styles.boiteNotificationSubtitle}>{formatNotificationMeta(notification.metaParts)}</p>
      </div>
      <div className={styles.boiteNotificationMeta}>
        <span className={styles.boiteNotificationTimestamp}>
          {formatNotificationTimestamp(notification.createdAt)}
        </span>
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

  const syncState = syncStates[syncStateIndex];
  const resolvedFrameTheme = frameTheme ?? theme;
  const frameClass =
    resolvedFrameTheme === "light" ? styles.androidCanvasLightFrame : styles.androidCanvas;

  const isLoading = frameView === "loading" || previewState === "boite-loading";
  const isEmpty = frameView === "empty" || previewState === "boite-empty";
  const forceAllRead = previewState === "boite-all-read";

  const displayNotifications = useMemo(() => {
    if (isEmpty) return [];
    const visibleNotifications = forceAllRead
      ? notifications.map((notification) => ({ ...notification, read: true }))
      : notifications;
    return sortNotifications(visibleNotifications).filter((n) => n.kind !== "alert.operational");
  }, [forceAllRead, isEmpty, notifications]);

  const unreadCount = displayNotifications.filter((n) => !n.read).length;

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
              {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}` : "Tout est lu"}
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
            <span className={styles.googleSymbol}>inbox</span>
          </div>
          <h3>Aucune notification</h3>
          <p>Les nouvelles informations apparaîtront ici.</p>
        </div>
      ) : (
        <div className={styles.boiteNotificationList}>
          {displayNotifications.map((notif) => (
            <NotificationRow
              key={notif.id}
              notification={notif}
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
