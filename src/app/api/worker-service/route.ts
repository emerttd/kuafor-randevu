import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { workerId, serviceId } = await req.json();

    const existing = await prisma.workerService.findUnique({
      where: { workerId_serviceId: { workerId, serviceId } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Bu hizmet zaten bu çalışana atanmış" },
        { status: 409 }
      );
    }

    const workerService = await prisma.workerService.create({
      data: { workerId, serviceId },
    });

    return NextResponse.json(workerService, { status: 201 });
  } catch (error) {
    console.error("POST /api/worker-service error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Bu hizmet zaten bu çalışana atanmış" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
