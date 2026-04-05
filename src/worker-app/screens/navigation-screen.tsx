import styles from "../worker-app.module.css";

type WorkerAppNavigationScreenProps = {
  surface?: "default" | "page" | "brand";
};

export function WorkerAppNavigationScreen({ surface = "default" }: WorkerAppNavigationScreenProps) {
  return (
    <div
      className={`${styles.navigationBar} ${
        surface === "page"
          ? styles.navigationBarPageSurface
          : surface === "brand"
            ? styles.navigationBarBrandSurface
            : ""
      }`}
    >
      <span className={styles.navHandle} />
    </div>
  );
}
