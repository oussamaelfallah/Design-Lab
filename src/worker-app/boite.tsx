"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./worker-app.module.css";
import type { HomeTravailNavigationTarget } from "./home";
import { WorkerAppHomeBottomBarScreen } from "./screens/home-bottom-bar-screen";
import { WorkerAppNavigationScreen } from "./screens/navigation-screen";
import { WorkerAppStatusBar } from "./screens/status-bar";
import {
  formatNotificationMeta,
  formatNotificationTimestamp,
  getNotificationIcon,
  getNotificationIconTone,
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
  onOpenTravail?: (target: HomeTravailNavigationTarget) => void;
  onOpenProfile?: () => void;
};

function sortNotifications(notifications: WorkerNotification[]): WorkerNotification[] {
  return [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function NotificationCard({
  notification,
  isExpanded,
  onTap,
}: {
  notification: WorkerNotification;
  isExpanded: boolean;
  onTap: () => void;
}) {
  const isMission =
    notification.kind === "mission.created" || notification.kind === "mission.modified";
  const iconTone = getNotificationIconTone(notification.kind);
  const iconWrapClass =
    iconTone === "assignment"
      ? styles.boiteNotificationIconWrapAssignment
      : iconTone === "edit"
        ? styles.boiteNotificationIconWrapEdit
        : styles.boiteNotificationIconWrapWarning;
  const showExpandedBody =
    notification.kind === "alert.operational" && isExpanded && notification.expandedBody;

  return (
    <button
      type="button"
      className={`${styles.boiteNotificationCard} ${
        notification.read ? styles.boiteNotificationCardRead : styles.boiteNotificationCardUnread
      }`}
      onClick={onTap}
    >
      <div className={styles.boiteNotificationLeading}>
        {!notification.read ? <span className={styles.boiteUnreadDot} aria-hidden="true" /> : null}
        <span className={`${styles.boiteNotificationIconWrap} ${iconWrapClass}`} aria-hidden="true">
          <span className={styles.googleSymbol}>{getNotificationIcon(notification.kind)}</span>
        </span>
      </div>

      <div className={styles.boiteNotificationBody}>
        <div className={styles.boiteNotificationTopRow}>
          <p
            className={`${styles.boiteNotificationHeadline} ${
              !notification.read ? styles.boiteNotificationHeadlineUnread : ""
            }`}
          >
            {notification.headline}
          </p>
          <span className={styles.boiteNotificationTimestamp}>
            {formatNotificationTimestamp(notification.createdAt)}
          </span>
        </div>
        <p className={styles.boiteNotificationMeta}>{formatNotificationMeta(notification.metaParts)}</p>
        {showExpandedBody ? (
          <p className={styles.boiteNotificationExpanded}>{notification.expandedBody}</p>
        ) : null}
      </div>

      {isMission ? (
        <span className={styles.boiteNotificationChevron} aria-hidden="true">
          <span className={styles.posteArrow}>chevron_right</span>
        </span>
      ) : null}
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
  const [activeTab, setActiveTab] = useState<BoiteTab>("missions");
  const [notifications, setNotifications] = useState<WorkerNotification[]>([]);
  const [expandedAlertIds, setExpandedAlertIds] = useState<string[]>([]);

  const syncState = syncStates[syncStateIndex];
  const resolvedFrameTheme = frameTheme ?? theme;
  const frameClass =
    resolvedFrameTheme === "light" ? styles.androidCanvasLightFrame : styles.androidCanvas;

  const isLoading = frameView === "loading" || previewState === "boite-loading";
  const isEmpty = frameView === "empty" || previewState === "boite-empty";
  const forceAllRead = previewState === "boite-all-read";
  const forceAlertesTab = previewState === "boite-tab-alertes";

  useEffect(() => {
    const loaded = loadNotifications();
    setNotifications(
      forceAllRead ? loaded.map((notification) => ({ ...notification, read: true })) : loaded
    );
  }, [forceAllRead]);

  useEffect(() => {
    if (forceAlertesTab) {
      setActiveTab("alertes");
    }
  }, [forceAlertesTab]);

  const displayNotifications = useMemo(() => {
    if (isEmpty) return [];
    return sortNotifications(notifications);
  }, [isEmpty, notifications]);

  const missionsNotifications = useMemo(
    () => displayNotifications.filter((n) => getNotificationTab(n.kind) === "missions"),
    [displayNotifications]
  );

  const alertesNotifications = useMemo(
    () => displayNotifications.filter((n) => getNotificationTab(n.kind) === "alertes"),
    [displayNotifications]
  );

  const visibleNotifications = activeTab === "missions" ? missionsNotifications : alertesNotifications;

  const unreadTotal = displayNotifications.filter((notification) => !notification.read).length;
  const missionsUnread = missionsNotifications.filter((notification) => !notification.read).length;
  const alertesUnread = alertesNotifications.filter((notification) => !notification.read).length;
  const tabUnread = activeTab === "missions" ? missionsUnread : alertesUnread;
  const hasUnreadInList = visibleNotifications.some((notification) => !notification.read);

  const updateNotifications = useCallback((updater: (current: WorkerNotification[]) => WorkerNotification[]) => {
    setNotifications((current) => {
      const next = updater(current);
      persistNotificationReadState(next);
      return next;
    });
  }, []);

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

      markAsRead(notification.id);

      if (notification.kind === "alert.operational") {
        setExpandedAlertIds((current) =>
          current.includes(notification.id)
            ? current.filter((id) => id !== notification.id)
            : [...current, notification.id]
        );
        return;
      }

      if (notification.jobId) {
        onOpenTravail?.({ kind: "detail", jobId: notification.jobId });
      }
    },
    [isInteractive, markAsRead, onOpenTravail]
  );

  const content = (
    <>
      <div
        className={`${styles.secteursContent} ${styles.boiteContent}`}
        style={!isInteractive ? { pointerEvents: "none" } : undefined}
      >
        <div className={styles.posteStickyTop}>
          <div className={styles.homeHeaderRow}>
            <div className={styles.posteFixeTitleBlock}>
              <h2 className={styles.posteFixeTitle}>Boîte</h2>
              <p className={styles.posteFixeSubtitle}>
                {unreadTotal > 0
                  ? `${unreadTotal} non lue${unreadTotal > 1 ? "s" : ""}`
                  : "Tout est lu"}
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

          <div className={styles.travailSegmentedTabs} role="tablist" aria-label="Filtres boîte">
            {(
              [
                { key: "missions" as const, label: "Missions", unread: missionsUnread },
                { key: "alertes" as const, label: "Alertes", unread: alertesUnread },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                className={`${styles.travailSegmentedTab} ${
                  activeTab === tab.key ? styles.travailSegmentedTabActive : ""
                }`}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
              >
                <span className={styles.boiteTabLabel}>
                  {tab.label}
                  {tab.unread > 0 ? <span className={styles.boiteTabUnreadDot} aria-hidden="true" /> : null}
                </span>
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className={styles.boiteNotificationList} aria-busy="true" aria-label="Chargement des notifications">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className={styles.boiteNotificationCard} aria-hidden="true">
                <span className={styles.boiteNotificationIconSkeleton} />
                <div className={styles.boiteNotificationBody}>
                  <span className={styles.skeletonTitle} style={{ width: "78%" }} />
                  <span className={styles.skeletonSub} style={{ width: "56%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : isEmpty ? (
          <div className={`${styles.emptyState} ${styles.boiteEmptyState}`}>
            <span className={styles.boiteEmptyIconWrap} aria-hidden="true">
              <span className={styles.googleSymbol}>notifications</span>
            </span>
            <h3>Aucune notification</h3>
            <p>Les nouvelles missions et alertes apparaîtront ici.</p>
          </div>
        ) : visibleNotifications.length === 0 ? (
          <div className={`${styles.emptyState} ${styles.boiteEmptyState}`}>
            <span className={styles.boiteEmptyIconWrap} aria-hidden="true">
              <span className={styles.googleSymbol}>
                {activeTab === "missions" ? "assignment" : "warning"}
              </span>
            </span>
            <h3>Aucune notification</h3>
            <p>
              {activeTab === "missions"
                ? "Les nouvelles missions apparaîtront ici."
                : "Les alertes opérationnelles apparaîtront ici."}
            </p>
          </div>
        ) : (
          <>
            {!hasUnreadInList && tabUnread === 0 ? (
              <p className={styles.boiteCaughtUp}>Vous êtes à jour</p>
            ) : null}
            <div className={styles.boiteNotificationList}>
              {visibleNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  isExpanded={expandedAlertIds.includes(notification.id)}
                  onTap={() => handleNotificationTap(notification)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
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
