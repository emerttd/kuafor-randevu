"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createService(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const name = formData.get("name");
  const duration = formData.get("duration");
  const price = formData.get("price");

  if (
    typeof name !== "string" ||
    typeof duration !== "string" ||
    typeof price !== "string"
  ) {
    return { error: "Tüm alanlar zorunlu" };
  }

  const trimmedName = name.trim();
  const parsedDuration = Number(duration);
  const parsedPrice = Number(price);

  if (!trimmedName) return { error: "Hizmet adı zorunlu" };
  if (!Number.isInteger(parsedDuration) || parsedDuration <= 0)
    return { error: "Süre geçersiz" };
  if (Number.isNaN(parsedPrice) || parsedPrice <= 0)
    return { error: "Fiyat geçersiz" };

  await prisma.service.create({
    data: {
      name: trimmedName,
      duration: parsedDuration,
      price: parsedPrice,
    },
  });

  revalidatePath("/yonetim/hizmetler");
  return null;
}

export async function deleteService(formData: FormData) {
  const serviceId = formData.get("serviceId");
  if (typeof serviceId !== "string") throw new Error("Geçersiz hizmet");

  await prisma.service.delete({ where: { id: serviceId } });

  revalidatePath("/yonetim/hizmetler");
}

export async function updateService(formData: FormData) {
  const serviceId = formData.get("serviceId");
  const name = formData.get("name");
  const duration = formData.get("duration");
  const price = formData.get("price");

  if (
    typeof serviceId !== "string" ||
    typeof name !== "string" ||
    typeof duration !== "string" ||
    typeof price !== "string"
  ) {
    throw new Error("Geçersiz form verisi");
  }

  const trimmedName = name.trim();
  const parsedDuration = Number(duration);
  const parsedPrice = Number(price);

  if (!trimmedName) throw new Error("Hizmet adı zorunlu");
  if (!Number.isInteger(parsedDuration) || parsedDuration <= 0) throw new Error("Süre geçersiz");
  if (Number.isNaN(parsedPrice) || parsedPrice <= 0) throw new Error("Fiyat geçersiz");

  await prisma.service.update({
    where: { id: serviceId },
    data: {
      name: trimmedName,
      duration: parsedDuration,
      price: parsedPrice,
    },
  });

  revalidatePath("/yonetim/hizmetler");
}
