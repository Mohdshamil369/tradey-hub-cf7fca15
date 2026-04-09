import { useState, useRef, useEffect, useMemo } from "react";
import { format, addDays, subDays, isSameDay, isToday, startOfDay } from "date-fns";
import { MapPin, Clock, Eye, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Task {
  id: string;
  title: string;
  icon: string;
  startTime: string;
  endTime: string;
  colorBg: string;
  colorBorder: string;
  colorAccent: string;
  customer?: string;
  location?: string;
  jobId?: string;
}

const taskStyles = [
  { colorBg: "bg-blue-50", colorBorder: "border-blue-200", colorAccent: "text-blue-700" },
  { colorBg: "bg-amber-50", colorBorder: "border-amber-200", colorAccent: "text-amber-700" },
  { colorBg: "bg-green-50", colorBorder: "border-green-200", colorAccent: "text-green-700" },
  { colorBg: "bg-purple-50", colorBorder: "border-purple-200", colorAccent: "text-purple-700" },
  { colorBg: "bg-pink-50", colorBorder: "border-pink-200", colorAccent: "text-pink-700" },
  { colorBg: "bg-orange-50", colorBorder: "border-orange-200", colorAccent: "text-orange-700" },
];

const generateMockTasks = (date: Date): Task[] => {
  if (isToday(date)) {
    return [
      { id: "t1", title: "Tap Repair", icon: "🔧", startTime: "08:00", endTime: "09:30", ...taskStyles[0], customer: "Emily R.", location: "Amsterdam Centrum", jobId: "j1" },
      { id: "t2", title: "Light Switch Install", icon: "💡", startTime: "10:00", endTime: "11:00", ...taskStyles[1], customer: "Mark T.", location: "De Pijp", jobId: "j2" },
      { id: "t3", title: "Drain Unblocking", icon: "🚿", startTime: "13:00", endTime: "14:30", ...taskStyles[2], customer: "David K.", location: "Oud-West", jobId: "j4" },
      { id: "t4", title: "Wall Painting", icon: "🎨", startTime: "15:00", endTime: "17:00", ...taskStyles[3], customer: "Hannah P.", location: "Amstelveen", jobId: "j5" },
    ];
  }
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0) return [];
  if (dayOfWeek === 6) {
    return [
      { id: "s1", title: "Emergency Plumbing", icon: "🔧", startTime: "09:00", endTime: "10:30", ...taskStyles[4], customer: "John D.", location: "Jordaan" },
    ];
  }
  return [
    { id: `d${dayOfWeek}-1`, title: "Bathroom Tiling", icon: "🛁", startTime: "09:00", endTime: "11:00", ...taskStyles[2], customer: "Sarah L.", location: "Jordaan" },
    { id: `d${dayOfWeek}-2`, title: "Electrical Wiring", icon: "⚡", startTime: "12:00", endTime: "13:30", ...taskStyles[1], customer: "Tom B.", location: "De Pijp" },
    { id: `d${dayOfWeek}-3`, title: "Cabinet Fitting", icon: "🪚", startTime: "14:30", endTime: "16:00", ...taskStyles[5], customer: "Lisa M.", location: "Centrum" },
  ];
};

const formatTime = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${m.toString().padStart(2, "0")} ${suffix}`;
};

const formatHourLabel = (hour: number) => {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
};

const timeToMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const HOUR_HEIGHT = 72; // px per hour
const START_HOUR = 7;
const END_HOUR = 19;
const TOTAL_HOURS = END_HOUR - START_HOUR;
const hours = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => i + START_HOUR);

const CalendarDayView = () => {
  const navigate = useNavigate();
  const today = useMemo(() => startOfDay(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const dateScrollRef = useRef<HTMLDivElement>(null);

  const dates = useMemo(
    () => Array.from({ length: 15 }, (_, i) => addDays(subDays(today, 7), i)),
    [today]
  );

  const tasks = generateMockTasks(selectedDate);

  const currentHour = (() => {
    const now = new Date();
    if (!isToday(selectedDate)) return null;
    const h = now.getHours();
    const m = now.getMinutes();
    if (h < START_HOUR || h > END_HOUR) return null;
    return { hour: h, minutes: m };
  })();

  // Current time position in px from top
  const currentTimeTop = currentHour
    ? ((currentHour.hour - START_HOUR) * 60 + currentHour.minutes) / 60 * HOUR_HEIGHT
    : null;

  useEffect(() => {
    if (dateScrollRef.current) {
      const idx = dates.findIndex((d) => isSameDay(d, selectedDate));
      if (idx >= 0) {
        const el = dateScrollRef.current.children[idx] as HTMLElement;
        if (el) {
          el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        }
      }
    }
  }, [selectedDate, dates]);

  const handleViewTask = (task: Task) => {
    if (task.jobId) {
      navigate(`/trader/jobs/${task.jobId}`);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Horizontal date strip */}
      <div className="pb-3">
        <div
          ref={dateScrollRef}
          className="flex gap-1 overflow-x-auto py-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
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
      <div className="pb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">
          {format(selectedDate, "EEEE, d MMMM yyyy")}
          {isToday(selectedDate) && <span className="text-muted-foreground font-normal"> (Today)</span>}
        </h3>
        <span className="text-xs font-semibold text-primary">
          • {tasks.length} {tasks.length === 1 ? "Task" : "Tasks"}
        </span>
      </div>

      {/* Timeline */}
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <Calendar className="mb-2 h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm font-semibold text-muted-foreground">No tasks scheduled</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Accept jobs to fill your day</p>
        </div>
      ) : (
        <div className="flex gap-3">
          {/* Hour labels column */}
          <div className="shrink-0 w-14" style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}>
            {hours.map((hour, i) => (
              <div
                key={hour}
                className="text-right pr-1"
                style={{ height: i < TOTAL_HOURS ? HOUR_HEIGHT : 0 }}
              >
                <span className={`text-[11px] font-semibold ${
                  currentHour && currentHour.hour === hour ? "text-destructive" : "text-muted-foreground"
                }`}>
                  {formatHourLabel(hour)}
                </span>
              </div>
            ))}
          </div>

          {/* Timeline content — relative container with absolute task cards */}
          <div
            className="flex-1 relative border-l border-border/50"
            style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}
          >
            {/* Hour grid lines */}
            {hours.map((hour, i) => (
              <div
                key={hour}
                className="absolute left-0 right-0 border-t border-border/20"
                style={{ top: i * HOUR_HEIGHT }}
              />
            ))}

            {/* Current time indicator */}
            {currentTimeTop !== null && (
              <div
                className="absolute left-0 right-0 z-20 flex items-center"
                style={{ top: currentTimeTop }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-destructive -ml-[5px]" />
                <div className="flex-1 h-[2px] bg-destructive" />
              </div>
            )}

            {/* Task cards — absolutely positioned */}
            {tasks.map((task) => {
              const startMin = timeToMinutes(task.startTime);
              const endMin = timeToMinutes(task.endTime);
              const originMin = START_HOUR * 60;
              const top = ((startMin - originMin) / 60) * HOUR_HEIGHT;
              const height = ((endMin - startMin) / 60) * HOUR_HEIGHT;
              // Leave 4px padding top/bottom so cards don't touch grid lines
              const cardPadding = 4;

              return (
                <div
                  key={task.id}
                  onClick={() => handleViewTask(task)}
                  className={`absolute left-3 right-1 rounded-2xl border-l-4 border ${task.colorBorder} ${task.colorBg} cursor-pointer transition-all active:scale-[0.99] shadow-sm overflow-hidden z-10`}
                  style={{
                    top: top + cardPadding,
                    height: height - cardPadding * 2,
                    minHeight: 56,
                  }}
                >
                  <div className="p-2.5 h-full flex flex-col justify-between gap-1">
                    {/* Top section */}
                    <div className="flex items-start justify-between gap-1.5 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <span className="text-sm shrink-0">{task.icon}</span>
                        <h4 className={`text-[12px] font-bold ${task.colorAccent} leading-tight truncate`}>{task.title}</h4>
                      </div>
                    </div>

                    {/* Time row — always visible */}
                    <div className="flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                      <span className="text-[10px] font-semibold text-foreground/70">
                        {formatTime(task.startTime)} – {formatTime(task.endTime)}
                      </span>
                    </div>

                    {/* Location — only show if card is tall enough */}
                    {height > 80 && (
                      <div className="flex items-center gap-1.5 mt-auto">
                        <MapPin className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                        <span className="text-[10px] text-foreground/60 truncate">
                          {task.customer ? `${task.customer} · ` : ""}{task.location}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarDayView;
