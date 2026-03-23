"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { INDUSTRY_BENCHMARKS, type IndustryKey } from "@/lib/constants";
import type { RevenueInput } from "@/lib/revenue";

const QUICK_PICK_VISITORS = [500, 1_000, 2_000, 5_000] as const;

interface RevenueFormProps {
  onSubmit: (input: RevenueInput & { industry: IndustryKey }) => void;
  loading?: boolean;
}

interface FormState {
  industry: IndustryKey;
  monthlyVisitors: string;
  avgOrderValue: string;
}

interface FormErrors {
  monthlyVisitors?: string;
  avgOrderValue?: string;
}

function validateForm(state: FormState): FormErrors {
  const errors: FormErrors = {};
  const visitors = Number(state.monthlyVisitors);
  const order = Number(state.avgOrderValue);

  if (!state.monthlyVisitors || isNaN(visitors) || visitors <= 0) {
    errors.monthlyVisitors = "Enter a number greater than 0";
  }
  if (!state.avgOrderValue || isNaN(order) || order <= 0) {
    errors.avgOrderValue = "Enter a number greater than 0";
  }
  return errors;
}

export function RevenueForm({ onSubmit, loading = false }: RevenueFormProps) {
  const [form, setForm] = useState<FormState>({
    industry: "other",
    monthlyVisitors: "",
    avgOrderValue: String(INDUSTRY_BENCHMARKS.other.avgOrderValue),
  });
  const [errors, setErrors] = useState<FormErrors>({});

  function handleIndustryChange(key: IndustryKey) {
    setForm((prev) => ({
      ...prev,
      industry: key,
      avgOrderValue: String(INDUSTRY_BENCHMARKS[key].avgOrderValue),
    }));
    setErrors((prev) => ({ ...prev, avgOrderValue: undefined }));
  }

  function handleVisitorsPick(value: number) {
    setForm((prev) => ({ ...prev, monthlyVisitors: String(value) }));
    setErrors((prev) => ({ ...prev, monthlyVisitors: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const benchmark = INDUSTRY_BENCHMARKS[form.industry];
    onSubmit({
      industry: form.industry,
      monthlyVisitors: Number(form.monthlyVisitors),
      avgOrderValue: Number(form.avgOrderValue),
      conversionRate: benchmark.conversionRate,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Revenue estimate calculator"
      noValidate
      className="animate-fade-up space-y-8"
    >
      {/* Step 1: Industry */}
      <div className="animate-fade-up space-y-3" style={{ animationDelay: "100ms" }}>
        <label
          htmlFor="industry"
          className="block text-lg font-medium text-text-primary"
        >
          What's your industry?
        </label>
        <select
          id="industry"
          value={form.industry}
          onChange={(e) => handleIndustryChange(e.target.value as IndustryKey)}
          className={[
            "w-full rounded-xl border bg-bg-surface px-5 py-3.5 text-lg text-text-primary",
            "border-border hover:border-border-hover",
            "transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent",
            "cursor-pointer",
          ].join(" ")}
        >
          {(Object.entries(INDUSTRY_BENCHMARKS) as [IndustryKey, { label: string }][]).map(
            ([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ),
          )}
        </select>
      </div>

      {/* Step 2: Monthly visitors */}
      <div className="animate-fade-up space-y-3" style={{ animationDelay: "200ms" }}>
        <label
          htmlFor="monthlyVisitors"
          className="block text-lg font-medium text-text-primary"
        >
          About how many visitors does your website get per month?
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Quick-pick visitor counts">
          {QUICK_PICK_VISITORS.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => handleVisitorsPick(v)}
              className={[
                "rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-150",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                form.monthlyVisitors === String(v)
                  ? "border-accent bg-accent-subtle text-accent-text"
                  : "border-border bg-bg-surface text-text-secondary hover:border-border-hover hover:text-text-primary",
              ].join(" ")}
              aria-pressed={form.monthlyVisitors === String(v)}
            >
              {v.toLocaleString("en-GB")}
            </button>
          ))}
        </div>
        <Input
          id="monthlyVisitors"
          type="number"
          min={1}
          placeholder="Or type a number…"
          value={form.monthlyVisitors}
          onChange={(e) => {
            setForm((prev) => ({ ...prev, monthlyVisitors: e.target.value }));
            setErrors((prev) => ({ ...prev, monthlyVisitors: undefined }));
          }}
          error={errors.monthlyVisitors}
          aria-describedby={errors.monthlyVisitors ? "monthlyVisitors-error" : undefined}
        />
      </div>

      {/* Step 3: Average order value */}
      <div className="animate-fade-up space-y-3" style={{ animationDelay: "300ms" }}>
        <label
          htmlFor="avgOrderValue"
          className="block text-lg font-medium text-text-primary"
        >
          What's your average sale or booking value?
        </label>
        <p className="text-sm text-text-tertiary">
          Pre-filled from your industry average — feel free to adjust.
        </p>
        <div className="relative">
          <span
            className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-lg text-text-tertiary"
            aria-hidden="true"
          >
            £
          </span>
          <Input
            id="avgOrderValue"
            type="number"
            min={1}
            className="pl-9"
            value={form.avgOrderValue}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, avgOrderValue: e.target.value }));
              setErrors((prev) => ({ ...prev, avgOrderValue: undefined }));
            }}
            error={errors.avgOrderValue}
          />
        </div>
      </div>

      {/* Submit */}
      <div className="animate-fade-up" style={{ animationDelay: "400ms" }}>
        <Button
          type="submit"
          size="lg"
          loading={loading}
          className="w-full sm:w-auto"
        >
          Calculate My Uplift →
        </Button>
      </div>
    </form>
  );
}
