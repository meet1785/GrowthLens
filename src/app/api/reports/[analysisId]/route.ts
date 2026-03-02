import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Analysis from "@/models/Analysis";
import { generateMarkdownReport } from "@/services/report-generator";
import { errorResponse } from "@/lib/api-helpers";
import type { Analysis as AnalysisType } from "@/types";

/** GET /api/reports/[analysisId] — Generate and download a report */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ analysisId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Authentication required", 401);
    }

    const { analysisId } = await params;
    const format = req.nextUrl.searchParams.get("format") ?? "markdown";

    await connectDB();

    const analysis = await Analysis.findOne({
      _id: analysisId,
      userId: session.user.id,
      status: "completed",
    }).lean();

    if (!analysis) {
      return errorResponse("Completed analysis not found", 404);
    }

    const analysisData = {
      ...analysis,
      _id: analysis._id.toString(),
    } as unknown as AnalysisType;

    if (format === "markdown") {
      const markdown = generateMarkdownReport(analysisData);
      return new Response(markdown, {
        headers: {
          "Content-Type": "text/markdown",
          "Content-Disposition": `attachment; filename="growthlens-report-${analysis.domain}.md"`,
        },
      });
    }

    if (format === "json") {
      return new Response(JSON.stringify(analysisData, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="growthlens-report-${analysis.domain}.json"`,
        },
      });
    }

    // Default: return structured report data for web rendering
    const markdown = generateMarkdownReport(analysisData);
    return Response.json({
      success: true,
      data: {
        markdown,
        analysis: analysisData,
      },
    });
  } catch (err) {
    console.error("Report generation error:", err);
    return errorResponse("Failed to generate report", 500);
  }
}
