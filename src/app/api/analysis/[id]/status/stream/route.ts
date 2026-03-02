import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Analysis from "@/models/Analysis";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let closed = false;

      const send = (event: string, payload: unknown) => {
        if (closed) return;
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`)
        );
      };

      const loadStatus = async () => {
        const analysis = await Analysis.findOne({
          _id: id,
          userId: session.user.id,
        })
          .select("status progress currentStage error")
          .lean();

        if (!analysis) {
          send("error", { message: "Analysis not found" });
          closed = true;
          controller.close();
          return null;
        }

        const payload = {
          status: analysis.status,
          progress: analysis.progress,
          currentStage: analysis.currentStage,
          error: analysis.error,
        };

        send("status", payload);
        return payload;
      };

      try {
        const initial = await loadStatus();
        if (!initial) return;

        if (
          initial.status === "completed" ||
          initial.status === "failed"
        ) {
          send("done", initial);
          closed = true;
          controller.close();
          return;
        }

        const interval = setInterval(async () => {
          if (closed) {
            clearInterval(interval);
            return;
          }

          try {
            const current = await loadStatus();
            if (!current) {
              clearInterval(interval);
              return;
            }

            if (
              current.status === "completed" ||
              current.status === "failed"
            ) {
              send("done", current);
              closed = true;
              clearInterval(interval);
              controller.close();
            }
          } catch {
            send("error", { message: "Failed to stream status" });
            closed = true;
            clearInterval(interval);
            controller.close();
          }
        }, 2000);

        req.signal.addEventListener("abort", () => {
          if (closed) return;
          closed = true;
          clearInterval(interval);
          controller.close();
        });
      } catch {
        send("error", { message: "Failed to start status stream" });
        closed = true;
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}