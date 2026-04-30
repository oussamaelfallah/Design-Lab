import styles from "../worker-app.module.css";

const STATUS_BAR_ASSETS = {
  wifi: "https://www.figma.com/api/mcp/asset/88008230-b2ac-4505-86c7-0cbeb6fae1f4",
  signal: "https://www.figma.com/api/mcp/asset/159f108d-7b74-4715-933b-230b2acab029",
  battery: "https://www.figma.com/api/mcp/asset/2f9dfe00-a8ab-4ea6-8bfe-c8c13bb1df42",
  cameraCutout: "https://www.figma.com/api/mcp/asset/3e5d663e-8a58-491d-a726-7650b1a2cb4c",
} as const;

type WorkerAppStatusBarProps = {
  theme?: "light" | "dark";
  transparent?: boolean;
};

export function WorkerAppStatusBar({
  theme = "light",
  transparent = false,
}: WorkerAppStatusBarProps) {
  const isLight = theme === "light";

  return (
    <div
      className={`${styles.statusBar} ${isLight ? styles.statusBarLight : styles.statusBarDark} ${
        transparent ? styles.statusBarTransparent : ""
      }`}
    >
      <span className={styles.time}>9:30</span>
      <span
        className={styles.cameraCutout}
        style={{ backgroundImage: `url(${STATUS_BAR_ASSETS.cameraCutout})` }}
        aria-hidden="true"
      />
      <div className={styles.rightIcons}>
        <span
          className={`${styles.statusWifi} ${styles.statusAssetIcon}`}
          style={{ backgroundImage: `url(${STATUS_BAR_ASSETS.wifi})` }}
          aria-hidden="true"
        />
        <span
          className={`${styles.statusSignal} ${styles.statusAssetIcon}`}
          style={{ backgroundImage: `url(${STATUS_BAR_ASSETS.signal})` }}
          aria-hidden="true"
        />
        <span
          className={`${styles.statusBattery} ${styles.statusAssetIcon}`}
          style={{ backgroundImage: `url(${STATUS_BAR_ASSETS.battery})` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
