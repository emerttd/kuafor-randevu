import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const workers = await prisma.user.findMany({
      where: {
        role: "EMPLOYEE",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(workers);
  } catch (error) {
    console.error("GET /api/user error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
        role: role === "CUSTOMER" ? "CUSTOMER" : "EMPLOYEE",
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("POST /api/user error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
