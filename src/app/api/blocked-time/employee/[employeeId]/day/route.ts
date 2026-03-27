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

    const blockedTimes = await prisma.blockedTime.findMany({
      where: {
        employeeId,
        date: targetDate,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return NextResponse.json(blockedTimes);
  } catch (error) {
    console.error("GET /api/blocked-time/employee/[employeeId]/day error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
