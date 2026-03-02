import mongoose, { Schema, Document, Model } from "mongoose";
import type {
  AnalysisStatus,
  CrawlData,
  UXAnalysis,
  ConversionAnalysis,
  MonetizationAnalysis,
  BenchmarkAnalysis,
  Recommendation,
} from "@/types";

export interface IAnalysis extends Document {
  userId: mongoose.Types.ObjectId;
  url: string;
  domain: string;
  status: AnalysisStatus;
  progress: number;
  currentStage?: string;
  crawlData?: CrawlData;
  uxAnalysis?: UXAnalysis;
  conversionAnalysis?: ConversionAnalysis;
  monetizationAnalysis?: MonetizationAnalysis;
  benchmarkAnalysis?: BenchmarkAnalysis;
  recommendations?: Recommendation[];
  executiveSummary?: string;
  shareToken?: string;
  error?: string;
  duration?: number; // Total analysis time in ms
  createdAt: Date;
  updatedAt: Date;
}

const RecommendationSchema = new Schema(
  {
    rank: { type: Number, required: true },
    title: { type: String, required: true },
    problem: { type: String, required: true },
    whyItMatters: { type: String, required: true },
    whatToChange: { type: String, required: true },
    expectedImpact: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true,
    },
    effort: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },
    category: {
      type: String,
      enum: ["ux", "conversion", "monetization", "technical"],
      required: true,
    },
    evidence: [{ type: String }],
    roiScore: { type: Number, min: 1, max: 10 },
  },
  { _id: false }
);

const AnalysisSchema = new Schema<IAnalysis>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: [true, "URL is required"],
      trim: true,
    },
    domain: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "crawling", "analyzing", "completed", "failed"],
      default: "pending",
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    currentStage: {
      type: String,
      default: null,
    },
    crawlData: {
      type: Schema.Types.Mixed,
      default: null,
    },
    uxAnalysis: {
      type: Schema.Types.Mixed,
      default: null,
    },
    conversionAnalysis: {
      type: Schema.Types.Mixed,
      default: null,
    },
    monetizationAnalysis: {
      type: Schema.Types.Mixed,
      default: null,
    },
    benchmarkAnalysis: {
      type: Schema.Types.Mixed,
      default: null,
    },
    recommendations: {
      type: [RecommendationSchema],
      default: [],
    },
    executiveSummary: {
      type: String,
      default: null,
    },
    error: {
      type: String,
      default: null,
    },
    duration: {
      type: Number,
      default: null,
    },
    shareToken: {
      type: String,
      default: null,
      index: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
AnalysisSchema.index({ userId: 1, createdAt: -1 });
AnalysisSchema.index({ status: 1 });
AnalysisSchema.index({ domain: 1 });

const Analysis: Model<IAnalysis> =
  mongoose.models.Analysis ||
  mongoose.model<IAnalysis>("Analysis", AnalysisSchema);

export default Analysis;
