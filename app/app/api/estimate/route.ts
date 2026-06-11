import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { calculateRevenueUplift, type RevenueInput } from "@/lib/revenue";
import { checkRateLimit } from "@/lib/rate-limit";

interface EstimateRequestBody {
  scanId: string;
  industry: string;
  monthlyVisitors: number;
  avgOrderValue: number;
  conversionRate: number;
}

function isValidBody(body: unknown): body is EstimateRequestBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.scanId === "string" &&
    b.scanId.length > 0 &&
    typeof b.industry === "string" &&
    b.industry.length > 0 &&
    typeof b.monthlyVisitors === "number" &&
    b.monthlyVisitors > 0 &&
    typeof b.avgOrderValue === "number" &&
    b.avgOrderValue > 0 &&
    typeof b.conversionRate === "number" &&
    b.conversionRate > 0
  );
}

export async function POST(req: NextRequest) {
  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateCheck = checkRateLimit(`estimate:${clientIp}`, 20, 60_000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute and try again." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isValidBody(body)) {
    return NextResponse.json(
      {
        error:
          "Required fields: scanId (string), industry (string), monthlyVisitors (number > 0), avgOrderValue (number > 0), conversionRate (number > 0)",
      },
      { status: 400 },
    );
  }

  const input: RevenueInput = {
    monthlyVisitors: body.monthlyVisitors,
    avgOrderValue: body.avgOrderValue,
    conversionRate: body.conversionRate,
  };

  let estimate;
  try {
    estimate = calculateRevenueUplift(input);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Calculation failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const db = createServerClient();
  const { error: updateError } = await db
    .from("scans")
    .update({
      revenue_estimate: {
        industry: body.industry,
        monthlyVisitors: body.monthlyVisitors,
        avgOrderValue: body.avgOrderValue,
        conversionRate: body.conversionRate,
        ...estimate,
      },
    })
    .eq("id", body.scanId);

  if (updateError) {
    console.error("Failed to persist revenue estimate:", updateError);
    // Return the estimate anyway — persistence is best-effort
    return NextResponse.json(
      { estimate, warning: "Estimate calculated but could not be saved" },
      { status: 200 },
    );
  }

  return NextResponse.json({ estimate }, { status: 200 });
}
