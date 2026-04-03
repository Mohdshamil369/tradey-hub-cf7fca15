import { useState, useRef, useEffect } from "react";
import { format, addDays, subDays, isSameDay, isToday } from "date-fns";
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

const hours = Array.from({ length: 13 }, (_, i) => i + 7);

const CalendarDayView = () => {
  const today = new Date();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(today);
  const dateScrollRef = useRef<HTMLDivElement>(null);

  const dates = Array.from({ length: 15 }, (_, i) => addDays(subDays(today, 7), i));
  const tasks = generateMockTasks(selectedDate);

  // Build a map of hour -> tasks that start at that hour
  const tasksByHour = new Map<number, Task[]>();
  tasks.forEach((task) => {
    const h = parseInt(task.startTime.split(":")[0]);
    if (!tasksByHour.has(h)) tasksByHour.set(h, []);
    tasksByHour.get(h)!.push(task);
  });

  const currentHour = (() => {
    const now = new Date();
    if (!isToday(selectedDate)) return null;
    const h = now.getHours();
    const m = now.getMinutes();
    if (h < 7 || h > 19) return null;
    return { hour: h, minutes: m };
  })();

  useEffect(() => {
    if (dateScrollRef.current) {
      const idx = dates.findIndex((d) => isSameDay(d, selectedDate));
      const el = dateScrollRef.current.children[idx] as HTMLElement;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [selectedDate]);

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
      <div className="pb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">
          {format(selectedDate, "EEEE, d MMMM yyyy")}
          {isToday(selectedDate) && <span className="text-muted-foreground font-normal"> (Today)</span>}
        </h3>
        <span className="text-xs font-semibold text-primary">
          • {tasks.length} {tasks.length === 1 ? "Task" : "Tasks"}
        </span>
      </div>

      {/* Timeline — flows naturally, no inner scroll */}
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <Calendar className="mb-2 h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm font-semibold text-muted-foreground">No tasks scheduled</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Accept jobs to fill your day</p>
        </div>
      ) : (
        <div className="flex flex-col">
          {hours.map((hour) => {
            const hourTasks = tasksByHour.get(hour) || [];
            const isCurrentHour = currentHour && currentHour.hour === hour;
            const hasContent = hourTasks.length > 0;

            return (
              <div key={hour} className="flex gap-3 min-h-[48px]">
                {/* Time label */}
                <div className="w-14 shrink-0 pt-0.5 text-right">
                  <span className={`text-[11px] font-semibold ${isCurrentHour ? "text-destructive" : "text-muted-foreground"}`}>
                    {hour <= 12 ? `${hour} AM` : `${hour - 12} PM`}
                  </span>
                  {isCurrentHour && (
                    <div className="mt-0.5">
                      <span className="text-[9px] font-bold text-destructive">
                        {format(new Date(), "h:mm")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content area */}
                <div className="flex-1 border-l border-border/50 pl-3 pb-2 relative">
                  {/* Current time indicator */}
                  {isCurrentHour && (
                    <div
                      className="absolute left-0 right-0 z-10 flex items-center -translate-x-1"
                      style={{ top: `${(currentHour.minutes / 60) * 100}%` }}
                    >
                      <div className="w-2 h-2 rounded-full bg-destructive" />
                      <div className="flex-1 h-[1.5px] bg-destructive" />
                    </div>
                  )}

                  {/* Task cards */}
                  {hourTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleViewTask(task)}
                      className={`rounded-2xl border ${task.colorBorder} ${task.colorBg} p-3.5 mb-2 cursor-pointer transition-all active:scale-[0.98] hover:shadow-md`}
                    >
                      {/* Task name — most prominent */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{task.icon}</span>
                        <h4 className={`text-[15px] font-bold ${task.colorAccent}`}>{task.title}</h4>
                      </div>

                      {/* Time */}
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Clock className={`h-3.5 w-3.5 ${task.colorAccent} opacity-60`} />
                        <span className="text-[12px] font-semibold text-foreground/80">
                          {formatTime(task.startTime)} – {formatTime(task.endTime)}
                        </span>
                      </div>

                      {/* Location */}
                      {task.location && (
                        <div className="flex items-center gap-1.5 mb-3">
                          <MapPin className={`h-3.5 w-3.5 ${task.colorAccent} opacity-60`} />
                          <span className="text-[12px] text-foreground/70">
                            {task.customer && `${task.customer} · `}{task.location}
                          </span>
                        </div>
                      )}

                      {/* View button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewTask(task);
                        }}
                        className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-bold transition-all active:scale-[0.97] bg-foreground/10 text-foreground/80 hover:bg-foreground/15`}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View Details
                      </button>
                    </div>
                  ))}

                  {/* Empty hour — subtle spacer */}
                  {!hasContent && (
                    <div className="h-6" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CalendarDayView;
