import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SubmitButton } from "@/components/ui/submit-button";
import { updateService } from "./actions";
import { AddServiceForm } from "./AddServiceForm";

export const runtime = "nodejs";

export default async function ServiceManagementPage() {
  const services = await prisma.service.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, duration: true, price: true },
  });

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Hizmet Yönetimi</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Hizmet ekleyebilir ve mevcut hizmetleri düzenleyebilirsin
            </p>
          </div>
          <Link
            href="/yonetim/calisanlar"
            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            Çalışanlar
          </Link>
        </header>

        <AddServiceForm />

        <section>
          <h2 className="mb-3 text-sm font-semibold">Mevcut Hizmetler</h2>
          {services.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
              Henüz hizmet yok
            </div>
          ) : (
            <div className="space-y-3">
              {services.map((service) => (
                <div key={service.id} className="rounded-xl border border-border bg-card p-4">
                  <form action={updateService} className="space-y-3">
                    <input type="hidden" name="serviceId" value={service.id} />
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground">
                        Hizmet adı
                      </label>
                      <input
                        name="name"
                        type="text"
                        defaultValue={service.name}
                        className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">
                          Süre (dk)
                        </label>
                        <input
                          name="duration"
                          type="number"
                          min="1"
                          defaultValue={service.duration}
                          className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">
                          Fiyat
                        </label>
                        <input
                          name="price"
                          type="number"
                          min="1"
                          step="0.01"
                          defaultValue={Number(service.price)}
                          className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none"
                        />
                      </div>
                    </div>
                    <SubmitButton
                      label="Kaydet"
                      className="h-10 rounded-xl bg-foreground px-4 text-sm font-medium text-background"
                    />
                  </form>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
