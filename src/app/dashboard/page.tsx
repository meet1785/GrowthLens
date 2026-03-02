import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import Analysis from "@/models/Analysis";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  await connectDB();

  const analyses = await Analysis.find({ userId: session.user.id })
    .select("url domain status progress currentStage createdAt updatedAt duration")
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  // Serialize for client
  const serialized = analyses.map((a) => ({
    _id: a._id.toString(),
    url: a.url,
    domain: a.domain,
    status: a.status,
    progress: a.progress,
    currentStage: a.currentStage ?? null,
    createdAt: a.createdAt.toISOString(),
    duration: a.duration ?? null,
  }));

  return (
    <DashboardClient
      userName={session.user.name ?? "User"}
      analyses={serialized}
    />
  );
}
