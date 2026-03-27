import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { employeeId, date, startTime, endTime, reason } = await req.json();

    const blockedTime = await prisma.blockedTime.create({
      data: {
        employeeId,
        date: new Date(`${date}T00:00:00.000Z`),
        startTime: startTime
          ? new Date(`1970-01-01T${startTime}:00.000Z`)
          : null,
        endTime: endTime
          ? new Date(`1970-01-01T${endTime}:00.000Z`)
          : null,
        reason,
      },
    });

    return NextResponse.json(blockedTime, { status: 201 });
  } catch (error) {
    console.error("POST /api/blocked-time error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
