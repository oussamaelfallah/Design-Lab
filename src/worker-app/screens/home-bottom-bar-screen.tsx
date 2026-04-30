import styles from "../worker-app.module.css";

type HomeNavItem = {
  iconName: string;
  label: string;
};

const navItems: HomeNavItem[] = [
  { iconName: "home", label: "Accueil" },
  { iconName: "task_alt", label: "Travail" },
  { iconName: "view_timeline", label: "Post Fixe" },
  { iconName: "inbox", label: "Boîte" },
];

type WorkerAppHomeBottomBarScreenProps = {
  activeIndex?: number;
  onSelect?: (index: number) => void;
};

export function WorkerAppHomeBottomBarScreen({
  activeIndex = 0,
  onSelect,
}: WorkerAppHomeBottomBarScreenProps) {
  return (
    <div className={styles.homeBottomBar}>
      {navItems.map((item, index) => (
        <button
          key={item.label}
          className={`${styles.homeNavItem} ${index === activeIndex ? styles.homeNavItemActive : ""}`}
          type="button"
          disabled={onSelect == null ? index !== activeIndex : undefined}
          onClick={onSelect ? () => onSelect(index) : undefined}
          aria-current={index === activeIndex ? "page" : undefined}
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
