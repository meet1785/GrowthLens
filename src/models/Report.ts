import mongoose, { Schema, Document, Model } from "mongoose";
import type { Recommendation } from "@/types";

export interface IReport extends Document {
  analysisId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  executiveSummary: string;
  uxFindings: string;
  growthBottlenecks: string;
  monetizationInsights: string;
  topActions: Recommendation[];
  format: "web" | "markdown" | "pdf";
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    analysisId: {
      type: Schema.Types.ObjectId,
      ref: "Analysis",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    executiveSummary: {
      type: String,
      required: true,
    },
    uxFindings: {
      type: String,
      required: true,
    },
    growthBottlenecks: {
      type: String,
      required: true,
    },
    monetizationInsights: {
      type: String,
      required: true,
    },
    topActions: {
      type: Schema.Types.Mixed,
      default: [],
    },
    format: {
      type: String,
      enum: ["web", "markdown", "pdf"],
      default: "web",
    },
  },
  {
    timestamps: true,
  }
);

ReportSchema.index({ userId: 1, createdAt: -1 });

const Report: Model<IReport> =
  mongoose.models.Report || mongoose.model<IReport>("Report", ReportSchema);

export default Report;
