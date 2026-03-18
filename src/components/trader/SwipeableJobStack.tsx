import { useState, useRef } from "react";
import IncomingJobCard, { IncomingJobData, JobCardViewMode } from "./IncomingJobCard";

interface SwipeableJobStackProps {
  jobs: IncomingJobData[];
  onViewDetail: (id: string) => void;
  onDecline: (id: string) => void;
  onViewAll: () => void;
  viewMode?: JobCardViewMode;
}

const SwipeableJobStack = ({
  jobs, onViewDetail, onDecline, onViewAll, viewMode = "agency",
}: SwipeableJobStackProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontal = useRef<boolean | null>(null);

  const visibleJobs = jobs.slice(currentIndex, currentIndex + 2);

  const handleStart = (clientX: number, clientY: number) => {
    startX.current = clientX;
    startY.current = clientY;
    isHorizontal.current = null;
    setIsSwiping(true);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isSwiping) return;
    const dx = clientX - startX.current;
    const dy = clientY - startY.current;

    if (isHorizontal.current === null && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      isHorizontal.current = Math.abs(dx) > Math.abs(dy);
    }

    if (isHorizontal.current) {
      setSwipeX(dx);
    }
  };

  const handleEnd = () => {
    if (!isSwiping) return;
    setIsSwiping(false);
    const threshold = 80;

    if (Math.abs(swipeX) > threshold && jobs.length > 1) {
      // Cycle to next card (wraps around)
      setCurrentIndex((prev) => (prev + 1) % jobs.length);
    }
    setSwipeX(0);
    isHorizontal.current = null;
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => handleStart(e.touches[0].clientX, e.touches[0].clientY);
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isHorizontal.current) e.preventDefault();
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
  };
  const handleTouchEnd = () => handleEnd();

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };
  const handleMouseMove = (e: React.MouseEvent) => handleMove(e.clientX, e.clientY);
  const handleMouseUp = () => handleEnd();
  const handleMouseLeave = () => { if (isSwiping) handleEnd(); };

  if (jobs.length === 0) return null;

  const topJob = visibleJobs[0];
  const behindJob = visibleJobs[1];
  const isExpanded = expandedId === topJob?.id;

  return (
    <div>
      {/* Card stack — top card is in flow, behind card peeks below */}
      <div className="relative">
        {/* Behind card (if exists) — peek below */}
        {behindJob && !isExpanded && (
          <div
            className="absolute left-2 right-2 top-2 z-0"
            style={{
              transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            <IncomingJobCard
              job={behindJob}
              expanded={false}
              onToggleExpand={() => {}}
              onAccept={() => {}}
              onDecline={() => {}}
              viewMode={viewMode}
            />
          </div>
        )}

        {/* Top card — in normal flow */}
        {topJob && (
          <div
            className="relative z-10 cursor-grab active:cursor-grabbing select-none"
            style={{
              transform: `translateX(${swipeX}px) rotate(${swipeX * 0.04}deg)`,
              opacity: 1 - Math.min(Math.abs(swipeX) / 300, 0.4),
              transition: isSwiping ? "none" : "all 0.3s cubic-bezier(0.4,0,0.2,1)",
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            <IncomingJobCard
              job={topJob}
              expanded={isExpanded}
              onToggleExpand={() => onToggleExpand(topJob.id)}
              onAccept={() => onAccept(topJob.id)}
              onDecline={() => onDecline(topJob.id)}
              onPlayVoice={() => onPlayVoice(topJob.customer)}
              viewMode={viewMode}
            />
          </div>
        )}

        {/* Behind card shadow hint */}
        {behindJob && !isExpanded && (
          <div className="h-2" />
        )}
      </div>

      {/* Dot indicators */}
      <div className="mt-3 flex items-center justify-center">
        <div className="flex items-center gap-1.5">
          {jobs.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === currentIndex
                  ? "w-4 bg-primary"
                  : i < currentIndex
                  ? "w-1.5 bg-primary/30"
                  : "w-1.5 bg-muted-foreground/20"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SwipeableJobStack;
