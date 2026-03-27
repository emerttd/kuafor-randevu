import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ employeeId: string; dayOfWeek: string }> }
) {
  try {
    const { employeeId, dayOfWeek } = await params;

    const schedule = await prisma.workSchedule.findUnique({
      where: {
        employeeId_dayOfWeek: {
          employeeId,
          dayOfWeek: Number(dayOfWeek),
        },
      },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: "Work schedule not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(schedule);
  } catch (error) {
    console.error(
      "GET /api/work-schedule/employee/[employeeId]/day/[dayOfWeek] error:",
      error
    );

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
