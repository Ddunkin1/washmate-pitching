"use client";

import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, ClockIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function toLocalISOString(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function DateTimePicker({ value, onChange, placeholder = "Select pickup time" }: Props) {
  const [open, setOpen] = useState(false);

  const parsed = value ? new Date(value) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(parsed ? new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()) : null);
  const [hour, setHour] = useState(parsed ? String(parsed.getHours() % 12 || 12).padStart(2, "0") : "08");
  const [minute, setMinute] = useState(parsed ? String(Math.round(parsed.getMinutes() / 5) * 5).padStart(2, "0") : "00");
  const [period, setPeriod] = useState<"AM" | "PM">(parsed ? (parsed.getHours() >= 12 ? "PM" : "AM") : "AM");

  function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function selectDay(day: number) {
    const d = new Date(viewYear, viewMonth, day);
    if (d < today) return;
    setSelectedDate(d);
  }

  function confirm() {
    if (!selectedDate) return;
    let h = parseInt(hour);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    const result = new Date(selectedDate);
    result.setHours(h, parseInt(minute), 0, 0);
    onChange(toLocalISOString(result));
    setOpen(false);
  }

  function clear() {
    onChange("");
    setSelectedDate(null);
    setOpen(false);
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const displayValue = parsed
    ? parsed.toLocaleString("en-PH", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
          open ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-200 hover:border-blue-300",
          displayValue ? "text-gray-900" : "text-gray-400"
        )}
      >
        <CalendarIcon className={cn("h-4 w-4 shrink-0", displayValue ? "text-blue-500" : "text-gray-400")} />
        <span className="flex-1 text-sm font-medium">{displayValue ?? placeholder}</span>
        {displayValue && (
          <span
            onClick={(e) => { e.stopPropagation(); clear(); }}
            className="rounded-full p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
          >
            <XIcon className="h-3.5 w-3.5" />
          </span>
        )}
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between bg-blue-600 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">Preferred Pickup Time</p>
                <p className="mt-0.5 text-lg font-bold text-white">
                  {selectedDate
                    ? selectedDate.toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })
                    : "Pick a date"}
                </p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1.5 text-blue-200 hover:bg-blue-500 transition-colors">
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Calendar header */}
            <div className="flex items-center justify-between px-5 py-3">
              <button type="button" onClick={prevMonth} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronLeftIcon className="h-4 w-4 text-gray-600" />
              </button>
              <span className="text-sm font-bold text-gray-900">{MONTHS[viewMonth]} {viewYear}</span>
              <button type="button" onClick={nextMonth} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronRightIcon className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            {/* Day labels */}
            <div className="grid grid-cols-7 px-4">
              {DAYS.map((d) => (
                <div key={d} className="py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-400">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-y-1 px-4 pb-3">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const d = new Date(viewYear, viewMonth, day);
                const isPast = d < today;
                const isToday = d.getTime() === today.getTime();
                const isSelected = selectedDate?.getTime() === d.getTime();
                return (
                  <button
                    key={day}
                    type="button"
                    disabled={isPast}
                    onClick={() => selectDay(day)}
                    className={cn(
                      "mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-all",
                      isSelected && "bg-blue-600 text-white shadow-md shadow-blue-200",
                      !isSelected && isToday && "border-2 border-blue-400 text-blue-600",
                      !isSelected && !isToday && !isPast && "text-gray-700 hover:bg-blue-50 hover:text-blue-600",
                      isPast && "cursor-not-allowed text-gray-300"
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Time picker */}
            <div className="border-t border-gray-100 px-5 py-4">
              <div className="mb-3 flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Pickup Time</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <select
                    value={hour}
                    onChange={(e) => setHour(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-center text-sm font-bold text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <p className="mt-1 text-center text-[10px] text-gray-400">Hour</p>
                </div>
                <span className="mb-4 text-lg font-bold text-gray-400">:</span>
                <div className="flex-1">
                  <select
                    value={minute}
                    onChange={(e) => setMinute(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-center text-sm font-bold text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    {MINUTES.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <p className="mt-1 text-center text-[10px] text-gray-400">Minute</p>
                </div>
                <div className="flex flex-col gap-1">
                  {(["AM", "PM"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPeriod(p)}
                      className={cn(
                        "rounded-lg px-3 py-2 text-xs font-bold transition-all",
                        period === p ? "bg-blue-600 text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 border-t border-gray-100 px-5 py-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirm}
                disabled={!selectedDate}
                className={cn(
                  "flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-all",
                  selectedDate ? "bg-blue-600 hover:bg-blue-700 shadow-sm" : "bg-gray-200 cursor-not-allowed text-gray-400"
                )}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
