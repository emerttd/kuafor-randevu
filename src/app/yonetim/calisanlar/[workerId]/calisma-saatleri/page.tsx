import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { WorkScheduleForm } from "./WorkScheduleForm";

export const runtime = "nodejs";

type PageProps = {
  params: Promise<{ workerId: string }>;
};

export default async function WorkSchedulePage({ params }: PageProps) {
  const { workerId } = await params;

  const worker = await prisma.user.findUnique({
    where: { id: workerId },
    select: {
      id: true,
      name: true,
      role: true,
      workSchedules: { orderBy: { dayOfWeek: "asc" } },
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
            {worker.name} — Çalışma Saatleri
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Haftalık çalışma düzenini buradan yönet.
          </p>
        </header>

        <WorkScheduleForm
          workerId={worker.id}
          schedules={worker.workSchedules}
        />
      </div>
    </main>
  );
}
