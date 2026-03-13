import styles from "../worker-app.module.css";

type ArchivedConfigurationSectionProps = {
  hasSavedConfig: boolean;
  irrigationType: string;
  waterSource: string;
  waterQuality: string;
  onEdit: () => void;
  onConfigure: () => void;
};

export function ArchivedConfigurationSection({
  hasSavedConfig,
  irrigationType,
  waterSource,
  waterQuality,
  onEdit,
  onConfigure,
}: ArchivedConfigurationSectionProps) {
  return (
    <>
      <h3 className={styles.posteSectionTitle}>Configuration</h3>
      {hasSavedConfig ? (
        <div className={styles.posteConfigCard}>
          <div className={styles.posteConfigFooter}>
            <p className={styles.posteConfigDate}>Modifié le 28 Avr</p>
            <button className={styles.posteConfigAction} type="button" onClick={onEdit}>
              Modifier
              <span className={styles.posteArrow} aria-hidden="true">
                chevron_right
              </span>
            </button>
          </div>
          <div className={styles.posteConfigContent}>
            <p className={styles.posteConfigLine}>
              <span className={styles.posteConfigIcon} aria-hidden="true">
                water_drop
              </span>
              {irrigationType}
            </p>
            <p className={styles.posteConfigLine}>
              <span className={styles.posteConfigIcon} aria-hidden="true">
                water
              </span>
              {waterSource}
            </p>
            <p className={styles.posteConfigLine}>
              <span className={styles.posteConfigIcon} aria-hidden="true">
                star
              </span>
              Qualité : {waterQuality}
            </p>
          </div>
        </div>
      ) : (
        <div className={styles.posteConfigEmptyCard}>
          <div className={styles.posteConfigEmptyText}>
            <p className={styles.posteConfigEmptyTitle}>Configuration non renseignée</p>
            <p className={styles.posteConfigEmptySubTitle}>
              Irrigation, source et qualité de l&apos;eau
            </p>
          </div>
          <button className={styles.posteConfigEmptyAction} type="button" onClick={onConfigure}>
            Configurer
          </button>
        </div>
      )}
    </>
  );
}

