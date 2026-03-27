import { redirect } from "next/navigation";
import TimeSlotSelector from "./_components/TimeSlotSelector";

export default async function SaatPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const services = params.services;
  const worker = params.worker;

  if (
    typeof services !== "string" ||
    typeof worker !== "string" ||
    !services.trim() ||
    !worker.trim()
  ) {
    redirect("/randevu");
  }

  const serviceIds = services.split(",").filter(Boolean);

  if (serviceIds.length === 0) {
    redirect("/randevu");
  }

  return <TimeSlotSelector serviceIds={serviceIds} workerId={worker} />;
}
