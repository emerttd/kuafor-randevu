"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Clock, TrendingUp } from "lucide-react";

type Service = {
  id: string;
  name: string;
  duration: number;
  price: number;
};

export default function ServiceSelector({ services }: { services: Service[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const selectedServices = services.filter((s) => selected.has(s.id));
  const totalDuration = selectedServices.reduce((acc, s) => acc + s.duration, 0);
  const totalPrice = selectedServices.reduce((acc, s) => acc + s.price, 0);

  function handleContinue() {
    const ids = Array.from(selected).join(",");
    router.push(`/randevu/calisan?services=${ids}`);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="w-full max-w-lg mx-auto flex flex-col flex-1">
        <header className="px-4 pt-10 pb-4">
          <p className="text-sm text-muted-foreground mb-1">Adım 1 / 4</p>
          <h1 className="text-2xl font-semibold tracking-tight">Hizmet Seçin</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Birden fazla seçebilirsiniz
          </p>
        </header>

        <div className="flex-1 px-4 pb-4 space-y-3">
          {services.map((service) => {
            const isSelected = selected.has(service.id);
            return (
              <button
                key={service.id}
                onClick={() => toggle(service.id)}
                className={`w-full text-left rounded-xl border p-4 transition-colors ${
                  isSelected
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card hover:border-foreground/40"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{service.name}</p>
                    <div
                      className={`flex items-center gap-3 mt-1 text-sm ${
                        isSelected ? "text-background/70" : "text-muted-foreground"
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <Clock size={13} />
                        {service.duration} dk
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp size={13} />
                        {service.price} ₺
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle size={20} className="shrink-0 mt-0.5" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selected.size > 0 && (
        <div className="sticky bottom-0 border-t border-border bg-background">
          <div className="w-full max-w-lg mx-auto px-4 pb-8 pt-4">
            <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
              <span>{selected.size} hizmet seçildi</span>
              <span>
                {totalDuration} dk · {totalPrice} ₺
              </span>
            </div>
            <button
              onClick={handleContinue}
              className="w-full bg-foreground text-background rounded-xl py-4 font-medium text-sm active:opacity-80 transition-opacity"
            >
              Devam Et
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
