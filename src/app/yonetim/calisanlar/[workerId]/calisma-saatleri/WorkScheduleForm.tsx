"use client";

import { useActionState } from "react";
import { saveWorkSchedule } from "./actions";
import { DayRow } from "./DayRow";

const DAY_ORDER: { index: number; label: string }[] = [
  { index: 1, label: "Pazartesi" },
  { index: 2, label: "Salı" },
  { index: 3, label: "Çarşamba" },
  { index: 4, label: "Perşembe" },
  { index: 5, label: "Cuma" },
  { index: 6, label: "Cumartesi" },
  { index: 0, label: "Pazar" },
];

type DaySchedule = {
  dayOfWeek: number;
  startTime: Date;
  endTime: Date;
};

type Props = {
  workerId: string;
  schedules: DaySchedule[];
};

function formatTime(date: Date): string {
  const h = String(date.getUTCHours()).padStart(2, "0");
  const m = String(date.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function WorkScheduleForm({ workerId, schedules }: Props) {
  const [state, action, isPending] = useActionState(saveWorkSchedule, null);

  const scheduleMap = new Map(schedules.map((s) => [s.dayOfWeek, s]));

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="workerId" value={workerId} />

      {state && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            state.success
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {state.success ? "Çalışma saatleri kaydedildi." : state.error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="divide-y divide-border">
          {DAY_ORDER.map(({ index, label }) => {
            const schedule = scheduleMap.get(index);
            return (
              <DayRow
                key={index}
                dayIndex={index}
                label={label}
                defaultClosed={!schedule}
                defaultStart={schedule ? formatTime(schedule.startTime) : "09:00"}
                defaultEnd={schedule ? formatTime(schedule.endTime) : "18:00"}
              />
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="h-11 w-full rounded-xl bg-foreground text-sm font-medium text-background disabled:opacity-50"
      >
        {isPending ? "Kaydediliyor..." : "Kaydet"}
      </button>
    </form>
  );
}
