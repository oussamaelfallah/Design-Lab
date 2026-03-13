import styles from "../worker-app.module.css";

type HomeNavItem = {
  iconName: string;
  label: string;
};

const navItems: HomeNavItem[] = [
  { iconName: "home", label: "Accueil" },
  { iconName: "assignment", label: "Travail" },
  { iconName: "view_timeline", label: "Post Fixe" },
  { iconName: "inbox", label: "Boîte" },
];

type WorkerAppHomeBottomBarScreenProps = {
  activeIndex?: number;
};

export function WorkerAppHomeBottomBarScreen({
  activeIndex = 0,
}: WorkerAppHomeBottomBarScreenProps) {
  return (
    <div className={styles.homeBottomBar}>
      {navItems.map((item, index) => (
        <button
          key={item.label}
          className={`${styles.homeNavItem} ${index === activeIndex ? styles.homeNavItemActive : ""}`}
          type="button"
          disabled={index !== activeIndex}
        >
          <span className={styles.homeNavItemInner}>
            <span className={styles.homeNavIconSlot}>
              <span className={styles.homeNavIconContainer}>
                <span className={styles.homeNavIconFrame}>
                  <span className={styles.homeNavIcon} aria-hidden="true">
                    {item.iconName}
                  </span>
                </span>
              </span>
            </span>
            <span className={styles.homeNavLabel}>{item.label}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
