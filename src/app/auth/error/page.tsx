"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-void)] bg-grid flex items-center justify-center px-4 relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-500/[0.04] rounded-full blur-[100px] pointer-events-none" />

      <Card className="max-w-md w-full relative z-10 animate-scale-in">
        <CardContent className="p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-red-400" />
          </div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            Authentication Error
          </h1>
          <p className="text-[var(--text-muted)] mb-6 text-sm">
            Something went wrong during authentication. Please try again.
          </p>
          <Link href="/auth/signin">
            <Button variant="primary" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
