import { useMemo, useState } from "react";
import styles from "../worker-app.module.css";

export function WorkerAppContentScreenV2() {
  const slides = useMemo(
    () => [
      {
        icon: "checklist",
        chip: "Missions assignées",
        title: "Accédez à vos missions",
        text: "Consultez les parcelles et secteurs qui vous sont attribués et commencez votre travail.",
      },
      {
        icon: "photo_camera",
        chip: "Collecte sur le terrain",
        title: "Collecte sur le terrain",
        text: "Prenez des photos, saisissez les mesures et enregistrez vos observations.",
      },
      {
        icon: "donut_large",
        chip: "Suivi de progression",
        title: "Suivi de progression",
        text: "Visualisez l’avancement de vos missions et ce qu’il reste à compléter.",
      },
    ],
    [],
  );
  const [activeSlide, setActiveSlide] = useState(0);
  const slide = slides[activeSlide];

  return (
    <div className={`${styles.mobileContent} ${styles.getStartedV2Content}`}>
      <div className={styles.getStartedV2Stage}>
        <div className={styles.getStartedV2Artboard}>
          <div className={styles.getStartedV2DecorTop} aria-hidden="true" />
          <span className={`${styles.getStartedV2Spark} ${styles.getStartedV2SparkPrimary}`} aria-hidden="true" />
          <span className={`${styles.getStartedV2Spark} ${styles.getStartedV2SparkLightTop}`} aria-hidden="true" />

          <section className={styles.getStartedV2Hero}>
            <div className={styles.getStartedV2Brand}>
              <span className={styles.brandIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M17 8C8 10 5.9 16.8 5.5 20H7c.6-3.8 3.4-7.4 9.2-8.9-.8 1.8-2.2 3.2-3.8 4.2.6.2 1.1.6 1.6 1.1C17.5 13.9 19 10.1 19 6c-.7.8-1.4 1.5-2 2Z" />
                </svg>
              </span>
              <p className={styles.brandName}>CropLens</p>
            </div>

            <div className={styles.getStartedV2HeroBadge} aria-hidden="true">
              <div className={styles.getStartedV2HeroBadgeRing}>
                <span className={styles.getStartedV2HeroBadgeIcon}>{slide.icon}</span>
              </div>
              <span className={styles.getStartedV2HeroBadgeChip}>{slide.chip}</span>
            </div>

            <div className={styles.getStartedV2Message}>
              <h3 className={styles.getStartedV2Title}>{slide.title}</h3>
              <p className={styles.getStartedV2Text}>{slide.text}</p>
            </div>
          </section>

          <section className={styles.getStartedV2Body}>
            <div className={styles.getStartedV2Dots} role="tablist" aria-label="Pages d'introduction">
              {slides.map((item, index) => (
                <button
                  key={item.chip}
                  type="button"
                  role="tab"
                  aria-selected={index === activeSlide}
                  aria-label={`Voir l'écran ${index + 1}`}
                  className={`${styles.getStartedV2DotButton} ${
                    index === activeSlide ? styles.getStartedV2DotButtonActive : ""
                  }`}
                  onClick={() => setActiveSlide(index)}
                >
                  <span
                    className={`${styles.getStartedV2Dot} ${
                      index === activeSlide ? styles.getStartedV2DotActive : ""
                    }`}
                  />
                </button>
              ))}
            </div>
          </section>

          <section className={styles.getStartedV2Actions}>
            <div className={styles.getStartedV2DecorBottom} aria-hidden="true" />
            <span className={`${styles.getStartedV2Spark} ${styles.getStartedV2SparkLightBottom}`} aria-hidden="true" />
            <button className={styles.getStartedV2PrimaryButton} type="button">
              Se connecter
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
