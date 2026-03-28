import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatusActions } from "@/components/ui/status-actions";
import { DatePicker } from "./DatePicker";
import { Appointment, AppointmentService, Service, User } from "@prisma/client";

export const runtime = "nodejs";

type AppointmentWithRelations = Appointment & {
  customer: User;
  services: (AppointmentService & { service: Service })[];
};

function toTimeString(date: Date) {
  const h = String(date.getUTCHours()).padStart(2, "0");
  const m = String(date.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function AppointmentCard({ appointment }: { appointment: AppointmentWithRelations }) {
  const start = toTimeString(appointment.startTime);
  const end = toTimeString(appointment.endTime);

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
        {appointment.services.map((appointmentService) => (
          <span
            key={appointmentService.serviceId}
            className="text-xs bg-muted px-2 py-1 rounded-md"
          >
            {appointmentService.service.name}
          </span>
        ))}
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
  appointments: AppointmentWithRelations[];
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

  const selected = date ? new Date(`${date}T00:00:00Z`) : new Date();
  selected.setUTCHours(0, 0, 0, 0);

  const nextDay = new Date(selected);
  nextDay.setUTCDate(selected.getUTCDate() + 1);

  const appointments = await prisma.appointment.findMany({
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

  const pending = appointments.filter((a) => a.status === "PENDING");
  const confirmed = appointments.filter((a) => a.status === "CONFIRMED");
  const other = appointments.filter(
    (a) => a.status === "COMPLETED" || a.status === "CANCELLED"
  );

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-lg px-4 py-8">
        <header className="mb-6">
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
