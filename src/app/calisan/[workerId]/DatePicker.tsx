"use client";

import { useRouter } from "next/navigation";

export function DatePicker({
  workerId,
  value,
}: {
  workerId: string;
  value: string;
}) {
  const router = useRouter();

  return (
    <input
      type="date"
      value={value}
      onChange={(e) =>
        router.push(`/calisan/${workerId}?date=${e.target.value}`)
      }
      className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm"
    />
  );
}
