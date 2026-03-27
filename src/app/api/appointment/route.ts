import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { customerId, employeeId, startTime, endTime, serviceIds } =
      await req.json();

    const workerServices = await prisma.workerService.findMany({
      where: {
        workerId: employeeId,
        serviceId: {
          in: serviceIds,
        },
      },
      select: {
        serviceId: true,
      },
    });

    if (workerServices.length !== serviceIds.length) {
      return NextResponse.json(
        { error: "Seçilen hizmetlerden biri bu çalışana ait değil" },
        { status: 400 }
      );
    }

    const existing = await prisma.appointment.findFirst({
      where: {
        employeeId,
        status: {
          not: "CANCELLED",
        },
        startTime: {
          lt: new Date(endTime),
        },
        endTime: {
          gt: new Date(startTime),
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Bu saat aralığında randevu zaten var" },
        { status: 409 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        customerId,
        employeeId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        services: {
          create: serviceIds.map((serviceId: string) => ({
            serviceId,
          })),
        },
      },
      include: {
        services: {
          include: {
            service: true,
          },
        },
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("POST /api/appointment error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
