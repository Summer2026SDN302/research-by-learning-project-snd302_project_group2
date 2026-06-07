/**
 * StatusBadge
 *
 * Props:
 *   status  {string} – 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled' | 'paid' | 'unpaid'
 *   label   {string} – override display text
 *   size    {string} – 'sm' | 'md'
 */
const STATUS_MAP = {
  active:    { label: 'Active',    classes: 'bg-secondary-container/30 text-secondary border border-secondary/20' },
  inactive:  { label: 'Inactive',  classes: 'bg-error-container/30 text-error border border-error/20' },
  pending:   { label: 'Pending',   classes: 'bg-tertiary-container/20 text-tertiary border border-tertiary/20' },
  completed: { label: 'Completed', classes: 'bg-primary/10 text-primary border border-primary/20' },
  cancelled: { label: 'Cancelled', classes: 'bg-error-container/30 text-error border border-error/20' },
  paid:      { label: 'Paid',      classes: 'bg-secondary-container/30 text-secondary border border-secondary/20' },
  unpaid:    { label: 'Unpaid',    classes: 'bg-tertiary-container/20 text-tertiary border border-tertiary/20' },
};

const StatusBadge = ({ status = 'active', label, size = 'md' }) => {
  const config = STATUS_MAP[status] ?? STATUS_MAP.pending;
  const displayLabel = label ?? config.label;
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-label-md';

  return (
    <span className={`inline-flex items-center rounded-full font-semibold ${sizeClass} ${config.classes}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {displayLabel}
    </span>
  );
};

export default StatusBadge;
