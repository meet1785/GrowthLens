import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { AI_CONFIG } from "@/config/constants";

/**
 * Singleton Gemini client instance.
 * Lazily initialized on first use so the app can boot without an API key
 * (key is only required when an analysis is actually triggered).
 */
let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error(
        "GEMINI_API_KEY is not set. Add it to your .env.local file."
      );
    }
    genAI = new GoogleGenerativeAI(key);
  }
  return genAI;
}

/**
 * Safety settings – we're analysing business websites so we relax the
 * safety thresholds slightly to avoid false positive blocks on legitimate
 * marketing copy analysis.
 */
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
];

export interface GeminiMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

/**
 * Send a prompt to Gemini and return the text response.
 * Includes the system-level instruction automatically.
 */
export async function generateAnalysis(
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  const client = getClient();

  const model = client.getGenerativeModel({
    model: AI_CONFIG.model,
    safetySettings,
    systemInstruction:
      systemInstruction ?? AI_CONFIG.systemPromptPrefix,
    generationConfig: {
      temperature: AI_CONFIG.temperature,
      maxOutputTokens: AI_CONFIG.maxOutputTokens,
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  return text;
}

/**
 * Send a prompt to Gemini and return text (non-JSON) response.
 */
export async function generateText(
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  const client = getClient();

  const model = client.getGenerativeModel({
    model: AI_CONFIG.model,
    safetySettings,
    systemInstruction:
      systemInstruction ?? AI_CONFIG.systemPromptPrefix,
    generationConfig: {
      temperature: AI_CONFIG.temperature,
      maxOutputTokens: AI_CONFIG.maxOutputTokens,
    },
  });

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  return text;
}

/**
 * Parse a JSON response from Gemini, handling markdown code fences.
 */
export function parseGeminiJSON<T>(raw: string): T {
  // Strip markdown code fences if present
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  return JSON.parse(cleaned) as T;
}
