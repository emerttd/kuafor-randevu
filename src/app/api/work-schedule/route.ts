import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { employeeId, dayOfWeek, startTime, endTime } = await req.json();

    const schedule = await prisma.workSchedule.upsert({
      where: {
        employeeId_dayOfWeek: {
          employeeId,
          dayOfWeek,
        },
      },
      update: {
        startTime: new Date(`1970-01-01T${startTime}:00.000Z`),
        endTime: new Date(`1970-01-01T${endTime}:00.000Z`),
      },
      create: {
        employeeId,
        dayOfWeek,
        startTime: new Date(`1970-01-01T${startTime}:00.000Z`),
        endTime: new Date(`1970-01-01T${endTime}:00.000Z`),
      },
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error("POST /api/work-schedule error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return NextResponse.json(
        { error: "Geçersiz employeeId" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
