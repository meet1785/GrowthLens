import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Analysis from "@/models/Analysis";
import { errorResponse, successResponse } from "@/lib/api-helpers";

/** GET /api/analysis/[id]/status — Lightweight polling endpoint for progress */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Authentication required", 401);
    }

    const { id } = await params;

    await connectDB();

    const analysis = await Analysis.findOne({
      _id: id,
      userId: session.user.id,
    })
      .select("status progress currentStage error")
      .lean();

    if (!analysis) {
      return errorResponse("Analysis not found", 404);
    }

    return successResponse({
      status: analysis.status,
      progress: analysis.progress,
      currentStage: analysis.currentStage,
      error: analysis.error,
    });
  } catch (err) {
    console.error("Status check error:", err);
    return errorResponse("Failed to check status", 500);
  }
}
