"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Service = {
  id: string;
  name: string;
  duration: number;
  price: number;
};

export default function AppointmentConfirm({
  serviceIds,
  workerId,
  workerName,
  date,
  start,
  end,
  services,
}: {
  serviceIds: string[];
  workerId: string;
  workerName: string;
  date: string;
  start: string;
  end: string;
  services: Service[];
}) {
  const router = useRouter();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const totalDuration = useMemo(
    () => services.reduce((sum, s) => sum + s.duration, 0),
    [services]
  );

  const totalPrice = useMemo(
    () => services.reduce((sum, s) => sum + s.price, 0),
    [services]
  );

  function normalizePhone(phone: string) {
    return phone.replace(/\D/g, "");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedName = customerName.trim();
    const normalizedPhone = normalizePhone(customerPhone);

    if (!trimmedName) {
      setError("Ad soyad zorunlu.");
      return;
    }

    if (!normalizedPhone) {
      setError("Telefon numarası zorunlu.");
      return;
    }

    if (normalizedPhone.length < 10) {
      setError("Geçerli bir telefon numarası girin.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const customerRes = await fetch("/api/customer/find-or-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          phone: normalizedPhone,
        }),
      });

      if (!customerRes.ok) {
        const data = await customerRes.json().catch(() => null);
        throw new Error(data?.message || "Müşteri oluşturulamadı");
      }

      const customerData = await customerRes.json();

      const appointmentRes = await fetch("/api/appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customerData.id,
          employeeId: workerId,
          serviceIds,
          startTime: `${date}T${start}:00.000Z`,
          endTime: `${date}T${end}:00.000Z`,
        }),
      });

      if (!appointmentRes.ok) {
        const data = await appointmentRes.json().catch(() => null);
        throw new Error(data?.message || "Randevu oluşturulurken bir hata oluştu.");
      }

      router.push("/randevu/basarili");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Bir hata oluştu. Tekrar deneyin."
      );
    } finally {
      setSubmitting(false);
    }
  }

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
          <p className="text-sm text-muted-foreground mb-1">Adım 4 / 4</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Randevuyu Onayla
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bilgileri kontrol edip randevuyu oluşturun
          </p>
        </header>

        <div className="px-4 pb-8 space-y-6">
          <section className="rounded-2xl border border-border bg-card p-4 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Çalışan</p>
              <p className="text-sm font-medium">{workerName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Tarih</p>
              <p className="text-sm font-medium">{date}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Saat</p>
              <p className="text-sm font-medium">
                {start} – {end}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Hizmetler</p>
              <div className="space-y-2">
                {services.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2"
                  >
                    <span className="text-sm font-medium">{s.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {s.duration} dk · {s.price.toLocaleString("tr-TR")} ₺
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Toplam süre</span>
                <span className="font-medium">{totalDuration} dk</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Toplam ücret</span>
                <span className="font-medium">
                  {totalPrice.toLocaleString("tr-TR")} ₺
                </span>
              </div>
            </div>
          </section>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Ad soyad</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Müşteri adı soyadı"
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none transition-colors focus:border-foreground"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Telefon</label>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="05xx xxx xx xx"
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none transition-colors focus:border-foreground"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-foreground py-4 text-sm font-medium text-background transition-opacity active:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Oluşturuluyor..." : "Randevu Oluştur"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
