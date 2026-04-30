import { useMemo, useState } from "react";
import styles from "./worker-app.module.css";
import { WORKER_APP_POST_FIXE_PAGE_NAME } from "./constants";
import { WorkerAppPostFixePage } from "./post-fixe";
import { WorkerAppTravailPage } from "./travail";
import { WorkerAppNavigationScreen } from "./screens/navigation-screen";
import { WorkerAppHomeBottomBarScreen } from "./screens/home-bottom-bar-screen";
import { WorkerAppStatusBar } from "./screens/status-bar";

type WorkerAppFullPrototypePageProps = {
  showDeviceFrame: boolean;
  theme: "dark" | "light";
  frameTheme?: "dark" | "light";
};

type PrototypeTab = "home" | "travail" | "postFixe" | "boite";

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
    eyebrow: "Empty state",
    description: "Post Fixe stays empty in the Full App Prototype until you ask to bring designs over.",
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
  const [postFixeLayoutMode, setPostFixeLayoutMode] = useState<"default" | "fullScreen">("default");
  const [travailLayoutMode, setTravailLayoutMode] = useState<"default" | "fullScreen">("default");
  const resolvedFrameTheme = frameTheme ?? theme;
  const frameClass =
    resolvedFrameTheme === "light" ? styles.androidCanvasLightFrame : styles.androidCanvas;
  const activeTabMeta = useMemo(() => prototypeTabMeta[activeTab], [activeTab]);
  const shouldShowPrototypeBottomBar =
    !(activeTab === "postFixe" && postFixeLayoutMode === "fullScreen") &&
    !(activeTab === "travail" && travailLayoutMode === "fullScreen");

  return (
    <div className={showDeviceFrame ? frameClass : styles.androidCanvasNoFrame}>
      <div
        className={`${styles.androidScreen} ${
          theme === "dark" ? styles.androidScreenDark : styles.androidScreenLight
        }`}
      >
        <WorkerAppStatusBar theme={theme} />
        {activeTab === "postFixe" ? (
          <WorkerAppPostFixePage
            showDeviceFrame={false}
            theme={theme}
            frameTheme={frameTheme}
            frameView="data"
            embedded
            onLayoutModeChange={setPostFixeLayoutMode}
          />
        ) : activeTab === "travail" ? (
          <WorkerAppTravailPage
            showDeviceFrame={false}
            theme={theme}
            frameTheme={frameTheme}
            embedded
            onLayoutModeChange={setTravailLayoutMode}
          />
        ) : (
          <div className={`${styles.homeContent} ${styles.prototypeScreenContent}`}>
            <div className={styles.homeHeaderRow}>
              <h2 className={styles.homeTitle}>{activeTabMeta.title}</h2>
              <div className={styles.homeHeaderActions}>
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
        )}
        {shouldShowPrototypeBottomBar ? (
          <WorkerAppHomeBottomBarScreen
            activeIndex={
              activeTab === "home" ? 0 : activeTab === "travail" ? 1 : activeTab === "postFixe" ? 2 : 3
            }
            onSelect={(index) => {
              const nextTab: PrototypeTab =
                index === 0 ? "home" : index === 1 ? "travail" : index === 2 ? "postFixe" : "boite";
              setActiveTab(nextTab);
            }}
          />
        ) : null}
        <WorkerAppNavigationScreen
          surface={
            (activeTab === "postFixe" && postFixeLayoutMode === "fullScreen") ||
            (activeTab === "travail" && travailLayoutMode === "fullScreen")
              ? "page"
              : "default"
          }
        />
      </div>
    </div>
  );
}
