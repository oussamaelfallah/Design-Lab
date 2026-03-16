"use client";

import { useState } from "react";
import styles from "./worker-app.module.css";
import { WorkerAppHomeBottomBarScreen } from "./screens/home-bottom-bar-screen";
import { WorkerAppNavigationScreen } from "./screens/navigation-screen";
import { WorkerAppStatusBar } from "./screens/status-bar";

const syncStates = [
  { label: "Cloud Alert", icon: "cloud_alert" },
  { label: "Cloud Done", icon: "cloud_done" },
  { label: "Cloud Sync", icon: "cloud_sync" },
] as const;

type WorkerAppBoitePageProps = {
  showDeviceFrame: boolean;
  theme: "dark" | "light";
  frameTheme?: "dark" | "light";
};

export function WorkerAppBoitePage({ showDeviceFrame, theme, frameTheme }: WorkerAppBoitePageProps) {
  const [syncStateIndex, setSyncStateIndex] = useState(2);
  const syncState = syncStates[syncStateIndex];
  const resolvedFrameTheme = frameTheme ?? theme;
  const frameClass =
    resolvedFrameTheme === "light" ? styles.androidCanvasLightFrame : styles.androidCanvas;

  return (
    <div className={showDeviceFrame ? frameClass : styles.androidCanvasNoFrame}>
      <div className={styles.androidScreen}>
        <WorkerAppStatusBar theme={theme} />
        <div className={styles.homeContent}>
          <div className={styles.homeHeaderRow}>
            <h2 className={styles.homeTitle}>Boîte</h2>
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
        </div>
        <WorkerAppHomeBottomBarScreen activeIndex={3} />
        <WorkerAppNavigationScreen />
      </div>
    </div>
  );
}
