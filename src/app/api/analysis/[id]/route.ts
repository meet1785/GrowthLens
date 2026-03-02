import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Analysis from "@/models/Analysis";
import { errorResponse, successResponse } from "@/lib/api-helpers";

/** GET /api/analysis/[id] — Get a single analysis with full data */
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
    }).lean();

    if (!analysis) {
      return errorResponse("Analysis not found", 404);
    }

    return successResponse(analysis);
  } catch (err) {
    console.error("Analysis fetch error:", err);
    return errorResponse("Failed to fetch analysis", 500);
  }
}

/** DELETE /api/analysis/[id] — Delete an analysis */
export async function DELETE(
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

    const result = await Analysis.deleteOne({
      _id: id,
      userId: session.user.id,
    });

    if (result.deletedCount === 0) {
      return errorResponse("Analysis not found", 404);
    }

    return successResponse({ deleted: true });
  } catch (err) {
    console.error("Analysis delete error:", err);
    return errorResponse("Failed to delete analysis", 500);
  }
}
