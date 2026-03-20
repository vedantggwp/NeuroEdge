type Severity = "critical" | "serious" | "moderate" | "minor";

interface BadgeProps {
  severity: Severity;
  children: React.ReactNode;
  className?: string;
}

const severityClasses: Record<Severity, string> = {
  critical:
    "bg-severity-critical-bg text-severity-critical border-severity-critical/20",
  serious:
    "bg-severity-serious-bg text-severity-serious border-severity-serious/20",
  moderate:
    "bg-severity-moderate-bg text-severity-moderate border-severity-moderate/20",
  minor:
    "bg-severity-minor-bg text-severity-minor border-severity-minor/20",
};

const severityLabels: Record<Severity, string> = {
  critical: "Critical",
  serious: "Serious",
  moderate: "Moderate",
  minor: "Minor",
};

export function Badge({
  severity,
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
        severityClasses[severity],
        className,
      ].join(" ")}
      role="status"
      aria-label={`${severityLabels[severity]} severity`}
    >
      {children ?? severityLabels[severity]}
    </span>
  );
}
