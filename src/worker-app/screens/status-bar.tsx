import styles from "../worker-app.module.css";

type WorkerAppStatusBarProps = {
  theme?: "light" | "dark";
};

const STATUS_BAR_ASSETS = {
  wifi: "https://www.figma.com/api/mcp/asset/e57317fb-a86e-46db-81f3-aed2f430cc01",
  signal: "https://www.figma.com/api/mcp/asset/aedde68f-8038-43e1-8127-0169cacc65fe",
  battery: "https://www.figma.com/api/mcp/asset/6e09db51-4f8b-4e97-9637-2dbd362aae28",
  cutout: "https://www.figma.com/api/mcp/asset/fa125117-86cf-4568-addf-ee129617b839",
} as const;

export function WorkerAppStatusBar({ theme = "light" }: WorkerAppStatusBarProps) {
  const isLight = theme === "light";

  return (
    <div className={`${styles.statusBar} ${isLight ? styles.statusBarLight : styles.statusBarDark}`}>
      <span className={styles.time}>9:30</span>
      <span className={styles.cameraCutout} aria-hidden="true">
        <img src={STATUS_BAR_ASSETS.cutout} alt="" className={styles.statusAssetImage} />
      </span>
      <div className={styles.rightIcons}>
        <span className={styles.statusWifi} aria-hidden="true">
          <img src={STATUS_BAR_ASSETS.wifi} alt="" className={styles.statusAssetImage} />
        </span>
        <span className={styles.statusSignal} aria-hidden="true">
          <img src={STATUS_BAR_ASSETS.signal} alt="" className={styles.statusAssetImage} />
        </span>
        <span className={styles.statusBattery} aria-hidden="true">
          <img src={STATUS_BAR_ASSETS.battery} alt="" className={styles.statusAssetImage} />
        </span>
      </div>
    </div>
  );
}
