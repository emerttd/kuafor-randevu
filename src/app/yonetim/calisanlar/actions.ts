"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createEmployee(formData: FormData) {
  const name = formData.get("name");

  if (typeof name !== "string") {
    throw new Error("İsim zorunlu");
  }

  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error("İsim zorunlu");
  }

  await prisma.user.create({
    data: {
      name: trimmedName,
      email: `${crypto.randomUUID()}@employee.local`,
      password: "placeholder-password",
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
