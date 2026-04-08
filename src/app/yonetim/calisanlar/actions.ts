"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function createEmployee(formData: FormData) {
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
    throw new Error("Tüm alanlar zorunlu");
  }

  const trimmedName = name.trim();
  const normalizedEmail = email.toLowerCase().trim();

  if (!trimmedName) throw new Error("İsim zorunlu");
  if (!normalizedEmail) throw new Error("Email zorunlu");
  if (password.length < 6) throw new Error("Şifre en az 6 karakter olmalı");

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) throw new Error("Bu email zaten kullanımda");

  const hashed = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name: trimmedName,
      email: normalizedEmail,
      password: hashed,
      role: "EMPLOYEE",
    },
  });

  revalidatePath("/yonetim/calisanlar");
}

export async function updateEmployee(formData: FormData) {
  const employeeId = formData.get("employeeId");
  const name = formData.get("name");

  if (typeof employeeId !== "string" || typeof name !== "string") {
    throw new Error("Geçersiz form verisi");
  }

  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error("İsim zorunlu");
  }

  await prisma.user.update({
    where: { id: employeeId },
    data: { name: trimmedName },
  });

  revalidatePath("/yonetim/calisanlar");
}

export async function toggleEmployeeStatus(formData: FormData) {
  const employeeId = formData.get("employeeId");
  const currentValue = formData.get("currentValue");

  if (typeof employeeId !== "string" || typeof currentValue !== "string") {
    throw new Error("Geçersiz form verisi");
  }

  await prisma.user.update({
    where: { id: employeeId },
    data: { isActive: currentValue !== "true" },
  });

  revalidatePath("/yonetim/calisanlar");
  revalidatePath("/calisan");
}

export async function updateEmployeeCredentials(formData: FormData) {
  const employeeId = formData.get("employeeId");
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof employeeId !== "string" || typeof email !== "string" || typeof password !== "string") {
    throw new Error("Geçersiz form verisi");
  }

  const normalizedEmail = email.toLowerCase().trim();
  if (!normalizedEmail) throw new Error("Email zorunlu");

  const existing = await prisma.user.findFirst({
    where: { email: normalizedEmail, NOT: { id: employeeId } },
    select: { id: true },
  });
  if (existing) throw new Error("Bu email zaten kullanımda");

  const data: { email: string; password?: string } = { email: normalizedEmail };

  if (password.trim()) {
    if (password.length < 6) throw new Error("Şifre en az 6 karakter olmalı");
    data.password = await bcrypt.hash(password, 12);
  }

  await prisma.user.update({ where: { id: employeeId }, data });

  revalidatePath("/yonetim/calisanlar");
}

export async function deleteEmployee(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const employeeId = formData.get("employeeId");
  if (typeof employeeId !== "string") return { error: "Geçersiz çalışan" };

  const futureActive = await prisma.appointment.findFirst({
    where: {
      employeeId,
      status: { in: ["PENDING", "CONFIRMED"] },
      startTime: { gte: new Date() },
    },
    select: { id: true },
  });

  if (futureActive) {
    return {
      error: "Bu çalışanın bekleyen veya onaylanmış gelecekteki randevuları olduğu için silinemez.",
    };
  }

  await prisma.$transaction(async (tx) => {
    const appointments = await tx.appointment.findMany({
      where: { employeeId },
      select: { id: true },
    });

    const appointmentIds = appointments.map((a) => a.id);

    if (appointmentIds.length > 0) {
      await tx.appointmentService.deleteMany({
        where: { appointmentId: { in: appointmentIds } },
      });
      await tx.appointment.deleteMany({
        where: { id: { in: appointmentIds } },
      });
    }

    await tx.workSchedule.deleteMany({ where: { employeeId } });
    await tx.blockedTime.deleteMany({ where: { employeeId } });
    await tx.workerService.deleteMany({ where: { workerId: employeeId } });
    await tx.user.delete({ where: { id: employeeId } });
  });

  revalidatePath("/yonetim/calisanlar");
  return null;
}

export async function updateEmployeeServices(formData: FormData) {
  const employeeId = formData.get("employeeId");
  const serviceIds = formData.getAll("serviceIds");

  if (typeof employeeId !== "string") {
    throw new Error("Çalışan id gerekli");
  }

  const validServiceIds = serviceIds.filter(
    (value): value is string => typeof value === "string"
  );

  await prisma.workerService.deleteMany({
    where: { workerId: employeeId },
  });

  if (validServiceIds.length > 0) {
    await prisma.workerService.createMany({
      data: validServiceIds.map((serviceId) => ({
        workerId: employeeId,
        serviceId,
      })),
      skipDuplicates: true,
    });
  }

  revalidatePath("/yonetim/calisanlar");
  revalidatePath("/randevu/calisan");
}
