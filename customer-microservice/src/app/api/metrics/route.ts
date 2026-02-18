import { NextResponse } from "next/server";
import { getMetrics } from "@/lib/instrumentation";
import logger from "@/lib/logger";

export async function GET() {
  logger.info("Metrics endpoint accessed");
  const metrics = getMetrics();
  return NextResponse.json({
    totalRequests: metrics.length,
    requests: metrics,
  });
}
