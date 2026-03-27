import { prisma } from "@/lib/prisma";
import ServiceSelector from "./_components/ServiceSelector";

export const runtime = "nodejs";

export default async function RandevuPage() {
  const services = await prisma.service.findMany({
    orderBy: { name: "asc" },
  });

  const formattedServices = services.map((service) => ({
    id: service.id,
    name: service.name,
    duration: service.duration,
    price: Number(service.price),
  }));

  return <ServiceSelector services={formattedServices} />;
}
