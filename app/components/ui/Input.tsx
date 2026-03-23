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
            "w-full rounded-full border bg-white px-6 py-3.5 text-base text-text-primary",
            "placeholder:text-text-tertiary",
            "transition-all duration-300",
            "focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20",
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
