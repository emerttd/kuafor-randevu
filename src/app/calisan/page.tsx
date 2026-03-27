import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function toTimeString(date: Date) {
  const h = String(date.getUTCHours()).padStart(2, "0");
  const m = String(date.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export default async function CalisanPanel() {
  // şimdilik sabit worker (test için)
  const workerId = "cmn7zedkb0001w0pyt70eq4cu";

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setUTCDate(today.getUTCDate() + 1);

  const appointments = await prisma.appointment.findMany({
    where: {
      employeeId: workerId,
      startTime: {
        gte: today,
        lt: tomorrow,
      },
    },
    orderBy: {
      startTime: "asc",
    },
    include: {
      customer: true,
      services: {
        include: {
          service: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-lg px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">Bugünkü Randevular</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Günlük planını buradan takip edebilirsin
          </p>
        </header>

        {appointments.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            Bugün randevu yok
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment) => {
              const start = toTimeString(appointment.startTime);
              const end = toTimeString(appointment.endTime);

              return (
                <div
                  key={appointment.id}
                  className="rounded-xl border border-border bg-card p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {start} – {end}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {appointment.customer.name}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {appointment.services.map((as) => (
                      <span
                        key={as.serviceId}
                        className="text-xs bg-muted px-2 py-1 rounded-md"
                      >
                        {as.service.name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
