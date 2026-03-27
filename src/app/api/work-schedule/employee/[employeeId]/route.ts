import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  try {
    const { employeeId } = await params;

    const schedules = await prisma.workSchedule.findMany({
      where: {
        employeeId,
      },
      orderBy: {
        dayOfWeek: "asc",
      },
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error("GET /api/work-schedule/employee/[employeeId] error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
