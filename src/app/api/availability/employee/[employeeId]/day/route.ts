import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  try {
    const { employeeId } = await params;
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "date query param is required" },
        { status: 400 }
      );
    }

    const targetDate = new Date(`${date}T00:00:00.000Z`);
    const dayOfWeek = targetDate.getUTCDay();
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    const [schedule, blockedTimes, appointments] = await Promise.all([
      prisma.workSchedule.findUnique({
        where: {
          employeeId_dayOfWeek: {
            employeeId,
            dayOfWeek,
          },
        },
      }),
      prisma.blockedTime.findMany({
        where: {
          employeeId,
          date: targetDate,
        },
        orderBy: {
          startTime: "asc",
        },
      }),
      prisma.appointment.findMany({
        where: {
          employeeId,
          startTime: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: {
            not: "CANCELLED",
          },
        },
        orderBy: {
          startTime: "asc",
        },
        include: {
          services: {
            include: {
              service: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      date,
      dayOfWeek,
      schedule,
      blockedTimes,
      appointments,
    });
  } catch (error) {
    console.error("GET /api/availability/employee/[employeeId]/day error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
