"use client";

import { useState } from "react";

type Props = {
  dayIndex: number;
  label: string;
  defaultClosed: boolean;
  defaultStart: string;
  defaultEnd: string;
};

export function DayRow({ dayIndex, label, defaultClosed, defaultStart, defaultEnd }: Props) {
  const [closed, setClosed] = useState(defaultClosed);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>

        {/* Switch */}
        <button
          type="button"
          role="switch"
          aria-checked={!closed}
          onClick={() => setClosed((prev) => !prev)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            closed ? "bg-muted" : "bg-foreground"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-background shadow transition-transform ${
              closed ? "translate-x-1" : "translate-x-6"
            }`}
          />
        </button>

        {/* hidden checkbox — form değerini taşır */}
        <input
          type="checkbox"
          name={`closed_${dayIndex}`}
          checked={closed}
          onChange={() => {}}
          className="sr-only"
        />
      </div>

      {!closed && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label htmlFor={`start_${dayIndex}`} className="text-xs text-muted-foreground">
              Başlangıç
            </label>
            <input
              id={`start_${dayIndex}`}
              name={`start_${dayIndex}`}
              type="time"
              defaultValue={defaultStart}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor={`end_${dayIndex}`} className="text-xs text-muted-foreground">
              Bitiş
            </label>
            <input
              id={`end_${dayIndex}`}
              name={`end_${dayIndex}`}
              type="time"
              defaultValue={defaultEnd}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
