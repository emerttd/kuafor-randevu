import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  try {
    const { employeeId } = await params;

    const appointments = await prisma.appointment.findMany({
      where: {
        employeeId,
      },
      orderBy: {
        startTime: "asc",
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        services: {
          include: {
            service: true,
          },
        },
      },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("GET /api/appointment/employee/[employeeId] error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
