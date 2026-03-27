import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AppointmentConfirm from "./_components/AppointmentConfirm";

export const runtime = "nodejs";

export default async function OnaylaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const services = params.services;
  const worker = params.worker;
  const date = params.date;
  const start = params.start;
  const end = params.end;

  if (
    typeof services !== "string" ||
    typeof worker !== "string" ||
    typeof date !== "string" ||
    typeof start !== "string" ||
    typeof end !== "string" ||
    !services.trim() ||
    !worker.trim() ||
    !date.trim() ||
    !start.trim() ||
    !end.trim()
  ) {
    redirect("/randevu");
  }

  const serviceIds = services.split(",").filter(Boolean);

  if (serviceIds.length === 0) {
    redirect("/randevu");
  }

  const [selectedServices, selectedWorker] = await Promise.all([
    prisma.service.findMany({
      where: { id: { in: serviceIds } },
      orderBy: { name: "asc" },
    }),
    prisma.user.findFirst({
      where: { id: worker, role: "EMPLOYEE" },
      select: { id: true, name: true },
    }),
  ]);

  if (selectedServices.length !== serviceIds.length || !selectedWorker) {
    redirect("/randevu");
  }

  const formattedServices = selectedServices.map((s) => ({
    id: s.id,
    name: s.name,
    duration: s.duration,
    price: Number(s.price),
  }));

  return (
    <AppointmentConfirm
      serviceIds={serviceIds}
      workerId={selectedWorker.id}
      workerName={selectedWorker.name}
      date={date}
      start={start}
      end={end}
      services={formattedServices}
    />
  );
}
