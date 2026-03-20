"use client";

import { motion, useReducedMotion } from "framer-motion";
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
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { delay: index * 0.1, duration: 0.4, ease: "easeOut" }
      }
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
    </motion.div>
  );
}
