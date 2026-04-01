"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CancelButton({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    if (!confirm("Randevuyu iptal etmek istediğinize emin misiniz?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/appointment/${appointmentId}`, {
        method: "PATCH",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error || "İptal işlemi başarısız oldu.");
        return;
      }

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="text-xs text-destructive hover:opacity-70 disabled:opacity-40 transition-opacity"
    >
      {loading ? "İptal ediliyor..." : "İptal Et"}
    </button>
  );
}
