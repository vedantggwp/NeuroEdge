import { ACCESSIBILITY_STATS } from "./constants";

export interface RevenueInput {
  monthlyVisitors: number;
  avgOrderValue: number;
  conversionRate: number;
}

export interface RevenueEstimate {
  disabledVisitors: number;
  lostVisitors: number;
  recoveredLow: number;
  recoveredHigh: number;
  revenueUpliftLow: number;
  revenueUpliftHigh: number;
  formula: string;
}

export function calculateRevenueUplift(input: RevenueInput): RevenueEstimate {
  const { monthlyVisitors, avgOrderValue, conversionRate } = input;
  const {
    disabledPopulationPercent,
    clickAwayRate,
    recoveryRateLow,
    recoveryRateHigh,
  } = ACCESSIBILITY_STATS;

  if (monthlyVisitors <= 0 || avgOrderValue <= 0 || conversionRate <= 0) {
    throw new Error("All inputs must be positive numbers");
  }

  const disabledVisitors = Math.round(monthlyVisitors * disabledPopulationPercent);
  const lostVisitors = Math.round(disabledVisitors * clickAwayRate);
  const recoveredLow = Math.round(lostVisitors * recoveryRateLow);
  const recoveredHigh = Math.round(lostVisitors * recoveryRateHigh);
  const revenueUpliftLow = Math.round(recoveredLow * conversionRate * avgOrderValue);
  const revenueUpliftHigh = Math.round(recoveredHigh * conversionRate * avgOrderValue);

  const formula =
    `${monthlyVisitors.toLocaleString("en-GB")} visitors` +
    ` × ${disabledPopulationPercent * 100}% with disabilities` +
    ` = ${disabledVisitors.toLocaleString("en-GB")} disabled visitors` +
    ` → ${clickAwayRate * 100}% leave when they can't use the site` +
    ` = ${lostVisitors.toLocaleString("en-GB")} lost visitors` +
    ` → fixing top issues recovers ${recoveryRateLow * 100}–${recoveryRateHigh * 100}%` +
    ` = ${recoveredLow.toLocaleString("en-GB")}–${recoveredHigh.toLocaleString("en-GB")} visitors` +
    ` → at ${conversionRate * 100}% conversion × £${avgOrderValue} avg order`;

  return {
    disabledVisitors,
    lostVisitors,
    recoveredLow,
    recoveredHigh,
    revenueUpliftLow,
    revenueUpliftHigh,
    formula,
  };
}
