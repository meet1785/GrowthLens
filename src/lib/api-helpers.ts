import { NextResponse } from "next/server";

/**
 * Rate limiter using an in-memory sliding window.
 * For production, swap to Redis-backed implementation.
 */
const windows = new Map<string, number[]>();

export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const timestamps = windows.get(key) ?? [];

  // Remove expired entries
  const valid = timestamps.filter((t) => now - t < windowMs);

  if (valid.length >= maxRequests) {
    windows.set(key, valid);
    return false; // Rate limit exceeded
  }

  valid.push(now);
  windows.set(key, valid);
  return true; // Allowed
}

/** Standardised JSON error response */
export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  );
}

/** Standardised JSON success response */
export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json({ success: true, data }, { status });
}
