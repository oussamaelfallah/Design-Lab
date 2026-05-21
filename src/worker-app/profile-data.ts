export type WorkerLanguage = "fr" | "ar";

export type WorkerProfile = {
  workerId: string;
  displayName: string;
  email: string;
  phone: string;
  managerName: string;
  role: string;
  initials: string;
  language: WorkerLanguage;
};

export const WORKER_PROFILE_STORAGE_KEY = "worker-app-profile-v2";

export const DEFAULT_WORKER_PROFILE: WorkerProfile = {
  workerId: "worker-oussama",
  displayName: "Oussama Elfallah",
  email: "oussama.elfallah@croplens.com",
  phone: "+212 6 12 34 56 78",
  managerName: "Nadia Benali",
  role: "Technicien",
  initials: "OE",
  language: "fr",
};

export const WORKER_APP_VERSION_LABEL = "1.0.0 (42)";

export const WORKER_LANGUAGE_OPTIONS: { code: WorkerLanguage; label: string }[] = [
  { code: "fr", label: "Français" },
  { code: "ar", label: "العربية (Arabe)" },
];

export function getLanguageLabel(language: WorkerLanguage): string {
  return WORKER_LANGUAGE_OPTIONS.find((option) => option.code === language)?.label ?? "Français";
}

export function loadStoredWorkerProfile(): WorkerProfile {
  if (typeof window === "undefined") {
    return DEFAULT_WORKER_PROFILE;
  }

  try {
    const raw = window.localStorage.getItem(WORKER_PROFILE_STORAGE_KEY);
    if (!raw) return DEFAULT_WORKER_PROFILE;

    const parsed = JSON.parse(raw) as Partial<WorkerProfile>;
    return {
      ...DEFAULT_WORKER_PROFILE,
      ...parsed,
      displayName: parsed.displayName || DEFAULT_WORKER_PROFILE.displayName,
      role:
        !parsed.role ||
        parsed.role.toLowerCase().includes("worker") ||
        parsed.role.toLowerCase().includes("terrain")
          ? DEFAULT_WORKER_PROFILE.role
          : parsed.role,
      language:
        parsed.language === "fr" || parsed.language === "ar"
          ? parsed.language
          : DEFAULT_WORKER_PROFILE.language,
    };
  } catch {
    return DEFAULT_WORKER_PROFILE;
  }
}

export function persistWorkerProfile(profile: WorkerProfile): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WORKER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export async function saveWorkerDisplayName(displayName: string): Promise<void> {
  await new Promise((resolve) => window.setTimeout(resolve, 500));
  const profile = loadStoredWorkerProfile();
  persistWorkerProfile({ ...profile, displayName });
}

export async function saveWorkerLanguage(language: WorkerLanguage): Promise<void> {
  await new Promise((resolve) => window.setTimeout(resolve, 200));
  const profile = loadStoredWorkerProfile();
  persistWorkerProfile({ ...profile, language });
}
