"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

type Result = { success: true } | { success: false; error: string };

const DAYS = [0, 1, 2, 3, 4, 5, 6] as const;

const DAY_NAMES = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

function timeToDate(time: string): Date | null {
  const [hours, minutes] = time.split(":").map(Number);
  if (
    Number.isNaN(hours) || Number.isNaN(minutes) ||
    hours < 0 || hours > 23 ||
    minutes < 0 || minutes > 59
  ) return null;
  return new Date(Date.UTC(1970, 0, 1, hours, minutes, 0));
}

export async function saveWorkSchedule(_prev: Result | null, formData: FormData): Promise<Result> {
  const workerId = String(formData.get("workerId") || "");

  if (!workerId) return { success: false, error: "Çalışan ID zorunlu" };

  const worker = await prisma.user.findUnique({
    where: { id: workerId },
    select: { id: true, role: true },
  });

  if (!worker) return { success: false, error: "Çalışan bulunamadı" };
  if (worker.role !== "EMPLOYEE") return { success: false, error: "Sadece çalışanlar için çalışma saati tanımlanabilir" };

  const schedules: { employeeId: string; dayOfWeek: number; startTime: Date; endTime: Date }[] = [];

  for (const day of DAYS) {
    const isClosed = formData.get(`closed_${day}`) === "on";
    if (isClosed) continue;

    const start = String(formData.get(`start_${day}`) || "");
    const end = String(formData.get(`end_${day}`) || "");

    if (!start || !end) {
      return { success: false, error: `${DAY_NAMES[day]} için başlangıç ve bitiş saati zorunlu` };
    }

    if (start >= end) {
      return { success: false, error: `${DAY_NAMES[day]}: bitiş saati başlangıçtan büyük olmalı` };
    }

    const startDate = timeToDate(start);
    const endDate = timeToDate(end);

    if (!startDate || !endDate) {
      return { success: false, error: `${DAY_NAMES[day]} için geçersiz saat formatı` };
    }

    schedules.push({ employeeId: workerId, dayOfWeek: day, startTime: startDate, endTime: endDate });
  }

  await prisma.$transaction([
    prisma.workSchedule.deleteMany({ where: { employeeId: workerId } }),
    ...(schedules.length > 0 ? [prisma.workSchedule.createMany({ data: schedules })] : []),
  ]);

  revalidatePath(`/yonetim/calisanlar/${workerId}/calisma-saatleri`);
  revalidatePath(`/yonetim/calisanlar`);

  return { success: true };
}
