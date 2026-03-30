"use client";

import { useActionState } from "react";
import { useState } from "react";
import { createBlockedTime } from "./actions";

type Result = { success: true } | { success: false; error: string };

export function BlockedTimeForm({ workerId }: { workerId: string }) {
  const [state, action, isPending] = useActionState<Result | null, FormData>(createBlockedTime, null);
  const [isAllDay, setIsAllDay] = useState(true);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="workerId" value={workerId} />

      {state && (
        <div className={`rounded-xl border px-4 py-3 text-sm ${
          state.success
            ? "border-green-200 bg-green-50 text-green-700"
            : "border-red-200 bg-red-50 text-red-700"
        }`}>
          {state.success ? "Kaydedildi." : state.error}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-sm font-medium">Tarih</label>
        <input
          name="date"
          type="date"
          required
          className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isAllDay"
          checked={isAllDay}
          onChange={(e) => setIsAllDay(e.target.checked)}
        />
        Tam gün kapalı
      </label>

      {!isAllDay && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Başlangıç</label>
            <input
              name="startTime"
              type="time"
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Bitiş</label>
            <input
              name="endTime"
              type="time"
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none"
            />
          </div>
        </div>
      )}

      <div className="space-y-1">
        <label className="text-sm font-medium">Açıklama (opsiyonel)</label>
        <input
          name="reason"
          type="text"
          placeholder="İzin, rapor, toplantı..."
          className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="h-10 w-full rounded-xl bg-foreground text-sm font-medium text-background disabled:opacity-50"
      >
        {isPending ? "Kaydediliyor..." : "Ekle"}
      </button>
    </form>
  );
}
