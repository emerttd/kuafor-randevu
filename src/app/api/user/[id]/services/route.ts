import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const worker = await prisma.user.findFirst({
      where: {
        id,
        role: "EMPLOYEE",
      },
      select: {
        id: true,
        name: true,
        workerServices: {
          select: {
            service: true,
          },
        },
      },
    });

    if (!worker) {
      return NextResponse.json(
        { error: "Worker not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: worker.id,
      name: worker.name,
      services: worker.workerServices.map((ws) => ws.service),
    });
  } catch (error) {
    console.error("GET /api/user/[id]/services error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
