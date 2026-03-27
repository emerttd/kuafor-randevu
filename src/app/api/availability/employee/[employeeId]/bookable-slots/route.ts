import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function toMinutes(date: Date) {
  return date.getUTCHours() * 60 + date.getUTCMinutes();
}

function timeString(minutes: number) {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}:${m}`;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  try {
    const { employeeId } = await params;
    const { searchParams } = new URL(req.url);

    const date = searchParams.get("date");
    const serviceIdsParam = searchParams.get("serviceIds");

    if (!date || !serviceIdsParam) {
      return NextResponse.json(
        { error: "date and serviceIds query params are required" },
        { status: 400 }
      );
    }

    const serviceIds = serviceIdsParam.split(",");

    const services = await prisma.service.findMany({
      where: {
        id: {
          in: serviceIds,
        },
      },
      select: {
        id: true,
        duration: true,
      },
    });

    const totalDuration = services.reduce((sum, service) => {
      return sum + service.duration;
    }, 0);

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
      }),
    ]);

    if (!schedule) {
      return NextResponse.json({
        date,
        serviceIds,
        totalDuration,
        slots: [],
      });
    }

    const workStart = toMinutes(schedule.startTime);
    const workEnd = toMinutes(schedule.endTime);

    const busyRanges: Array<{ start: number; end: number }> = [];

    for (const blocked of blockedTimes) {
      if (blocked.startTime && blocked.endTime) {
        busyRanges.push({
          start: toMinutes(blocked.startTime),
          end: toMinutes(blocked.endTime),
        });
      } else {
        busyRanges.push({
          start: workStart,
          end: workEnd,
        });
      }
    }

    for (const appointment of appointments) {
      busyRanges.push({
        start: toMinutes(appointment.startTime),
        end: toMinutes(appointment.endTime),
      });
    }

    busyRanges.sort((a, b) => a.start - b.start);

    const merged: Array<{ start: number; end: number }> = [];
    for (const range of busyRanges) {
      if (!merged.length) {
        merged.push(range);
        continue;
      }

      const last = merged[merged.length - 1];

      if (range.start <= last.end) {
        last.end = Math.max(last.end, range.end);
      } else {
        merged.push(range);
      }
    }

    const freeRanges: Array<{ start: number; end: number }> = [];
    let cursor = workStart;

    for (const range of merged) {
      if (range.start > cursor) {
        freeRanges.push({
          start: cursor,
          end: range.start,
        });
      }

      cursor = Math.max(cursor, range.end);
    }

    if (cursor < workEnd) {
      freeRanges.push({
        start: cursor,
        end: workEnd,
      });
    }

    const slots: Array<{ start: string; end: string }> = [];

    for (const range of freeRanges) {
      let slotStart = range.start;

      while (slotStart + totalDuration <= range.end) {
        slots.push({
          start: timeString(slotStart),
          end: timeString(slotStart + totalDuration),
        });

        slotStart += totalDuration;
      }
    }

    return NextResponse.json({
      date,
      serviceIds,
      totalDuration,
      slots,
    });
  } catch (error) {
    console.error(
      "GET /api/availability/employee/[employeeId]/bookable-slots error:",
      error
    );

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
