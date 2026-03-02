import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Analysis from "@/models/Analysis";
import { errorResponse, successResponse } from "@/lib/api-helpers";

/** GET /api/analysis/trends — Get score trends grouped by domain */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Authentication required", 401);
    }

    await connectDB();

    // Find all completed analyses for this user, grouped by domain
    const analyses = await Analysis.find({
      userId: session.user.id,
      status: "completed",
    })
      .select("domain uxAnalysis.overallScore conversionAnalysis.funnelScore monetizationAnalysis.monetizationScore createdAt")
      .sort({ createdAt: 1 })
      .lean();

    // Group by domain
    const trends: Record<string, { dates: string[]; ux: number[]; conversion: number[]; monetization: number[] }> = {};

    for (const a of analyses) {
      const domain = a.domain as string;
      if (!trends[domain]) {
        trends[domain] = { dates: [], ux: [], conversion: [], monetization: [] };
      }

      const uxScore = (a.uxAnalysis as { overallScore?: number } | null)?.overallScore;
      const convScore = (a.conversionAnalysis as { funnelScore?: number } | null)?.funnelScore;
      const monScore = (a.monetizationAnalysis as { monetizationScore?: number } | null)?.monetizationScore;

      trends[domain].dates.push(a.createdAt.toISOString());
      trends[domain].ux.push(uxScore ?? 0);
      trends[domain].conversion.push(convScore ?? 0);
      trends[domain].monetization.push(monScore ?? 0);
    }

    return successResponse(trends);
  } catch (err) {
    console.error("Trends fetch error:", err);
    return errorResponse("Failed to fetch trends", 500);
  }
}
