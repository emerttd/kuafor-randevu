import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import WorkerSelector from "./_components/WorkerSelector";

export const runtime = "nodejs";

export default async function CalisanPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { services: servicesParam } = await searchParams;

  if (!servicesParam || typeof servicesParam !== "string") {
    redirect("/randevu");
  }

  const serviceIds = servicesParam.split(",").filter(Boolean);

  if (serviceIds.length === 0) {
    redirect("/randevu");
  }

  // Seçili hizmetlerin tamamını sunan çalışanları getir
  const employees = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    include: {
      workerServices: {
        where: { serviceId: { in: serviceIds } },
      },
    },
    orderBy: { name: "asc" },
  });

  const eligible = employees
    .filter((e) => e.workerServices.length === serviceIds.length)
    .map((e) => ({ id: e.id, name: e.name }));

  return (
    <WorkerSelector
      workers={eligible}
      serviceIds={serviceIds}
    />
  );
}
