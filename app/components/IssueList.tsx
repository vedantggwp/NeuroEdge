"use client";

import { IssueCard, type Issue } from "@/components/IssueCard";

interface IssueListProps {
  issues: readonly Issue[];
}

export function IssueList({ issues }: IssueListProps) {
  if (issues.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-bg-surface p-8 text-center">
        <p className="text-lg font-medium text-text-primary">
          No issues found
        </p>
        <p className="mt-1 text-text-secondary">
          Your website passed all accessibility checks we ran.
        </p>
      </div>
    );
  }

  return (
    <section aria-label="Top accessibility issues">
      <h2 className="mb-4 font-serif text-2xl text-text-primary">
        Top Issues
      </h2>
      <div className="flex flex-col gap-4">
        {issues.map((issue, index) => (
          <IssueCard key={issue.id} issue={issue} index={index} />
        ))}
      </div>
    </section>
  );
}
