"use client";

import { useRouter } from "next/navigation";
import { User } from "lucide-react";

type Worker = {
  id: string;
  name: string;
};

export default function WorkerSelector({
  workers,
  serviceIds,
}: {
  workers: Worker[];
  serviceIds: string[];
}) {
  const router = useRouter();
  const servicesParam = serviceIds.join(",");

  function handleSelect(workerId: string) {
    router.push(`/randevu/saat?services=${servicesParam}&worker=${workerId}`);
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
          <p className="text-sm text-muted-foreground mb-1">Adım 2 / 4</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Çalışan Seçin
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Seçtiğiniz hizmetleri sunan çalışanlar
          </p>
        </header>

        <div className="px-4 pb-8 space-y-3">
          {workers.length === 0 ? (
            <div className="text-center py-16 space-y-2 text-muted-foreground">
              <p className="text-sm font-medium text-foreground">
                Uygun çalışan bulunamadı
              </p>
              <p className="text-sm">
                Seçtiğiniz hizmetlerin tamamını aynı çalışan sunmuyor.
                Farklı bir kombinasyon deneyin.
              </p>
              <button
                onClick={() => router.back()}
                className="mt-2 text-sm underline underline-offset-4"
              >
                Hizmet seçimine dön
              </button>
            </div>
          ) : (
            workers.map((worker) => (
              <button
                key={worker.id}
                onClick={() => handleSelect(worker.id)}
                className="w-full text-left rounded-xl border border-border bg-card hover:border-foreground/40 transition-colors p-4 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User size={18} className="text-muted-foreground" />
                </div>
                <span className="font-medium">{worker.name}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
