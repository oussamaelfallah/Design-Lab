export type NotificationKind = "mission.created" | "mission.modified" | "alert.operational";

export type BoiteTab = "missions" | "alertes";

export type WorkerNotification = {
  id: string;
  kind: NotificationKind;
  headline: string;
  metaParts: string[];
  createdAt: string;
  read: boolean;
  jobId?: string;
  expandedBody?: string;
};

export const BOITE_READ_STATE_STORAGE_KEY = "worker-app-boite-read-v1";

const now = Date.now();

function minutesAgo(minutes: number): string {
  return new Date(now - minutes * 60_000).toISOString();
}

function hoursAgo(hours: number): string {
  return new Date(now - hours * 3_600_000).toISOString();
}

function daysAgo(days: number): string {
  return new Date(now - days * 86_400_000).toISOString();
}

export function formatNotificationTimestamp(isoDate: string): string {
  const date = new Date(isoDate);
  const diffMs = now - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) return "À l'instant";
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Il y a ${diffHours} h`;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return "Hier";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export function getNotificationIcon(kind: NotificationKind): string {
  if (kind === "mission.created") return "assignment";
  if (kind === "mission.modified") return "edit";
  return "warning";
}

export function getNotificationIconTone(kind: NotificationKind): "assignment" | "edit" | "warning" {
  if (kind === "mission.created") return "assignment";
  if (kind === "mission.modified") return "edit";
  return "warning";
}

export function getNotificationTab(kind: NotificationKind): BoiteTab {
  return kind === "alert.operational" ? "alertes" : "missions";
}

export function formatNotificationMeta(metaParts: string[]): string {
  return metaParts.join(" · ");
}

export const DEFAULT_NOTIFICATIONS: WorkerNotification[] = [
  {
    id: "notif-3",
    kind: "alert.operational",
    headline: "Synchro requise",
    metaParts: ["12 images en attente"],
    createdAt: hoursAgo(3),
    read: false,
    expandedBody:
      "12 images capturées aujourd'hui ne sont pas encore synchronisées. Connectez-vous au Wi-Fi de la ferme avant 18h.",
  },
  {
    id: "notif-7",
    kind: "alert.operational",
    headline: "Batterie faible",
    metaParts: ["15% restant"],
    createdAt: minutesAgo(10),
    read: false,
    expandedBody: "Pensez à charger votre appareil pour ne pas interrompre votre mission.",
  },
  {
    id: "notif-1",
    kind: "mission.created",
    headline: "Nouvelle mission : Parcelle 10612",
    metaParts: ["Estimation", "Secteur S2", "Échéance 18 mai"],
    createdAt: minutesAgo(5),
    read: false,
    jobId: "est-10612-3",
  },
  {
    id: "notif-2",
    kind: "mission.modified",
    headline: "Mission modifiée : Parcelle 10089",
    metaParts: ["Calibre", "Secteur S1", "Échéance 22 mai"],
    createdAt: minutesAgo(42),
    read: false,
    jobId: "est-10089-2",
  },
  {
    id: "notif-4",
    kind: "mission.created",
    headline: "Nouvelle mission : Parcelle 10450",
    metaParts: ["Estimation", "Secteur S3", "Échéance 20 mai"],
    createdAt: hoursAgo(8),
    read: true,
    jobId: "est-10450-1",
  },
  {
    id: "notif-5",
    kind: "mission.modified",
    headline: "Mission modifiée : Parcelle 10374",
    metaParts: ["Estimation", "Secteur S2", "Objectif mis à jour"],
    createdAt: daysAgo(1),
    read: true,
    jobId: "est-10374-1",
  },
  {
    id: "notif-6",
    kind: "alert.operational",
    headline: "Échéance demain : Parcelle 10118",
    metaParts: ["Estimation", "8 images restantes"],
    createdAt: daysAgo(1),
    read: true,
    expandedBody:
      "La mission sur la parcelle 10118 arrive à échéance demain. Il reste 8 images à capturer.",
  },
];

export function loadNotifications(): WorkerNotification[] {
  if (typeof window === "undefined") {
    return DEFAULT_NOTIFICATIONS;
  }

  try {
    const raw = window.localStorage.getItem(BOITE_READ_STATE_STORAGE_KEY);
    if (!raw) return DEFAULT_NOTIFICATIONS;

    const readById = JSON.parse(raw) as Record<string, boolean>;
    return DEFAULT_NOTIFICATIONS.map((notification) => ({
      ...notification,
      read: readById[notification.id] ?? notification.read,
    }));
  } catch {
    return DEFAULT_NOTIFICATIONS;
  }
}

export function persistNotificationReadState(notifications: WorkerNotification[]): void {
  if (typeof window === "undefined") return;

  const readById = Object.fromEntries(
    notifications.map((notification) => [notification.id, notification.read])
  );
  window.localStorage.setItem(BOITE_READ_STATE_STORAGE_KEY, JSON.stringify(readById));
}
