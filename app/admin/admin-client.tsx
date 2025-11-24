"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function AdminClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  const initialName = searchParams.get("name")?.trim() || DEFAULT_NAME;
  const initialFirstFeed = normalizeTimeInput(
    searchParams.get("first"),
    DEFAULT_FIRST_FEED
  );
  const initialLastFeed = normalizeTimeInput(searchParams.get("last"), DEFAULT_LAST_FEED);
  const initialInterval = normalizeInterval(searchParams.get("interval"));
  const hasURLConfig = queryString.length > 0;

  const [babyName, setBabyName] = useState(initialName);
  const [firstFeed, setFirstFeed] = useState(initialFirstFeed);
  const [intervalInput, setIntervalInput] = useState(initialInterval.toString());
  const [lastFeed, setLastFeed] = useState(initialLastFeed);
  const [blocks, setBlocks] = useState<Block[] | null>(() =>
    hasURLConfig ? generateSchedule(initialFirstFeed, initialInterval, initialLastFeed) : null
  );
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!hasURLConfig) {
      return;
    }

    setBabyName(initialName);
    setFirstFeed(initialFirstFeed);
    setIntervalInput(initialInterval.toString());
    setLastFeed(initialLastFeed);
    setBlocks(generateSchedule(initialFirstFeed, initialInterval, initialLastFeed));
  }, [
    hasURLConfig,
    initialFirstFeed,
    initialInterval,
    initialLastFeed,
    initialName,
    queryString,
  ]);

  useEffect(() => {
    if (!shareFeedback) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setShareFeedback(null), 2500);
    return () => window.clearTimeout(timeoutId);
  }, [shareFeedback]);

  useEffect(() => {
    if (!blocks || blocks.length === 0) {
      setActiveBlockId(null);
      return undefined;
    }

    const updateActive = () => {
      setActiveBlockId(findActiveBlock(blocks, new Date()));
    };

    updateActive();
    const intervalId = window.setInterval(updateActive, 60000);

    return () => window.clearInterval(intervalId);
  }, [blocks]);

  const handleGenerateSchedule = () => {
    const intervalHours = normalizeInterval(intervalInput);
    const nextBlocks = generateSchedule(firstFeed, intervalHours, lastFeed);
    setBlocks(nextBlocks);
  };

  const handleUpdateShareableLink = async () => {
    const sanitizedName = babyName.trim() || DEFAULT_NAME;
    const intervalHours = normalizeInterval(intervalInput);
    const params = new URLSearchParams();
    params.set("name", sanitizedName);
    params.set("first", firstFeed);
    params.set("interval", intervalHours.toString());
    params.set("last", lastFeed);

    router.replace(`${pathname}?${params.toString()}`);

    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/schedule?${params.toString()}`;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(url);
          setShareFeedback("Link updated & copied!");
          return;
        }
      } catch (error) {
        console.warn("Unable to copy link", error);
      }
      setShareFeedback("Link updated!");
    } else {
      setShareFeedback("Link updated!");
    }
  };

  const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleGenerateSchedule();
  };

  const headingName = babyName.trim() || DEFAULT_NAME;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-4 py-10">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Admin</p>
          <h1 className="text-3xl font-semibold tracking-tight">Configure Schedule</h1>
          <p className="text-sm text-muted-foreground">
            Update Francis&apos;s settings, preview the timeline, then share the generated link with
            caregivers. They only see the /schedule page.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/schedule">Open schedule view</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schedule Settings</CardTitle>
          <p className="text-sm text-muted-foreground">
            Adjust the key timings, generate the schedule, then update the shareable link. We copy
            the final /schedule URL for you.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={onFormSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Baby Name</Label>
                <Input
                  id="name"
                  value={babyName}
                  onChange={(event) => setBabyName(event.target.value)}
                  placeholder="Francis"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="first-feed">First Feed Time</Label>
                <Input
                  id="first-feed"
                  type="time"
                  value={firstFeed}
                  onChange={(event) => setFirstFeed(event.target.value)}
                  step={300}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interval">Feed Interval (hours)</Label>
                <Input
                  id="interval"
                  type="number"
                  min="1"
                  step="0.5"
                  value={intervalInput}
                  onChange={(event) => setIntervalInput(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-feed">Last Feed Time</Label>
                <Input
                  id="last-feed"
                  type="time"
                  value={lastFeed}
                  onChange={(event) => setLastFeed(event.target.value)}
                  step={300}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="submit">Generate Schedule</Button>
              <Button type="button" variant="secondary" onClick={handleUpdateShareableLink}>
                Update Shareable Link
              </Button>
            </div>
            {shareFeedback && (
              <p className="text-right text-sm text-muted-foreground">{shareFeedback}</p>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily Schedule Preview for {headingName}</CardTitle>
          <p className="text-sm text-muted-foreground">
            This is what caregivers see on /schedule once you share the link.
          </p>
        </CardHeader>
        <CardContent>
          {blocks && blocks.length > 0 ? (
            <Table>
              <TableCaption>
                Preview updates every minute so you can verify the highlighted block.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Block Type</TableHead>
                  <TableHead>Baby</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blocks.map((block) => (
                  <TableRow
                    key={block.id}
                    className={cn(block.id === activeBlockId && "bg-muted")}
                  >
                    <TableCell>{formatDateToTimeString(block.start)}</TableCell>
                    <TableCell>
                      {block.end ? formatDateToTimeString(block.end) : "—"}
                    </TableCell>
                    <TableCell>{block.type}</TableCell>
                    <TableCell>{headingName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">
              No schedule generated yet. Adjust the settings and click "Generate Schedule".
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
