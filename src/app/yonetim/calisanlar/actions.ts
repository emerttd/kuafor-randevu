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
