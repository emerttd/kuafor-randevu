"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";

type Slot = {
  start: string;
  end: string;
};

type FetchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error" }
  | { status: "done"; slots: Slot[]; totalDuration: number };

export default function TimeSlotSelector({
  serviceIds,
  workerId,
}: {
  serviceIds: string[];
  workerId: string;
}) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [fetchState, setFetchState] = useState<FetchState>({ status: "idle" });

  async function handleDateChange(value: string) {
    setDate(value);
    if (!value) {
      setFetchState({ status: "idle" });
      return;
    }

    setFetchState({ status: "loading" });

    try {
      const res = await fetch(
        `/api/availability/employee/${workerId}/bookable-slots?date=${value}&serviceIds=${serviceIds.join(",")}`
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFetchState({ status: "done", slots: data.slots, totalDuration: data.totalDuration });
    } catch {
      setFetchState({ status: "error" });
    }
  }

  function handleSlotSelect(slot: Slot) {
    const params = new URLSearchParams({
      services: serviceIds.join(","),
      worker: workerId,
      date,
      start: slot.start,
      end: slot.end,
    });
    router.push(`/randevu/onayla?${params.toString()}`);
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="w-full max-w-2xl mx-auto flex flex-col flex-1">
        <header className="px-4 pt-10 pb-4">
          <button
            onClick={() => router.back()}
            className="text-sm text-muted-foreground mb-4 flex items-center gap-1 active:opacity-60"
          >
            ← Geri
          </button>
          <p className="text-sm text-muted-foreground mb-1">Adım 3 / 4</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Tarih ve Saat
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Randevu günü seçin
          </p>
        </header>

        <div className="px-4 space-y-6 pb-8">
          <div>
            <label className="text-sm font-medium mb-2 block">Tarih</label>
            <input
              type="date"
              min={today}
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
            />
          </div>

          {fetchState.status === "idle" && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Tarih seçtikten sonra uygun saatler görünecek
            </p>
          )}

          {fetchState.status === "loading" && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Yükleniyor...
            </p>
          )}

          {fetchState.status === "error" && (
            <p className="text-sm text-destructive text-center py-8">
              Saatler yüklenemedi. Tekrar deneyin.
            </p>
          )}

          {fetchState.status === "done" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">Uygun Saatler</label>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock size={12} />
                  {fetchState.totalDuration} dk
                </span>
              </div>

              {fetchState.slots.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Bu gün için uygun saat yok
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Farklı bir tarih seçin
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {fetchState.slots.map((slot) => (
                    <button
                      key={slot.start}
                      onClick={() => handleSlotSelect(slot)}
                      className="rounded-xl border border-border bg-card py-3 text-sm font-medium hover:border-foreground/40 active:bg-foreground active:text-background transition-colors"
                    >
                      {slot.start}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
