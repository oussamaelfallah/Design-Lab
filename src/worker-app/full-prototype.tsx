import { useState } from "react";
import styles from "./worker-app.module.css";
import { WorkerAppBoitePage } from "./boite";
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
};

type PrototypeTab = "home" | "travail" | "postFixe" | "boite";

export function WorkerAppFullPrototypePage({
  showDeviceFrame,
  theme,
  frameTheme,
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
        ) : (
          <WorkerAppBoitePage
            showDeviceFrame={false}
            theme={theme}
            frameTheme={frameTheme}
            embedded
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenTravail={openTravailFromHome}
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
              activeTab === "home" ? 0 : activeTab === "travail" ? 1 : activeTab === "postFixe" ? 2 : 3
            }
            onSelect={(index) => {
              setIsProfileOpen(false);
              const nextTab: PrototypeTab =
                index === 0 ? "home" : index === 1 ? "travail" : index === 2 ? "postFixe" : "boite";
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
