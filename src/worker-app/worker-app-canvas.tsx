import styles from "./worker-app.module.css";
import { WorkerAppContentScreen } from "./screens/content-screen";
import { WorkerAppNavigationScreen } from "./screens/navigation-screen";
import { WorkerAppStatusBar } from "./screens/status-bar";

type WorkerAppCanvasProps = {
  showDeviceFrame: boolean;
  theme: "dark" | "light";
};

export function WorkerAppCanvas({ showDeviceFrame, theme }: WorkerAppCanvasProps) {
  const frameClass = theme === "light" ? styles.androidCanvasLightFrame : styles.androidCanvas;

  return (
    <div className={showDeviceFrame ? frameClass : styles.androidCanvasNoFrame}>
      <div className={`${styles.androidScreen} ${styles.getStartedCanvas}`}>
        <WorkerAppStatusBar />
        <WorkerAppContentScreen />
        <WorkerAppNavigationScreen />
      </div>
    </div>
  );
}
