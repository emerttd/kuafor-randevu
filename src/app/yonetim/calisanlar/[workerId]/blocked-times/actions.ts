"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

type Result = { success: true } | { success: false; error: string };

export async function createBlockedTime(
  _prev: Result | null,
  formData: FormData
): Promise<Result> {
  const workerId = String(formData.get("workerId") || "");
  const startDate = String(formData.get("startDate") || "");
  const endDate = String(formData.get("endDate") || "");
  const isAllDay = formData.get("isAllDay") === "on";
  const start = String(formData.get("startTime") || "");
  const end = String(formData.get("endTime") || "");
  const reason = String(formData.get("reason") || "").trim();

  if (!workerId) return { success: false, error: "Çalışan ID zorunlu" };
  if (!startDate) return { success: false, error: "Başlangıç tarihi zorunlu" };
  if (!endDate) return { success: false, error: "Bitiş tarihi zorunlu" };
  if (endDate < startDate) return { success: false, error: "Bitiş tarihi başlangıç tarihinden önce olamaz" };

  if (!isAllDay) {
    if (!start || !end) return { success: false, error: "Başlangıç ve bitiş saati zorunlu" };
    if (start >= end) return { success: false, error: "Bitiş saati başlangıçtan büyük olmalı" };
  }

  const worker = await prisma.user.findUnique({
    where: { id: workerId },
    select: { id: true, role: true },
  });

  if (!worker) return { success: false, error: "Çalışan bulunamadı" };
  if (worker.role !== "EMPLOYEE") return { success: false, error: "Sadece çalışanlar için blok tanımlanabilir" };

  const startTime = isAllDay ? null : new Date(Date.UTC(1970, 0, 1, ...start.split(":").map(Number) as [number, number]));
  const endTime = isAllDay ? null : new Date(Date.UTC(1970, 0, 1, ...end.split(":").map(Number) as [number, number]));

  const days: Date[] = [];
  const current = new Date(`${startDate}T00:00:00.000Z`);
  const last = new Date(`${endDate}T00:00:00.000Z`);
  while (current <= last) {
    days.push(new Date(current));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  await prisma.blockedTime.createMany({
    data: days.map((date) => ({
      employeeId: workerId,
      date,
      startTime,
      endTime,
      reason: reason || null,
    })),
    skipDuplicates: true,
  });

  revalidatePath(`/yonetim/calisanlar/${workerId}/blocked-times`);
  return { success: true };
}

export async function deleteBlockedTime(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "");
  const workerId = String(formData.get("workerId") || "");

  if (!id || !workerId) return;

  await prisma.blockedTime.delete({ where: { id } });
  revalidatePath(`/yonetim/calisanlar/${workerId}/blocked-times`);
}
