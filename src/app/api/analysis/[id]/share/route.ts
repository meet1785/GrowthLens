import { NextRequest } from "next/server";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Analysis from "@/models/Analysis";
import { errorResponse, successResponse } from "@/lib/api-helpers";

/** POST /api/analysis/[id]/share — Generate or retrieve a share token */
export async function POST(
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
      status: "completed",
    });

    if (!analysis) {
      return errorResponse("Completed analysis not found", 404);
    }

    // Generate token if not already present
    if (!analysis.shareToken) {
      analysis.shareToken = crypto.randomBytes(24).toString("base64url");
      await analysis.save();
    }

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin}/share/${analysis.shareToken}`;

    return successResponse({
      shareToken: analysis.shareToken,
      shareUrl,
    });
  } catch (err) {
    console.error("Share token error:", err);
    return errorResponse("Failed to generate share link", 500);
  }
}

/** DELETE /api/analysis/[id]/share — Revoke share token */
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

    await Analysis.updateOne(
      { _id: id, userId: session.user.id },
      { $unset: { shareToken: 1 } }
    );

    return successResponse({ revoked: true });
  } catch (err) {
    console.error("Revoke share error:", err);
    return errorResponse("Failed to revoke share link", 500);
  }
}
