import styles from "./worker-app.module.css";
import { WorkerAppContentScreen } from "./screens/content-screen";
import { WorkerAppContentScreenV2 } from "./screens/content-screen-v2";
import { WorkerAppNavigationScreen } from "./screens/navigation-screen";
import { WorkerAppStatusBar } from "./screens/status-bar";

type WorkerAppCanvasProps = {
  showDeviceFrame: boolean;
  theme: "dark" | "light";
  frameTheme?: "dark" | "light";
  variant?: "v1" | "v2";
};

export function WorkerAppCanvas({
  showDeviceFrame,
  theme,
  frameTheme,
  variant = "v1",
}: WorkerAppCanvasProps) {
  const resolvedFrameTheme = frameTheme ?? theme;
  const frameClass =
    resolvedFrameTheme === "light" ? styles.androidCanvasLightFrame : styles.androidCanvas;

  return (
    <div className={showDeviceFrame ? frameClass : styles.androidCanvasNoFrame}>
      <div
        className={`${styles.androidScreen} ${
          theme === "dark" ? styles.androidScreenDark : styles.androidScreenLight
        } ${
          variant === "v2" ? styles.getStartedCanvasV2 : styles.getStartedCanvas
        }`}
      >
        <WorkerAppStatusBar theme={theme} transparent />
        {variant === "v2" ? <WorkerAppContentScreenV2 /> : <WorkerAppContentScreen />}
        <WorkerAppNavigationScreen surface={variant === "v2" ? "brand" : "default"} />
      </div>
    </div>
  );
}
