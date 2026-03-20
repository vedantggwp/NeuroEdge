interface ProgressProps {
  /** 0-100 */
  value: number;
  label?: string;
  className?: string;
}

export function Progress({ value, label, className = "" }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={className}>
      {label ? (
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="text-text-secondary">{label}</span>
          <span className="font-medium text-text-primary tabular-nums">
            {clamped}%
          </span>
        </div>
      ) : null}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-bg-subtle"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? `${clamped}% complete`}
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
