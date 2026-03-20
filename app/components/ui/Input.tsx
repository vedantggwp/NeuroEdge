"use client";

import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = "", id, ...rest }, ref) => {
    const errorId = id ? `${id}-error` : undefined;

    return (
      <div className="w-full">
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? errorId : undefined}
          className={[
            "w-full rounded-xl border bg-bg-surface px-5 py-3.5 text-lg text-text-primary",
            "placeholder:text-text-tertiary",
            "transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent",
            error
              ? "border-severity-critical"
              : "border-border hover:border-border-hover",
            className,
          ].join(" ")}
          {...rest}
        />
        {error ? (
          <p
            id={errorId}
            role="alert"
            className="mt-2 text-sm text-severity-critical"
          >
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
export { Input };
export type { InputProps };
