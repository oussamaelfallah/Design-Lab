import { WORKER_APP_ASSETS } from "../constants";
import styles from "../worker-app.module.css";

export function WorkerAppStatusBar() {
  return (
    <div className={styles.statusBar}>
      <span className={styles.time}>9:30</span>
      <img className={styles.cameraCutout} src={WORKER_APP_ASSETS.cameraCutout} alt="" />
      <div className={styles.rightIcons}>
        <img src={WORKER_APP_ASSETS.wifiIcon} alt="" />
        <img src={WORKER_APP_ASSETS.signalIcon} alt="" />
        <img src={WORKER_APP_ASSETS.batteryIcon} alt="" />
      </div>
    </div>
  );
}
