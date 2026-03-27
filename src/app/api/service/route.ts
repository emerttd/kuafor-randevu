import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(services);
  } catch (error) {
    console.error("GET /api/service error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, duration, price } = await req.json();

    const existing = await prisma.service.findFirst({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: "Bu isimde bir hizmet zaten var" }, { status: 409 });
    }

    const service = await prisma.service.create({
      data: { name, duration, price },
    });
    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("POST /api/service error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
