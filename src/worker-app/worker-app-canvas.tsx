import styles from "./worker-app.module.css";
import { WorkerAppContentScreen } from "./screens/content-screen";
import { WorkerAppNavigationScreen } from "./screens/navigation-screen";
import { WorkerAppStatusBar } from "./screens/status-bar";

type WorkerAppCanvasProps = {
  showDeviceFrame: boolean;
  theme: "dark" | "light";
  frameTheme?: "dark" | "light";
};

export function WorkerAppCanvas({ showDeviceFrame, theme, frameTheme }: WorkerAppCanvasProps) {
  const resolvedFrameTheme = frameTheme ?? theme;
  const frameClass =
    resolvedFrameTheme === "light" ? styles.androidCanvasLightFrame : styles.androidCanvas;

  return (
    <div className={showDeviceFrame ? frameClass : styles.androidCanvasNoFrame}>
      <div className={`${styles.androidScreen} ${styles.getStartedCanvas}`}>
        <WorkerAppStatusBar theme={theme} />
        <WorkerAppContentScreen />
        <WorkerAppNavigationScreen />
      </div>
    </div>
  );
}
