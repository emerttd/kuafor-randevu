import { prisma } from "@/lib/prisma";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatusActions } from "@/components/ui/status-actions";
import { DatePicker } from "./DatePicker";
import Link from "next/link";

export const runtime = "nodejs";

type AppointmentItem = {
  id: string;
  startTime: Date;
  endTime: Date;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  customer: { name: string | null; phone: string | null };
  services: { serviceKey: string; name: string; price: number }[];
};

function toTimeString(date: Date) {
  const h = String(date.getUTCHours()).padStart(2, "0");
  const m = String(date.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function AppointmentCard({ appointment }: { appointment: AppointmentItem }) {
  const start = toTimeString(appointment.startTime);
  const end = toTimeString(appointment.endTime);
  const totalPrice = appointment.services.reduce((sum, s) => sum + Number(s.price), 0);

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">
            {appointment.customer.name || "İsimsiz müşteri"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {start} – {end}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {appointment.customer.phone || "Telefon yok"}
          </p>
        </div>
        <StatusBadge status={appointment.status} />
      </div>

      <div className="flex flex-wrap gap-2">
        {appointment.services.map((s) => (
          <span key={s.serviceKey} className="text-xs bg-muted px-2 py-1 rounded-md">
            {s.name}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-muted-foreground">Toplam Tutar</span>
        <span className="text-sm font-semibold">₺{totalPrice}</span>
      </div>

      <StatusActions appointmentId={appointment.id} status={appointment.status} />
    </div>
  );
}

function Section({
  title,
  appointments,
  emptyText,
}: {
  title: string;
  appointments: AppointmentItem[];
  emptyText?: string;
}) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        {title}
      </h2>
      {appointments.length === 0 ? (
        emptyText ? (
          <p className="text-sm text-muted-foreground py-4 text-center">{emptyText}</p>
        ) : null
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => (
            <AppointmentCard key={a.id} appointment={a} />
          ))}
        </div>
      )}
    </section>
  );
}

export default async function CalisanPanel({
  params,
  searchParams,
}: {
  params: Promise<{ workerId: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { workerId } = await params;
  const { date } = await searchParams;

  const session = await auth();
  if (session?.user.role === "EMPLOYEE" && session.user.id !== workerId) {
    redirect("/calisan");
  }

  const selected = date ? new Date(`${date}T00:00:00Z`) : new Date();
  selected.setUTCHours(0, 0, 0, 0);

  const nextDay = new Date(selected);
  nextDay.setUTCDate(selected.getUTCDate() + 1);

  let appointments: AppointmentItem[] = [];

  if (session?.user.role === "EMPLOYEE") {
    // API üzerinden — session ile kimlik doğrulanır, workerId'ye güvenilmez
    const cookieStore = await cookies();
    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/appointments/employee/me`, {
      headers: { Cookie: cookieStore.toString() },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      appointments = data
        .map((a: {
          id: string;
          startTime: string;
          endTime: string;
          status: AppointmentItem["status"];
          customer: { name: string | null; phone: string | null };
          services: { service: { id: string; name: string; price: number } }[];
        }) => ({
          id: a.id,
          startTime: new Date(a.startTime),
          endTime: new Date(a.endTime),
          status: a.status,
          customer: a.customer,
          services: a.services.map((s) => ({
            serviceKey: s.service.id,
            name: s.service.name,
            price: s.service.price,
          })),
        }))
        .filter(
          (a: AppointmentItem) =>
            a.startTime >= selected && a.startTime < nextDay
        );
    }
  } else {
    // ADMIN: Prisma ile direkt (admin flow ileride ayrı güvence altına alınacak)
    const raw = await prisma.appointment.findMany({
      where: {
        employeeId: workerId,
        startTime: { gte: selected, lt: nextDay },
      },
      orderBy: { startTime: "asc" },
      include: {
        customer: true,
        services: { include: { service: true } },
      },
    });

    appointments = raw.map((a) => ({
      id: a.id,
      startTime: a.startTime,
      endTime: a.endTime,
      status: a.status,
      customer: { name: a.customer.name, phone: a.customer.phone },
      services: a.services.map((s) => ({
        serviceKey: s.serviceId,
        name: s.service.name,
        price: Number(s.service.price),
      })),
    }));
  }

  const pending = appointments.filter((a) => a.status === "PENDING");
  const confirmed = appointments.filter((a) => a.status === "CONFIRMED");
  const other = appointments.filter(
    (a) => a.status === "COMPLETED" || a.status === "CANCELLED"
  );

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/calisan" className="text-xs text-muted-foreground hover:text-foreground">
              ← Çalışanlar
            </Link>
            <form action={async () => { "use server"; await signOut({ redirectTo: "/giris" }) }}>
              <button type="submit" className="text-xs text-muted-foreground hover:text-foreground">
                Çıkış Yap
              </button>
            </form>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Randevular</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Günlük planını buradan takip edebilirsin
              </p>
            </div>
            <DatePicker workerId={workerId} value={toDateString(selected)} />
          </div>
        </header>

        <div className="space-y-8">
          <Section
            title="Bekleyen Randevular"
            appointments={pending}
            emptyText="Bekleyen randevu yok"
          />
          <Section
            title="Güncel Randevular"
            appointments={confirmed}
            emptyText="Onaylanmış randevu yok"
          />
          {other.length > 0 && (
            <Section
              title="Tamamlanan / İptal"
              appointments={other}
            />
          )}
        </div>
      </div>
    </main>
  );
}
