import styles from "../worker-app.module.css";

export function WorkerAppContentScreen() {
  return (
    <div className={styles.mobileContent}>
      <div className={styles.getStartedTop}>
        <div className={styles.brandRow}>
          <span className={styles.brandIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M17 8C8 10 5.9 16.8 5.5 20H7c.6-3.8 3.4-7.4 9.2-8.9-.8 1.8-2.2 3.2-3.8 4.2.6.2 1.1.6 1.6 1.1C17.5 13.9 19 10.1 19 6c-.7.8-1.4 1.5-2 2Z" />
            </svg>
          </span>
          <p className={styles.brandName}>CropLens</p>
        </div>

        <div className={styles.imagePlaceholder} aria-label="Image placeholder">
          <span>Image Placeholder</span>
        </div>

        <div className={styles.textBlock}>
          <h3 className={styles.getStartedTitle}>Bienvenue sur CropLens</h3>
          <p className={styles.getStartedText}>
            L’application pour collecter et suivre les observations terrain.
          </p>
        </div>

        <ul className={styles.featuresList}>
          <li>Accédez à vos missions de terrain</li>
          <li>Capturez des images et observations</li>
          <li>Synchronisez vos données automatiquement</li>
        </ul>
      </div>

      <div className={styles.getStartedBottom}>
        <button className={styles.signInButton} type="button">
          Se connecter
        </button>
      </div>
    </div>
  );
}
