import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ workerId: string }> }
) {
  try {
    const { workerId } = await params;

    const services = await prisma.workerService.findMany({
      where: { workerId },
      select: { service: true },
    });

    return NextResponse.json(services.map((s) => s.service));
  } catch (error) {
    console.error("GET /api/worker-service/[workerId] error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
