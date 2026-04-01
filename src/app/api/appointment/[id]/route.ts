import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role, id: userId } = session.user;

    if (role !== "CUSTOMER" && role !== "EMPLOYEE") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
        customerId: true,
        employeeId: true,
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        services: {
          select: {
            service: {
              select: {
                id: true,
                name: true,
                duration: true,
                price: true,
              },
            },
          },
        },
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    if (role === "CUSTOMER" && appointment.customerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (role === "EMPLOYEE" && appointment.employeeId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("GET /api/appointment/[id] error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

const EMPLOYEE_TRANSITIONS: Record<string, string> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "COMPLETED",
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role, id: userId } = session.user;

    if (role !== "CUSTOMER" && role !== "EMPLOYEE") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      select: { customerId: true, employeeId: true, status: true },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    if (role === "CUSTOMER") {
      if (appointment.customerId !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      if (appointment.status === "CANCELLED") {
        return NextResponse.json(
          { error: "Randevu zaten iptal edilmiş" },
          { status: 409 }
        );
      }

      const updated = await prisma.appointment.update({
        where: { id },
        data: { status: "CANCELLED" },
        select: { id: true, startTime: true, endTime: true, status: true },
      });

      return NextResponse.json(updated);
    }

    // EMPLOYEE
    if (appointment.employeeId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const nextStatus = EMPLOYEE_TRANSITIONS[appointment.status];

    if (!nextStatus) {
      return NextResponse.json(
        { error: "Bu durumdan geçiş yapılamaz" },
        { status: 409 }
      );
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: nextStatus },
      select: { id: true, startTime: true, endTime: true, status: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/appointment/[id] error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
