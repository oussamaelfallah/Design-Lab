import styles from "../worker-app.module.css";

type WorkerAppNavigationScreenProps = {
  surface?: "default" | "page";
};

export function WorkerAppNavigationScreen({ surface = "default" }: WorkerAppNavigationScreenProps) {
  return (
    <div
      className={`${styles.navigationBar} ${
        surface === "page" ? styles.navigationBarPageSurface : ""
      }`}
    >
      <span className={styles.navHandle} />
    </div>
  );
}
