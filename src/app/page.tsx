"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import {
  WORKER_APP_BOITE_PAGE_NAME,
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
  const [postFixeFrameView, setPostFixeFrameView] = useState<SecteursFrameView>("data");
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isSidebarResizing, setIsSidebarResizing] = useState(false);
  const sidebarResizeStartXRef = useRef(0);
  const sidebarResizeStartWidthRef = useRef(300);

  useEffect(() => {
    if (!isSidebarResizing) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const delta = event.clientX - sidebarResizeStartXRef.current;
      const nextWidth = sidebarResizeStartWidthRef.current + delta;
      const boundedWidth = Math.min(560, Math.max(240, nextWidth));
      setSidebarWidth(boundedWidth);
    };

    const stopResizing = () => {
      setIsSidebarResizing(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopResizing);
    window.addEventListener("pointercancel", stopResizing);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopResizing);
      window.removeEventListener("pointercancel", stopResizing);
    };
  }, [isSidebarResizing]);

  return (
    <div
      className={`${styles.page} ${isSidebarResizing ? styles.pageResizing : ""}`}
      data-theme={theme}
    >
      <aside className={styles.sidebar} style={{ width: `${sidebarWidth}px` }}>
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
                className={`${styles.subTab} ${activeScreen === "postFixe" ? styles.activeSubTab : ""}`}
                type="button"
                onClick={() => {
                  setActiveScreen("postFixe");
                  setPostFixeFrameView("data");
                }}
              >
                <span className={styles.subTabLabelRow}>
                  <span>{WORKER_APP_POST_FIXE_PAGE_NAME}</span>
                  <span className={styles.devReadyBadge}>
                    <span className={styles.devReadyDot} aria-hidden="true" />
                    Ready for dev
                  </span>
                </span>
              </button>
              <div className={styles.subTabDivider} aria-hidden="true" />
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
      <button
        type="button"
        className={`${styles.sidebarResizer} ${
          isSidebarResizing ? styles.sidebarResizerActive : ""
        }`}
        aria-label="Resize sidebar"
        onPointerDown={(event) => {
          event.preventDefault();
          sidebarResizeStartXRef.current = event.clientX;
          sidebarResizeStartWidthRef.current = sidebarWidth;
          setIsSidebarResizing(true);
        }}
      />

      <main className={styles.canvasArea}>
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
