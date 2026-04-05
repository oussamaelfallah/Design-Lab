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
        <span className={styles.statusWifi} aria-hidden="true">
          <span className={styles.statusSymbol}>wifi</span>
        </span>
        <span className={styles.statusSignal} aria-hidden="true">
          <span className={styles.statusSymbol}>signal_cellular_alt</span>
        </span>
        <span className={styles.statusBattery} aria-hidden="true">
          <span className={styles.statusSymbol}>battery_full</span>
        </span>
      </div>
    </div>
  );
}
