"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Baby, Clock9 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import {
  Block,
  DEFAULT_FIRST_FEED,
  DEFAULT_INTERVAL_HOURS,
  DEFAULT_LAST_FEED,
  DEFAULT_NAME,
  findActiveBlock,
  formatDateToTimeString,
  generateSchedule,
  normalizeInterval,
  normalizeTimeInput,
} from "@/lib/schedule";
import { cn } from "@/lib/utils";

export default function ScheduleClient() {
  const searchParams = useSearchParams();

  const babyName = searchParams.get("name")?.trim() || DEFAULT_NAME;
  const firstFeed = normalizeTimeInput(searchParams.get("first"), DEFAULT_FIRST_FEED);
  const lastFeed = normalizeTimeInput(searchParams.get("last"), DEFAULT_LAST_FEED);
  const intervalHours = normalizeInterval(
    searchParams.get("interval") ?? DEFAULT_INTERVAL_HOURS
  );

  const blocks = useMemo(
    () => generateSchedule(firstFeed, intervalHours, lastFeed),
    [firstFeed, intervalHours, lastFeed]
  );

  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = () => setNow(new Date());
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const activeBlockId = useMemo(() => findActiveBlock(blocks, now), [blocks, now]);

  const visibleBlocks = useMemo(
    () => blocks.filter((block) => !block.end || block.end > now),
    [blocks, now]
  );

  const hiddenCount = blocks.length - visibleBlocks.length;
  const [showPast, setShowPast] = useState(false);
  const renderedBlocks = showPast ? blocks : visibleBlocks;
  const includesNightRoutine = blocks.some((block) => block.type === "Night Routine");

  const headingName = babyName || DEFAULT_NAME;
  const hasSchedule = renderedBlocks.length > 0;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-4 py-10">
      {/* Header */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          <Baby className="h-4 w-4" aria-hidden="true" />
          {headingName}
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Francis&apos;s Plan for Today</h1>
          <p className="text-sm text-muted-foreground">
            This is Francis&apos;s plan for today. The highlighted row shows what he should be
            doing right now, and the next row shows what&apos;s coming up.
          </p>
        </div>
      </div>

      {/* Plan card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Clock9 className="h-5 w-5 text-primary" aria-hidden="true" /> Plan Overview
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Use this as a guide for feeds, naps, and play so Francis stays on a steady routine.
          </p>
        </CardHeader>
        <CardContent>
          {/* Past blocks toggle */}
          {hiddenCount > 0 && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm">
              <p className="text-muted-foreground">
                {showPast
                  ? "Showing the earlier parts of today so you can review what already happened."
                  : `${hiddenCount} earlier part${hiddenCount === 1 ? "" : "s"} of the day hidden.`}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowPast((prev) => !prev)}
              >
                {showPast ? "Hide earlier activity" : "Show earlier activity"}
              </Button>
            </div>
          )}

          {/* Schedule table */}
          {hasSchedule ? (
            <Table>
              <TableCaption>
                Times are approximate. Staying close to this plan will help Francis stay rested,
                fed, and happy.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Activity</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderedBlocks.map((block: Block) => (
                  <TableRow
                    key={block.id}
                    className={cn(
                      block.id === activeBlockId
                        ? "border-2 border-primary/70 bg-primary/10 font-semibold shadow"
                        : "opacity-90"
                    )}
                  >
                    <TableCell className="font-medium">
                      {block.type === "Night Routine"
                        ? "Night Routine (see details below)"
                        : block.type}
                    </TableCell>
                    <TableCell>{formatDateToTimeString(block.start)}</TableCell>
                    <TableCell>{block.end ? formatDateToTimeString(block.end) : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">
              No schedule is showing right now. Please check with Francis&apos;s parents so they
              can send an updated link or today&apos;s plan.
            </p>
          )}

          {/* Night routine helper */}
          {includesNightRoutine && (
            <div className="mt-4 rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Night Routine</p>
              <p>
                This is the wind-down before bed: give him a clean diaper, put on fresh pajamas if
                needed, and choose a calming activity like a soothing book or quiet cuddles before
                the final feeding.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}