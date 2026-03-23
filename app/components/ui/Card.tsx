import { type HTMLAttributes, type ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: "sm" | "md" | "lg";
}

const paddingClasses = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
} as const;

export function Card({
  children,
  padding = "md",
  className = "",
  ...rest
}: CardProps) {
  return (
    <div
      className={[
        "rounded-xl bg-white border border-border shadow-md",
        paddingClasses[padding],
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}
