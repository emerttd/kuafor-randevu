import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = String(body.name || "").trim();
    const rawPhone = String(body.phone || "").trim();

    if (!name || !rawPhone) {
      return NextResponse.json(
        { message: "Ad soyad ve telefon zorunlu." },
        { status: 400 }
      );
    }

    const phone = normalizePhone(rawPhone);

    if (!phone) {
      return NextResponse.json(
        { message: "Geçerli bir telefon numarası girin." },
        { status: 400 }
      );
    }

    const existingCustomer = await prisma.user.findUnique({
      where: { phone },
      select: { id: true, name: true, phone: true },
    });

    if (existingCustomer) {
      return NextResponse.json(existingCustomer, { status: 200 });
    }

    const createdCustomer = await prisma.user.create({
      data: {
        name,
        phone,
        email: `${phone}@kuafor.local`,
        password: "placeholder-password",
        role: "CUSTOMER",
      },
      select: { id: true, name: true, phone: true },
    });

    return NextResponse.json(createdCustomer, { status: 201 });
  } catch (error) {
    console.error("find-or-create customer error:", error);

    return NextResponse.json(
      { message: "Müşteri oluşturulamadı." },
      { status: 500 }
    );
  }
}
