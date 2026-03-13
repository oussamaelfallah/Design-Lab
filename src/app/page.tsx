"use client";

import { useState } from "react";
import styles from "./page.module.css";
import {
  WORKER_APP_BOITE_PAGE_NAME,
  WORKER_APP_CANVAS_NAME,
  WORKER_APP_GET_STARTED_PAGE_NAME,
  WORKER_APP_HOME_PAGE_NAME,
  WORKER_APP_POST_FIXE_PAGE_NAME,
  WORKER_APP_PROFILE_PAGE_NAME,
  WORKER_APP_SYNCHRONISATION_PAGE_NAME,
  WORKER_APP_TAB_NAME,
  WORKER_APP_TRAVAIL_PAGE_NAME,
} from "../worker-app/constants";
import { WorkerAppBoitePage } from "../worker-app/boite";
import { WorkerAppFullPrototypePage } from "../worker-app/full-prototype";
import { WorkerAppGetStartedPage } from "../worker-app/getstarted";
import { WorkerAppHomePage } from "../worker-app/home";
import { SecteursFrameView, WorkerAppPostFixePage } from "../worker-app/post-fixe";
import { WorkerAppProfilePage } from "../worker-app/profile";
import { WorkerAppSynchronisationPage } from "../worker-app/synchronisation";
import { WorkerAppTravailPage } from "../worker-app/travail";

const designSystem = {
  colors: {
    brand: "#01A362",
    homeBackground: "#F3F5F7",
    dark: {
      pageBg: "#0F1117",
      sidebarBg: "#161A23",
      sidebarBorder: "#2A2F3B",
      sidebarText: "#F3F5FA",
      tabBg: "#1A202B",
      tabBorder: "#2B3140",
      tabText: "#D2D9E8",
      activeBg: "#202A3A",
      activeBorder: "#6CB6FF",
      activeText: "#F5F8FF",
      canvasBg: "#0E131C",
      canvasBorder: "#252A36",
    },
    light: {
      pageBg: "#EEF2F7",
      sidebarBg: "#FFFFFF",
      sidebarBorder: "#D7DEE8",
      sidebarText: "#0F1722",
      tabBg: "#F8FAFC",
      tabBorder: "#D6DEE8",
      tabText: "#27344A",
      activeBg: "#E8F3FF",
      activeBorder: "#3D9DF5",
      activeText: "#12325F",
      canvasBg: "#F7F9FC",
      canvasBorder: "#D3DDE9",
    },
  },
  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    section: 28,
    sidebarGap: 40,
  },
} as const;

function getDesignSystemMarkdown() {
  return [
    "# Design System",
    "",
    "## Colors",
    "",
    "- `brand`: `#01A362`",
    "- `homeBackground`: `#F3F5F7`",
    "- `dark.pageBg`: `#0F1117`",
    "- `dark.sidebarBg`: `#161A23`",
    "- `dark.sidebarBorder`: `#2A2F3B`",
    "- `dark.sidebarText`: `#F3F5FA`",
    "- `dark.tabBg`: `#1A202B`",
    "- `dark.tabBorder`: `#2B3140`",
    "- `dark.tabText`: `#D2D9E8`",
    "- `dark.activeBg`: `#202A3A`",
    "- `dark.activeBorder`: `#6CB6FF`",
    "- `dark.activeText`: `#F5F8FF`",
    "- `dark.canvasBg`: `#0E131C`",
    "- `dark.canvasBorder`: `#252A36`",
    "- `light.pageBg`: `#EEF2F7`",
    "- `light.sidebarBg`: `#FFFFFF`",
    "- `light.sidebarBorder`: `#D7DEE8`",
    "- `light.sidebarText`: `#0F1722`",
    "- `light.tabBg`: `#F8FAFC`",
    "- `light.tabBorder`: `#D6DEE8`",
    "- `light.tabText`: `#27344A`",
    "- `light.activeBg`: `#E8F3FF`",
    "- `light.activeBorder`: `#3D9DF5`",
    "- `light.activeText`: `#12325F`",
    "- `light.canvasBg`: `#F7F9FC`",
    "- `light.canvasBorder`: `#D3DDE9`",
    "",
    "## Spacing",
    "",
    "- `xxs`: `2px`",
    "- `xs`: `4px`",
    "- `sm`: `8px`",
    "- `md`: `12px`",
    "- `lg`: `16px`",
    "- `xl`: `20px`",
    "- `xxl`: `24px`",
    "- `section`: `28px`",
    "- `sidebarGap`: `40px`",
    "",
  ].join("\n");
}

export default function Home() {
  const [activeScreen, setActiveScreen] = useState<
    | "prototype"
    | "getStarted"
    | "home"
    | "travail"
    | "postFixe"
    | "boite"
    | "profile"
    | "synchronisation"
  >("getStarted");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [showDeviceFrame, setShowDeviceFrame] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
  const [postFixeFrameView, setPostFixeFrameView] = useState<SecteursFrameView>("data");

  const handleCopyDesignSystem = async () => {
    const json = JSON.stringify(designSystem, null, 2);
    const markdown = getDesignSystemMarkdown();
    const output = `# JSON\n\n${json}\n\n# Markdown\n\n${markdown}`;

    await navigator.clipboard.writeText(output);
    setCopyStatus("copied");
    window.setTimeout(() => setCopyStatus("idle"), 1500);
  };

  return (
    <div className={styles.page} data-theme={theme}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <h1 className={styles.header}>Design Lab</h1>
          <div className={styles.settingsMenu}>
            <button
              className={styles.menuTrigger}
              type="button"
              aria-label="Open design lab menu"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <span className={styles.selectArrow} aria-hidden="true">
                keyboard_arrow_down
              </span>
            </button>
            {isMenuOpen ? (
              <div className={styles.menuDropdown}>
                <p className={styles.menuSectionTitle}>Theme</p>
                <button
                  className={`${styles.menuItem} ${theme === "dark" ? styles.menuItemActive : ""}`}
                  type="button"
                  onClick={() => {
                    setTheme("dark");
                    setIsMenuOpen(false);
                  }}
                >
                  Dark mode
                </button>
                <button
                  className={`${styles.menuItem} ${theme === "light" ? styles.menuItemActive : ""}`}
                  type="button"
                  onClick={() => {
                    setTheme("light");
                    setIsMenuOpen(false);
                  }}
                >
                  Light mode
                </button>
                <p className={styles.menuSectionTitle}>Device Frame</p>
                <button
                  className={`${styles.menuItem} ${showDeviceFrame ? styles.menuItemActive : ""}`}
                  type="button"
                  onClick={() => {
                    setShowDeviceFrame(true);
                    setIsMenuOpen(false);
                  }}
                >
                  On
                </button>
                <button
                  className={`${styles.menuItem} ${!showDeviceFrame ? styles.menuItemActive : ""}`}
                  type="button"
                  onClick={() => {
                    setShowDeviceFrame(false);
                    setIsMenuOpen(false);
                  }}
                >
                  Off
                </button>
              </div>
            ) : null}
          </div>
        </div>
        <div className={styles.tabsPanel}>
          <div className={styles.canvasTabs}>
            <p className={styles.tabsLabel}>Final Design</p>
            <button
              className={`${styles.canvasTab} ${activeScreen === "prototype" ? styles.activeTab : ""}`}
              type="button"
              onClick={() => setActiveScreen("prototype")}
            >
              <span className={styles.parentTabRow}>
                <span>{WORKER_APP_TAB_NAME}</span>
                <span className={styles.parentTabArrow} aria-hidden="true">
                  keyboard_arrow_down
                </span>
              </span>
            </button>
            <div className={styles.subTabs}>
              <button
                className={`${styles.subTab} ${activeScreen === "getStarted" ? styles.activeSubTab : ""}`}
                type="button"
                onClick={() => setActiveScreen("getStarted")}
              >
                {WORKER_APP_GET_STARTED_PAGE_NAME}
              </button>
              <button
                className={`${styles.subTab} ${activeScreen === "home" ? styles.activeSubTab : ""}`}
                type="button"
                onClick={() => setActiveScreen("home")}
              >
                {WORKER_APP_HOME_PAGE_NAME}
              </button>
              <button
                className={`${styles.subTab} ${activeScreen === "travail" ? styles.activeSubTab : ""}`}
                type="button"
                onClick={() => setActiveScreen("travail")}
              >
                {WORKER_APP_TRAVAIL_PAGE_NAME}
              </button>
              <button
                className={`${styles.subTab} ${activeScreen === "postFixe" ? styles.activeSubTab : ""}`}
                type="button"
                onClick={() => {
                  setActiveScreen("postFixe");
                  setPostFixeFrameView("data");
                }}
              >
                {WORKER_APP_POST_FIXE_PAGE_NAME}
              </button>
              <button
                className={`${styles.subTab} ${activeScreen === "boite" ? styles.activeSubTab : ""}`}
                type="button"
                onClick={() => setActiveScreen("boite")}
              >
                {WORKER_APP_BOITE_PAGE_NAME}
              </button>
              <button
                className={`${styles.subTab} ${activeScreen === "profile" ? styles.activeSubTab : ""}`}
                type="button"
                onClick={() => setActiveScreen("profile")}
              >
                {WORKER_APP_PROFILE_PAGE_NAME}
              </button>
              <button
                className={`${styles.subTab} ${activeScreen === "synchronisation" ? styles.activeSubTab : ""}`}
                type="button"
                onClick={() => setActiveScreen("synchronisation")}
              >
                {WORKER_APP_SYNCHRONISATION_PAGE_NAME}
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className={styles.canvasArea}>
        <div className={styles.canvasHeader}>
          <div className={styles.canvasHeaderRow}>
            <h2>
              {activeScreen === "prototype"
                ? WORKER_APP_CANVAS_NAME
                : activeScreen === "home"
                  ? WORKER_APP_HOME_PAGE_NAME
                  : activeScreen === "travail"
                    ? WORKER_APP_TRAVAIL_PAGE_NAME
                    : activeScreen === "postFixe"
                      ? WORKER_APP_POST_FIXE_PAGE_NAME
                      : activeScreen === "boite"
                        ? WORKER_APP_BOITE_PAGE_NAME
                        : activeScreen === "profile"
                          ? WORKER_APP_PROFILE_PAGE_NAME
                          : activeScreen === "synchronisation"
                            ? WORKER_APP_SYNCHRONISATION_PAGE_NAME
                            : WORKER_APP_GET_STARTED_PAGE_NAME}
            </h2>
            <div className={styles.headerActions}>
              <button
                className={styles.copyTargetButton}
                type="button"
                onClick={handleCopyDesignSystem}
              >
                {copyStatus === "copied" ? "Copied" : "Copy DS"}
              </button>
            </div>
          </div>
        </div>
        <div className={styles.canvasPage}>
          {activeScreen === "postFixe" ? (
            <div className={styles.canvasSubHeader}>
              <div className={styles.frameViewTabs}>
                <button
                  className={`${styles.frameViewTab} ${
                    postFixeFrameView === "data" ? styles.frameViewTabActive : ""
                  }`}
                  type="button"
                  onClick={() => setPostFixeFrameView("data")}
                >
                  Liste
                </button>
                <button
                  className={`${styles.frameViewTab} ${
                    postFixeFrameView === "loading" ? styles.frameViewTabActive : ""
                  }`}
                  type="button"
                  onClick={() => setPostFixeFrameView("loading")}
                >
                  Loading
                </button>
                <button
                  className={`${styles.frameViewTab} ${
                    postFixeFrameView === "empty" ? styles.frameViewTabActive : ""
                  }`}
                  type="button"
                  onClick={() => setPostFixeFrameView("empty")}
                >
                  Empty
                </button>
              </div>
            </div>
          ) : null}
          {activeScreen === "prototype" ? (
            <WorkerAppFullPrototypePage showDeviceFrame={showDeviceFrame} theme={theme} />
          ) : activeScreen === "home" ? (
            <WorkerAppHomePage showDeviceFrame={showDeviceFrame} theme={theme} />
          ) : activeScreen === "travail" ? (
            <WorkerAppTravailPage showDeviceFrame={showDeviceFrame} theme={theme} />
          ) : activeScreen === "postFixe" ? (
            <WorkerAppPostFixePage
              showDeviceFrame={showDeviceFrame}
              theme={theme}
              frameView={postFixeFrameView}
            />
          ) : activeScreen === "boite" ? (
            <WorkerAppBoitePage showDeviceFrame={showDeviceFrame} theme={theme} />
          ) : activeScreen === "profile" ? (
            <WorkerAppProfilePage showDeviceFrame={showDeviceFrame} theme={theme} />
          ) : activeScreen === "synchronisation" ? (
            <WorkerAppSynchronisationPage showDeviceFrame={showDeviceFrame} theme={theme} />
          ) : (
            <WorkerAppGetStartedPage showDeviceFrame={showDeviceFrame} theme={theme} />
          )}
        </div>
      </main>
    </div>
  );
}
