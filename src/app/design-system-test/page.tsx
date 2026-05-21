"use client";

import { useState } from "react";
import { WorkerAppHomePage } from "@/worker-app/home";
import styles from "./page.module.css";

type ThemeMode = "light" | "dark";

export default function DesignSystemTestPage() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const todayColorRows = [
    {
      part: "Card surface",
      selector: ".homeTodayCard",
      variable: "--poste-card-surface",
      token: "--color-surface-raised",
    },
    {
      part: "Title",
      selector: ".homeSectionTitle",
      variable: "--poste-card-title",
      token: "--color-card-title",
    },
    {
      part: "Body text",
      selector: ".homeTodayCard p",
      variable: "--poste-card-subtitle",
      token: "--color-text-secondary",
    },
    {
      part: "Overdue text",
      selector: ".homeTodayOverdue",
      variable: "hardcoded",
      token: "should use --color-text-danger",
    },
    {
      part: "Action text",
      selector: ".homeInlineAction",
      variable: "--poste-card-subtitle",
      token: "--color-text-secondary",
    },
    {
      part: "Sync warning",
      selector: ".homeSyncNoteWarning",
      variable: "--ds-warning-text",
      token: "--color-feedback-warning-text",
    },
  ];

  return (
    <main className={styles.page} data-theme={theme}>
      <div className={styles.toolbar}>
        <div>
          <p>Design system color test</p>
          <h1>Accueil</h1>
        </div>

        <div className={styles.switcher} role="group" aria-label="Changer le thème">
          {(["light", "dark"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              className={theme === mode ? styles.switcherActive : ""}
              aria-pressed={theme === mode}
              onClick={() => setTheme(mode)}
            >
              {mode === "light" ? "Light" : "Dark"}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.phoneStage}>
        <div className={styles.tokenColorScope}>
          <WorkerAppHomePage
            showDeviceFrame={false}
            theme={theme}
            frameTheme={theme}
            frameView="data"
            previewState="home-data"
          />
        </div>

        <aside className={styles.handoffPanel} aria-label="Aujourd'hui color handoff">
          <div className={styles.handoffHeader}>
            <p>UI annotation handoff</p>
            <h2>Aujourd&apos;hui colors</h2>
          </div>

          <div className={styles.annotationPreview} aria-hidden="true">
            <span className={styles.markerTitle}>1</span>
            <span className={styles.markerBody}>2</span>
            <span className={styles.markerDanger}>3</span>
            <span className={styles.markerAction}>4</span>
            <span className={styles.markerWarning}>5</span>
          </div>

          <div className={styles.handoffTable} role="table" aria-label="Aujourd'hui color variables">
            <div className={styles.handoffTableHeader} role="row">
              <span role="columnheader">Part</span>
              <span role="columnheader">Current var</span>
              <span role="columnheader">Token source</span>
            </div>
            {todayColorRows.map((row) => (
              <div className={styles.handoffRow} role="row" key={row.part}>
                <span role="cell">
                  <strong>{row.part}</strong>
                  <small>{row.selector}</small>
                </span>
                <code role="cell">{row.variable}</code>
                <code role="cell">{row.token}</code>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
