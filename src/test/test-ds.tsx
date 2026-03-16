import { useState, type CSSProperties } from "react";
import {
  type PostFixePreviewState,
  type SecteursFrameView,
  WorkerAppPostFixePage,
} from "../worker-app/post-fixe";
import styles from "./test-ds.module.css";

type ThemeMode = "light" | "dark";

const themeOptions: Array<{ key: ThemeMode; label: string; note: string }> = [
  { key: "light", label: "Light", note: "Generated from tokens.light.css." },
  { key: "dark", label: "Dark", note: "Generated from tokens.dark.css." },
] as const;

const mainJourneyFrames = [
  {
    id: "01",
    title: "Post Fixe List (Data)",
    note: "Main list with poste cards and progress.",
    frameView: "data" as SecteursFrameView,
    previewState: "list-data" as PostFixePreviewState,
  },
  {
    id: "02",
    title: "Poste Detail (Overview)",
    note: "Campaign summary with observations list.",
    frameView: "data" as SecteursFrameView,
    previewState: "detail-overview" as PostFixePreviewState,
  },
] as const;

export function TestDsPage() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const activeTheme = themeOptions.find((option) => option.key === theme) ?? themeOptions[0];
  const tokenVars = {
    "--tds-surface": "var(--color-surface-default)",
    "--tds-card": "var(--color-surface-raised)",
    "--tds-border": "var(--color-border-default)",
    "--tds-divider": "var(--color-border-subtle)",
    "--tds-text-primary": "var(--color-text-primary)",
    "--tds-text-secondary": "var(--color-text-secondary)",
    "--tds-text-muted": "var(--color-text-tertiary)",
  } as CSSProperties;

  return (
    <div className={styles.root}>
      <section
        className={styles.panel}
        style={tokenVars}
        data-theme={activeTheme.key}
        aria-label={`${activeTheme.label} mode`}
      >
        <div className={styles.panelHeader}>
          <div className={styles.panelHeaderTop}>
            <div>
              <h3>Theme Test</h3>
              <p>{activeTheme.note}</p>
              <p>Primary navigation path from list to detail.</p>
            </div>
            <div className={styles.themeToggle} role="tablist" aria-label="Theme">
              {themeOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className={`${styles.themeToggleButton} ${
                    theme === option.key ? styles.themeToggleButtonActive : ""
                  }`}
                  aria-pressed={theme === option.key}
                  onClick={() => setTheme(option.key)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.journeyGrid}>
          {mainJourneyFrames.map((frame) => (
            <article key={`${theme}-${frame.id}`} className={styles.journeyCard}>
              <div className={styles.journeyCardHeader}>
                <span className={styles.journeyId}>{frame.id}</span>
                <div className={styles.journeyMeta}>
                  <h4>{frame.title}</h4>
                  <p>{frame.note}</p>
                </div>
              </div>

              <div className={styles.journeyPreview}>
                <WorkerAppPostFixePage
                  showDeviceFrame={true}
                  theme={theme}
                  frameView={frame.frameView}
                  previewState={frame.previewState}
                  isInteractive={false}
                />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
