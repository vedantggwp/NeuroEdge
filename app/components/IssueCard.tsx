import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

type Severity = "critical" | "serious" | "moderate" | "minor";

export interface Issue {
  id: string;
  impact: Severity;
  description: string;
  nodes: number;
  help: string;
}

interface IssueCardProps {
  issue: Issue;
  index: number;
}

export function IssueCard({ issue, index }: IssueCardProps) {
  return (
    <div
      className="animate-fade-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <Card padding="md" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <Badge severity={issue.impact}>{issue.impact}</Badge>
          <span className="text-sm text-text-tertiary tabular-nums">
            {issue.nodes === 1
              ? "affects 1 element"
              : `affects ${issue.nodes} elements`}
          </span>
        </div>
        <p className="text-text-primary font-medium leading-snug">
          {issue.description}
        </p>
        {issue.help ? (
          <p className="text-sm text-text-secondary">{issue.help}</p>
        ) : null}
      </Card>
    </div>
  );
}
