import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "CUSTOMER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        customerId: session.user.id,
      },
      orderBy: {
        startTime: "asc",
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
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

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("GET /api/appointments/me error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
