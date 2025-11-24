"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 p-6 text-center">
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          Francis&apos;s Baby HQ
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Build and share Francis&apos;s daily schedule.
        </h1>
        <p className="text-base text-muted-foreground sm:text-lg">
          Configure feeding intervals, naps, and play blocks, then send a live-updating link to any
          caregiver. The schedule itself lives on its own page for easy sharing.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/admin">Open Admin Builder</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/schedule?name=Francis&first=07:00&interval=3&last=19:00">
              View Default Day
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How it works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-left text-sm text-muted-foreground">
          <p>
            1. Visit the schedule page to tweak Francis&apos;s name, first feed, interval, and last
            feed.
          </p>
          <p>2. Click &ldquo;Generate Schedule&rdquo; to build the timeline for today.</p>
          <p>
            3. Hit &ldquo;Update Shareable Link&rdquo; so the URL encodes the steps. We&apos;ll copy
            it to your clipboard automatically.
          </p>
          <p>
            4. Share that URL with anyone caring for Francis—they&apos;ll see the same schedule and
            a row highlighted to show what&apos;s happening right now.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
