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

        <div className={styles.getStartedHeroCard}>
          <div className={styles.getStartedHeroScene} aria-hidden="true">
            <div className={styles.heroSurface} />
            <div className={styles.heroPreviewShell}>
              <div className={styles.heroPreviewHeader}>
                <div className={styles.heroPreviewHeaderText}>
                  <span className={styles.heroPreviewLabel}>Travail</span>
                  <span className={styles.heroPreviewHeading}>Missions du jour</span>
                </div>
                <span className={styles.heroPreviewSync}>Sync</span>
              </div>

              <div className={styles.heroMissionCard}>
                <div className={styles.heroMissionTop}>
                  <div className={styles.heroMissionBadgeGroup}>
                    <span className={styles.heroMissionBadge}>Poste fixe</span>
                    <span className={styles.heroMissionBadgeMuted}>Aujourd&apos;hui</span>
                  </div>
                  <span className={styles.heroMissionStatus}>En cours</span>
                </div>

                <div className={styles.heroMissionBody}>
                  <div className={styles.heroMissionTitleGroup}>
                    <span className={styles.heroMissionTitle}>Poste Fixe 5097</span>
                    <span className={styles.heroMissionMeta}>Parcelle A12 • Secteur Nord</span>
                  </div>

                  <div className={styles.heroMissionRows}>
                    <div className={styles.heroMissionRow}>
                      <span className={styles.heroMissionStatIcon}>checklist</span>
                      <div className={styles.heroMissionStatText}>
                        <span className={styles.heroMissionStatValue}>3 observations</span>
                        <span className={styles.heroMissionStatLabel}>fleuraison, nouaison, chute</span>
                      </div>
                    </div>

                    <div className={styles.heroMissionRow}>
                      <span className={styles.heroMissionStatIcon}>photo_camera</span>
                      <div className={styles.heroMissionStatText}>
                        <span className={styles.heroMissionStatValue}>Photos terrain</span>
                        <span className={styles.heroMissionStatLabel}>ajout rapide depuis la parcelle</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.heroMissionFooter}>
                    <div className={styles.heroMissionFooterMeta}>
                      <span className={styles.heroMissionFooterValue}>2 / 5</span>
                      <span className={styles.heroMissionFooterLabel}>complétés</span>
                    </div>
                    <span className={styles.heroMissionFooterState}>Hors ligne prêt</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.textBlock}>
          <p className={styles.getStartedEyebrow}>Worker app</p>
          <h3 className={styles.getStartedTitle}>Connectez-vous pour accéder à vos missions.</h3>
          <p className={styles.getStartedText}>
            Retrouvez vos parcelles, saisissez vos observations et synchronisez vos données depuis le terrain.
          </p>
        </div>
      </div>

      <div className={styles.getStartedBottom}>
        <div className={styles.getStartedTrustRow}>
          <span className={styles.getStartedTrustItem}>Compte terrain sécurisé</span>
          <span className={styles.getStartedTrustDot} aria-hidden="true" />
          <span className={styles.getStartedTrustItem}>Accès réservé aux équipes</span>
        </div>
        <button className={styles.signInButton} type="button">
          Se connecter
        </button>
      </div>
    </div>
  );
}
