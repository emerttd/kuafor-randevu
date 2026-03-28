"use server";

import { AppointmentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const allowedTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "CANCELLED", "PENDING"],
  CANCELLED: ["PENDING"],
  COMPLETED: ["CONFIRMED"],
};

export async function updateAppointmentStatus(formData: FormData) {
  const appointmentId = formData.get("appointmentId");
  const currentStatus = formData.get("currentStatus");
  const nextStatus = formData.get("nextStatus");

  if (
    typeof appointmentId !== "string" ||
    typeof currentStatus !== "string" ||
    typeof nextStatus !== "string"
  ) {
    throw new Error("Geçersiz form verisi");
  }

  const validStatuses = Object.values(AppointmentStatus);
  if (
    !validStatuses.includes(currentStatus as AppointmentStatus) ||
    !validStatuses.includes(nextStatus as AppointmentStatus)
  ) {
    throw new Error("Geçersiz status");
  }

  const current = currentStatus as AppointmentStatus;
  const next = nextStatus as AppointmentStatus;

  if (!allowedTransitions[current].includes(next)) {
    throw new Error("Geçersiz status geçişi");
  }

  const result = await prisma.appointment.updateMany({
    where: {
      id: appointmentId,
      status: current,
    },
    data: {
      status: next,
    },
  });

  if (result.count === 0) {
    throw new Error("Randevu bulunamadı ya da status zaten değişti");
  }

  revalidatePath("/calisan");
}
