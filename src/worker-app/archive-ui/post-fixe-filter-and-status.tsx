import styles from "../worker-app.module.css";

export type ArchivedPosteStatus = "Pas commencé" | "En cours" | "Terminé";
export type ArchivedPosteFilter = "Tous" | ArchivedPosteStatus;

const posteStatusClasses: Record<ArchivedPosteStatus, string> = {
  "Pas commencé": styles.posteStatusNotStarted,
  "En cours": styles.posteStatusInProgress,
  "Terminé": styles.posteStatusDone,
};

const posteFilters: ArchivedPosteFilter[] = ["Tous", "Pas commencé", "En cours", "Terminé"];

type ArchivedPosteFiltersProps = {
  activeFilter: ArchivedPosteFilter;
  counts: Record<ArchivedPosteFilter, number>;
  onSelect: (value: ArchivedPosteFilter) => void;
};

export function ArchivedPosteFilters({
  activeFilter,
  counts,
  onSelect,
}: ArchivedPosteFiltersProps) {
  return (
    <div className={styles.posteFiltersRow} role="tablist" aria-label="Filtres poste fixe">
      {posteFilters.map((filter) => (
        <button
          key={filter}
          type="button"
          role="tab"
          aria-selected={activeFilter === filter}
          className={`${styles.posteFilterChip} ${
            activeFilter === filter ? styles.posteFilterChipActive : ""
          }`}
          onClick={() => onSelect(filter)}
        >
          {filter} ({counts[filter]})
        </button>
      ))}
    </div>
  );
}

export function ArchivedPosteFiltersSkeleton() {
  return (
    <div className={styles.posteFiltersSkeletonRow} aria-hidden="true">
      <span className={styles.posteFilterSkeletonChip} style={{ width: "84px" }} />
      <span className={styles.posteFilterSkeletonChip} style={{ width: "144px" }} />
      <span className={styles.posteFilterSkeletonChip} style={{ width: "114px" }} />
      <span className={styles.posteFilterSkeletonChip} style={{ width: "108px" }} />
    </div>
  );
}

type ArchivedPosteStatusBadgeProps = {
  status: ArchivedPosteStatus;
};

export function ArchivedPosteStatusBadge({ status }: ArchivedPosteStatusBadgeProps) {
  return <span className={`${styles.posteStatusBadge} ${posteStatusClasses[status]}`}>{status}</span>;
}

