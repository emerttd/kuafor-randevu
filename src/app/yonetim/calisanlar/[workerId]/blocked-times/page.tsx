import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SubmitButton } from "@/components/ui/submit-button";
import { BlockedTimeForm } from "./BlockedTimeForm";
import { deleteBlockedTime } from "./actions";

export const runtime = "nodejs";

type PageProps = {
  params: Promise<{ workerId: string }>;
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("tr-TR", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(date: Date): string {
  const h = String(date.getUTCHours()).padStart(2, "0");
  const m = String(date.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export default async function BlockedTimesPage({ params }: PageProps) {
  const { workerId } = await params;

  const worker = await prisma.user.findUnique({
    where: { id: workerId },
    select: {
      id: true,
      name: true,
      role: true,
      blockedTimes: {
        orderBy: { date: "asc" },
      },
    },
  });

  if (!worker || worker.role !== "EMPLOYEE") {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Çalışan bulunamadı.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-lg px-4 py-8">
        <header className="mb-6">
          <Link
            href="/yonetim/calisanlar"
            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            ← Çalışanlara dön
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">
            {worker.name} — İzinli Zamanlar
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Çalışanın izinli olduğu tarih ve saatleri buradan yönet.
          </p>
        </header>

        <section className="mb-6 rounded-xl border border-border bg-card p-4">
          <h2 className="mb-4 text-sm font-semibold">Yeni Ekle</h2>
          <BlockedTimeForm workerId={worker.id} />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold">Kayıtlar</h2>

          {worker.blockedTimes.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
              Henüz engelli zaman yok.
            </div>
          ) : (
            <div className="space-y-2">
              {worker.blockedTimes.map((bt) => (
                <div
                  key={bt.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{formatDate(bt.date)}</p>
                    <p className="text-xs text-muted-foreground">
                      {bt.startTime && bt.endTime
                        ? `${formatTime(bt.startTime)} – ${formatTime(bt.endTime)}`
                        : "Tam gün"}
                      {bt.reason ? ` · ${bt.reason}` : ""}
                    </p>
                  </div>

                  <form action={deleteBlockedTime}>
                    <input type="hidden" name="id" value={bt.id} />
                    <input type="hidden" name="workerId" value={worker.id} />
                    <SubmitButton
                      label="Sil"
                      className="h-8 rounded-xl border border-red-200 px-3 text-xs font-medium text-red-600"
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
