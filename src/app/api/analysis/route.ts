import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Analysis from "@/models/Analysis";
import { extractDomain, normalizeUrl } from "@/lib/utils";
import { rateLimit, errorResponse, successResponse } from "@/lib/api-helpers";
import { runAnalysisPipeline } from "@/services/pipeline";
import { RATE_LIMIT } from "@/config/constants";

/** POST /api/analysis — Start a new analysis */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Authentication required", 401);
    }

    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return errorResponse("A valid URL is required");
    }

    // Validate URL format
    let normalizedUrl: string;
    try {
      normalizedUrl = normalizeUrl(url.trim());
      new URL(normalizedUrl); // validate
    } catch {
      return errorResponse("Invalid URL format");
    }

    // Rate limiting
    const allowed = rateLimit(
      `analysis:${session.user.id}`,
      RATE_LIMIT.maxAnalysesPerHour,
      60 * 60 * 1000
    );
    if (!allowed) {
      return errorResponse(
        `Rate limit exceeded. Maximum ${RATE_LIMIT.maxAnalysesPerHour} analyses per hour.`,
        429
      );
    }

    await connectDB();

    // Create analysis record
    const analysis = await Analysis.create({
      userId: session.user.id,
      url: normalizedUrl,
      domain: extractDomain(normalizedUrl),
      status: "pending",
      progress: 0,
    });

    // Start pipeline in background (non-blocking)
    // In production, this would be dispatched to a job queue (BullMQ)
    runAnalysisPipeline(analysis._id.toString()).catch((err) => {
      console.error(`Analysis pipeline failed for ${analysis._id}:`, err);
    });

    return successResponse(
      {
        id: analysis._id.toString(),
        status: analysis.status,
        url: analysis.url,
        domain: analysis.domain,
      },
      201
    );
  } catch (err) {
    console.error("Analysis creation error:", err);
    return errorResponse("Failed to start analysis", 500);
  }
}

/** GET /api/analysis — List user's analyses */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Authentication required", 401);
    }

    await connectDB();

    const analyses = await Analysis.find({ userId: session.user.id })
      .select("url domain status progress currentStage createdAt updatedAt duration executiveSummary")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return successResponse(analyses);
  } catch (err) {
    console.error("Analysis list error:", err);
    return errorResponse("Failed to fetch analyses", 500);
  }
}
