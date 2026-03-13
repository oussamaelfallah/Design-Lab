import styles from "./worker-app.module.css";
import { WorkerAppNavigationScreen } from "./screens/navigation-screen";
import { WorkerAppStatusBar } from "./screens/status-bar";

type WorkerAppFullPrototypePageProps = {
  showDeviceFrame: boolean;
  theme: "dark" | "light";
};

export function WorkerAppFullPrototypePage({
  showDeviceFrame,
  theme,
}: WorkerAppFullPrototypePageProps) {
  const frameClass = theme === "light" ? styles.androidCanvasLightFrame : styles.androidCanvas;

  return (
    <div className={showDeviceFrame ? frameClass : styles.androidCanvasNoFrame}>
      <div className={styles.androidScreen}>
        <WorkerAppStatusBar />
        <div className={styles.blankContent} />
        <WorkerAppNavigationScreen />
      </div>
    </div>
  );
}
