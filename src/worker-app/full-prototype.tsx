import { useMemo, useState } from "react";
import styles from "./worker-app.module.css";
import { WorkerAppPostFixePage } from "./post-fixe";
import { WORKER_APP_POST_FIXE_PAGE_NAME } from "./constants";
import { WorkerAppNavigationScreen } from "./screens/navigation-screen";
import { WorkerAppHomeBottomBarScreen } from "./screens/home-bottom-bar-screen";
import { WorkerAppStatusBar } from "./screens/status-bar";

type WorkerAppFullPrototypePageProps = {
  showDeviceFrame: boolean;
  theme: "dark" | "light";
  frameTheme?: "dark" | "light";
};

type PrototypeTab = "home" | "travail" | "postFixe" | "boite";

const syncStates = [
  { label: "Cloud Alert", icon: "cloud_alert" },
  { label: "Cloud Done", icon: "cloud_done" },
  { label: "Cloud Sync", icon: "cloud_sync" },
] as const satisfies ReadonlyArray<{ label: string; icon: string }>;

const prototypeTabMeta: Record<
  PrototypeTab,
  { title: string; eyebrow: string; description: string; icon: string }
> = {
  home: {
    title: "Accueil",
    eyebrow: "Coming soon",
    description: "The home tab will be added here once its core screens are ready.",
    icon: "home",
  },
  travail: {
    title: "Travail",
    eyebrow: "Coming soon",
    description: "The work queue and daily task surfaces will be added next.",
    icon: "assignment",
  },
  postFixe: {
    title: WORKER_APP_POST_FIXE_PAGE_NAME,
    eyebrow: "Live flow",
    description: "Real Post Fixe flow wired inside the app prototype.",
    icon: "view_timeline",
  },
  boite: {
    title: "Boîte",
    eyebrow: "Coming soon",
    description: "Inbox and communication states will be added here later.",
    icon: "inbox",
  },
};

export function WorkerAppFullPrototypePage({
  showDeviceFrame,
  theme,
  frameTheme,
}: WorkerAppFullPrototypePageProps) {
  const [activeTab, setActiveTab] = useState<PrototypeTab>("postFixe");
  const [isPostFixeFullScreen, setIsPostFixeFullScreen] = useState(false);
  const [syncStateIndex, setSyncStateIndex] = useState(2);
  const resolvedFrameTheme = frameTheme ?? theme;
  const frameClass =
    resolvedFrameTheme === "light" ? styles.androidCanvasLightFrame : styles.androidCanvas;
  const activeTabMeta = useMemo(() => prototypeTabMeta[activeTab], [activeTab]);
  const syncState = syncStates[syncStateIndex];

  const renderPrototypeContent = () => {
    if (activeTab === "postFixe") {
      return (
        <WorkerAppPostFixePage
          showDeviceFrame={false}
          theme={theme}
          frameView="data"
          embedded
          onLayoutModeChange={(mode) => setIsPostFixeFullScreen(mode === "fullScreen")}
        />
      );
    }

    return (
      <div className={`${styles.homeContent} ${styles.prototypeScreenContent}`}>
        <div className={styles.homeHeaderRow}>
          <h2 className={styles.homeTitle}>{activeTabMeta.title}</h2>
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

        <div className={styles.prototypePlaceholder}>
          <div className={styles.prototypePlaceholderHero}>
            <span className={styles.prototypePlaceholderIcon} aria-hidden="true">
              {activeTabMeta.icon}
            </span>
          </div>
          <div className={styles.prototypePlaceholderBody}>
            <p className={styles.prototypePlaceholderEyebrow}>{activeTabMeta.eyebrow}</p>
            <h2 className={styles.prototypePlaceholderTitle}>{activeTabMeta.title}</h2>
            <p className={styles.prototypePlaceholderDescription}>{activeTabMeta.description}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={showDeviceFrame ? frameClass : styles.androidCanvasNoFrame}>
      <div className={styles.androidScreen}>
        <WorkerAppStatusBar theme={theme} />
        {renderPrototypeContent()}
        {!(activeTab === "postFixe" && isPostFixeFullScreen) ? (
          <WorkerAppHomeBottomBarScreen
            activeIndex={
              activeTab === "home" ? 0 : activeTab === "travail" ? 1 : activeTab === "postFixe" ? 2 : 3
            }
            onSelect={(index) => {
              const nextTab: PrototypeTab =
                index === 0 ? "home" : index === 1 ? "travail" : index === 2 ? "postFixe" : "boite";
              if (nextTab !== "postFixe") {
                setIsPostFixeFullScreen(false);
              }
              setActiveTab(nextTab);
            }}
          />
        ) : null}
        <WorkerAppNavigationScreen
          surface={activeTab === "postFixe" && isPostFixeFullScreen ? "page" : "default"}
        />
      </div>
    </div>
  );
}
