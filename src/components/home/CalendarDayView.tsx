import { useState, useRef, useEffect } from "react";
import { format, addDays, subDays, isSameDay, isToday } from "date-fns";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";

interface Task {
  id: string;
  title: string;
  icon: string;
  startTime: string;
  endTime: string;
  color: string;
  customer?: string;
  location?: string;
}

const taskColors = [
  "bg-blue-50 border-blue-200 text-blue-900",
  "bg-amber-50 border-amber-200 text-amber-900",
  "bg-green-50 border-green-200 text-green-900",
  "bg-purple-50 border-purple-200 text-purple-900",
  "bg-pink-50 border-pink-200 text-pink-900",
  "bg-orange-50 border-orange-200 text-orange-900",
];

const generateMockTasks = (date: Date): Task[] => {
  if (isToday(date)) {
    return [
      { id: "t1", title: "Tap Repair", icon: "🔧", startTime: "08:00", endTime: "09:30", color: taskColors[0], customer: "Emily R.", location: "Amsterdam Centrum" },
      { id: "t2", title: "Light Switch Install", icon: "💡", startTime: "10:00", endTime: "11:00", color: taskColors[1], customer: "Mark T.", location: "De Pijp" },
      { id: "t3", title: "Drain Unblocking", icon: "🚿", startTime: "13:00", endTime: "14:30", color: taskColors[2], customer: "David K.", location: "Oud-West" },
      { id: "t4", title: "Wall Painting", icon: "🎨", startTime: "15:00", endTime: "17:00", color: taskColors[3], customer: "Hannah P.", location: "Amstelveen" },
    ];
  }
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0) return [];
  if (dayOfWeek === 6) {
    return [
      { id: "s1", title: "Emergency Plumbing", icon: "🔧", startTime: "09:00", endTime: "10:30", color: taskColors[4], customer: "John D.", location: "Jordaan" },
    ];
  }
  return [
    { id: `d${dayOfWeek}-1`, title: "Bathroom Tiling", icon: "🛁", startTime: "09:00", endTime: "11:00", color: taskColors[2], customer: "Sarah L.", location: "Jordaan" },
    { id: `d${dayOfWeek}-2`, title: "Electrical Wiring", icon: "⚡", startTime: "12:00", endTime: "13:30", color: taskColors[1], customer: "Tom B.", location: "De Pijp" },
    { id: `d${dayOfWeek}-3`, title: "Cabinet Fitting", icon: "🪚", startTime: "14:30", endTime: "16:00", color: taskColors[5], customer: "Lisa M.", location: "Centrum" },
  ];
};

const hours = Array.from({ length: 13 }, (_, i) => i + 7); // 7AM - 7PM

const timeToOffset = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return (h - 7) * 60 + m; // minutes from 7AM
};

const CalendarDayView = () => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dateScrollRef = useRef<HTMLDivElement>(null);

  // Generate 15 days centered around today
  const dates = Array.from({ length: 15 }, (_, i) => addDays(subDays(today, 7), i));
  const tasks = generateMockTasks(selectedDate);

  const currentTimeOffset = (() => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    if (h < 7 || h > 19) return null;
    return (h - 7) * 60 + m;
  })();

  // Scroll to current time on mount
  useEffect(() => {
    if (scrollRef.current && currentTimeOffset !== null) {
      scrollRef.current.scrollTop = (currentTimeOffset / 60) * 56 - 40;
    }
  }, []);

  // Center selected date in scroll
  useEffect(() => {
    if (dateScrollRef.current) {
      const idx = dates.findIndex((d) => isSameDay(d, selectedDate));
      const el = dateScrollRef.current.children[idx] as HTMLElement;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [selectedDate]);

  return (
    <div className="flex flex-col">
      {/* Horizontal date strip */}
      <div className="pb-3">
        <div
          ref={dateScrollRef}
          className="flex gap-1 overflow-x-auto no-scrollbar py-1"
        >
          {dates.map((date) => {
            const selected = isSameDay(date, selectedDate);
            const todayDate = isToday(date);
            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`flex flex-col items-center min-w-[44px] py-2 px-1.5 rounded-xl transition-all ${
                  selected
                    ? "bg-primary text-primary-foreground"
                    : todayDate
                    ? "bg-primary/10"
                    : ""
                }`}
              >
                <span className={`text-[10px] font-medium ${selected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {format(date, "EEE")}
                </span>
                <span className={`text-base font-bold mt-0.5 ${selected ? "text-primary-foreground" : "text-foreground"}`}>
                  {format(date, "d")}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Day header */}
      <div className="px-4 pb-2 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">
            {format(selectedDate, "EEEE, d MMMM yyyy")}
            {isToday(selectedDate) && <span className="text-muted-foreground font-normal"> (Today)</span>}
          </h3>
        </div>
        <span className="text-xs font-semibold text-primary">
          • {tasks.length} {tasks.length === 1 ? "Task" : "Tasks"}
        </span>
      </div>

      {/* Timeline */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-2 pb-20 relative"
        style={{ minHeight: 0 }}
      >
        <div className="relative" style={{ height: hours.length * 56 }}>
          {/* Hour lines */}
          {hours.map((hour, i) => (
            <div
              key={hour}
              className="absolute left-0 right-0 flex items-start"
              style={{ top: i * 56 }}
            >
              <div className="w-12 shrink-0 pr-2 text-right -mt-1.5">
                <span className="text-[10px] font-semibold text-muted-foreground">
                  {hour <= 12 ? `${hour} AM` : `${hour - 12} PM`}
                </span>
              </div>
              <div className="flex-1 border-t border-border/50" />
            </div>
          ))}

          {/* Current time indicator */}
          {isToday(selectedDate) && currentTimeOffset !== null && (
            <div
              className="absolute left-10 right-0 z-20 flex items-center"
              style={{ top: (currentTimeOffset / 60) * 56 }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-destructive -ml-1.5" />
              <div className="flex-1 h-[2px] bg-destructive" />
              <span className="text-[9px] font-bold text-destructive bg-background px-1 rounded ml-1">
                {format(new Date(), "h:mm a")}
              </span>
            </div>
          )}

          {/* Task cards */}
          {tasks.map((task) => {
            const top = (timeToOffset(task.startTime) / 60) * 56;
            const height = ((timeToOffset(task.endTime) - timeToOffset(task.startTime)) / 60) * 56;
            return (
              <div
                key={task.id}
                className={`absolute left-12 right-2 rounded-xl border px-3 py-2 z-10 transition-all active:scale-[0.98] cursor-pointer ${task.color}`}
                style={{ top: top + 2, height: Math.max(height - 4, 36) }}
              >
                <div className="flex items-start justify-between h-full">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{task.icon}</span>
                      <span className="text-[12px] font-bold truncate">{task.title}</span>
                    </div>
                    <p className="text-[10px] opacity-70 mt-0.5">
                      {task.startTime} – {task.endTime}
                    </p>
                    {height > 50 && task.customer && (
                      <p className="text-[10px] opacity-60 mt-0.5 truncate">
                        {task.customer} · {task.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty state */}
          {tasks.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm font-semibold text-muted-foreground">No tasks scheduled</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Accept jobs to fill your day</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <button className="absolute bottom-24 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-foreground shadow-lg active:scale-95 transition-transform">
        <Plus className="h-5 w-5 text-background" />
      </button>
    </div>
  );
};

export default CalendarDayView;
