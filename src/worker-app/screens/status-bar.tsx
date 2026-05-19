import styles from "../worker-app.module.css";

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
      <span className={styles.cameraCutout} aria-hidden="true" />
      <div className={styles.rightIcons}>
        <span className={`${styles.statusSymbol} ${styles.statusWifi}`} aria-hidden="true">
          wifi
        </span>
        <span className={`${styles.statusSymbol} ${styles.statusSignal}`} aria-hidden="true">
          signal_cellular_4_bar
        </span>
        <span className={`${styles.statusSymbol} ${styles.statusBattery}`} aria-hidden="true">
          battery_full
        </span>
      </div>
    </div>
  );
}
