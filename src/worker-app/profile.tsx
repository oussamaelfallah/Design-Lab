import styles from "./worker-app.module.css";
import { WorkerAppNavigationScreen } from "./screens/navigation-screen";
import { WorkerAppStatusBar } from "./screens/status-bar";

type WorkerAppProfilePageProps = {
  showDeviceFrame: boolean;
  theme: "dark" | "light";
  frameTheme?: "dark" | "light";
};

export function WorkerAppProfilePage({
  showDeviceFrame,
  theme,
  frameTheme,
}: WorkerAppProfilePageProps) {
  const resolvedFrameTheme = frameTheme ?? theme;
  const frameClass =
    resolvedFrameTheme === "light" ? styles.androidCanvasLightFrame : styles.androidCanvas;

  return (
    <div className={showDeviceFrame ? frameClass : styles.androidCanvasNoFrame}>
      <div className={styles.androidScreen}>
        <WorkerAppStatusBar theme={theme} />
        <div className={styles.detailContent}>
          <div className={styles.pageTopBar}>
            <button className={styles.pageBackButton} type="button" aria-label="Back">
              <span className={styles.pageBackIcon} aria-hidden="true">
                arrow_back
              </span>
            </button>
            <h2 className={styles.pageTopTitle}>Profile</h2>
          </div>
        </div>
        <WorkerAppNavigationScreen surface="page" />
      </div>
    </div>
  );
}
