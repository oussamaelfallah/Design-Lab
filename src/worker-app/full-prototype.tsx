import { useEffect, useState } from "react";
import styles from "./worker-app.module.css";
import {
  WorkerAppHomePage,
  type HomeTravailNavigationHandler,
  type HomeTravailNavigationTarget,
} from "./home";
import { WorkerAppPostFixePage } from "./post-fixe";
import { WorkerAppProfilePage } from "./profile";
import { WorkerAppTravailPage, type TravailPreviewState } from "./travail";
import { WorkerAppNavigationScreen } from "./screens/navigation-screen";
import { WorkerAppHomeBottomBarScreen } from "./screens/home-bottom-bar-screen";
import { WorkerAppStatusBar } from "./screens/status-bar";

type WorkerAppFullPrototypePageProps = {
  showDeviceFrame: boolean;
  theme: "dark" | "light";
  frameTheme?: "dark" | "light";
  isLoopPlaying?: boolean;
  loopStepIndex?: number;
  loopRestartKey?: number;
  onLoopPlayingChange?: (isPlaying: boolean) => void;
  onLoopStepIndexChange?: (stepIndex: number) => void;
};

type PrototypeTab = "home" | "travail" | "postFixe" | "boite";

export type PrototypeLoopStep = {
  label: string;
  tab: PrototypeTab;
  isProfileOpen?: boolean;
  travailPreviewState?: TravailPreviewState;
  travailPreviewJobId?: string;
};

export const PROTOTYPE_LOOP_STEPS: PrototypeLoopStep[] = [
  { label: "Today home", tab: "home" },
  { label: "Work list", tab: "travail", travailPreviewState: "list-data" },
  {
    label: "Work detail",
    tab: "travail",
    travailPreviewState: "detail-overview",
    travailPreviewJobId: "est-10112-2",
  },
  { label: "Poste fixe", tab: "postFixe" },
  { label: "Worker profile", tab: "home", isProfileOpen: true },
];

export function WorkerAppFullPrototypePage({
  showDeviceFrame,
  theme,
  frameTheme,
  isLoopPlaying = false,
  loopStepIndex = 0,
  loopRestartKey = 0,
  onLoopPlayingChange,
  onLoopStepIndexChange,
}: WorkerAppFullPrototypePageProps) {
  const [activeTab, setActiveTab] = useState<PrototypeTab>("postFixe");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [postFixeLayoutMode, setPostFixeLayoutMode] = useState<"default" | "fullScreen">("default");
  const [travailLayoutMode, setTravailLayoutMode] = useState<"default" | "fullScreen">("default");
  const [travailPreviewState, setTravailPreviewState] = useState<TravailPreviewState>("list-data");
  const [travailPreviewJobId, setTravailPreviewJobId] = useState<string | undefined>();
  const resolvedFrameTheme = frameTheme ?? theme;
  const frameClass =
    resolvedFrameTheme === "light" ? styles.androidCanvasLightFrame : styles.androidCanvas;
  const shouldShowPrototypeBottomBar =
    !(activeTab === "postFixe" && postFixeLayoutMode === "fullScreen") &&
    !(activeTab === "travail" && travailLayoutMode === "fullScreen");
  const currentLoopStep = PROTOTYPE_LOOP_STEPS[loopStepIndex];

  const applyLoopStep = (step: PrototypeLoopStep) => {
    setActiveTab(step.tab);
    setIsProfileOpen(Boolean(step.isProfileOpen));
    setPostFixeLayoutMode("default");
    setTravailLayoutMode("default");

    if (step.tab === "travail") {
      setTravailPreviewState(step.travailPreviewState ?? "list-data");
      setTravailPreviewJobId(step.travailPreviewJobId);
      return;
    }

    setTravailPreviewState("list-data");
    setTravailPreviewJobId(undefined);
  };

  useEffect(() => {
    if (!isLoopPlaying) return;

    applyLoopStep(currentLoopStep);
    const timer = window.setTimeout(() => {
      onLoopStepIndexChange?.((loopStepIndex + 1) % PROTOTYPE_LOOP_STEPS.length);
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [currentLoopStep, isLoopPlaying, loopRestartKey, loopStepIndex, onLoopStepIndexChange]);

  const openTravailFromHome: HomeTravailNavigationHandler = (target: HomeTravailNavigationTarget) => {
    setIsProfileOpen(false);
    setActiveTab("travail");
    setTravailLayoutMode("default");
    if (target.kind === "detail") {
      setTravailPreviewState("detail-overview");
      setTravailPreviewJobId(target.jobId);
      return true;
    }
    setTravailPreviewJobId(undefined);
    setTravailPreviewState(target.filter === "active" ? "list-filters-active" : "list-data");
    return true;
  };

  return (
    <div className={showDeviceFrame ? frameClass : styles.androidCanvasNoFrame}>
      <div
        className={`${styles.androidScreen} ${
          theme === "dark" ? styles.androidScreenDark : styles.androidScreenLight
        }`}
      >
        <WorkerAppStatusBar theme={theme} />
        {activeTab === "home" ? (
          <WorkerAppHomePage
            showDeviceFrame={false}
            theme={theme}
            frameTheme={frameTheme}
            embedded
            onOpenTravail={openTravailFromHome}
            onOpenProfile={() => setIsProfileOpen(true)}
          />
        ) : activeTab === "postFixe" ? (
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
            previewState={travailPreviewState}
            previewJobId={travailPreviewJobId}
            onLayoutModeChange={setTravailLayoutMode}
          />
        ) : activeTab === "boite" ? (
          <WorkerAppHomePage
            showDeviceFrame={false}
            theme={theme}
            frameTheme={frameTheme}
            embedded
            onOpenTravail={openTravailFromHome}
            onOpenProfile={() => setIsProfileOpen(true)}
          />
        ) : (
          <WorkerAppHomePage
            showDeviceFrame={false}
            theme={theme}
            frameTheme={frameTheme}
            embedded
            onOpenTravail={openTravailFromHome}
            onOpenProfile={() => setIsProfileOpen(true)}
          />
        )}
        {isProfileOpen ? (
          <div className={styles.profileStackOverlay}>
            <WorkerAppProfilePage
              showDeviceFrame={false}
              theme={theme}
              frameTheme={frameTheme}
              embedded
              onBack={() => setIsProfileOpen(false)}
            />
          </div>
        ) : null}
        {shouldShowPrototypeBottomBar ? (
          <WorkerAppHomeBottomBarScreen
            activeIndex={
              activeTab === "home" ? 0 : activeTab === "travail" ? 1 : 2
            }
            onSelect={(index) => {
              onLoopPlayingChange?.(false);
              setIsProfileOpen(false);
              const nextTab: PrototypeTab =
                index === 0 ? "home" : index === 1 ? "travail" : "postFixe";
              setActiveTab(nextTab);
              if (nextTab === "travail") {
                setTravailPreviewState("list-data");
                setTravailPreviewJobId(undefined);
              }
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
