import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { CancelButton } from "./CancelButton";

export const runtime = "nodejs";

function toTimeString(date: Date) {
  const h = String(date.getUTCHours()).padStart(2, "0");
  const m = String(date.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

type Appointment = {
  id: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  employee: { id: string; name: string | null };
  services: { service: { id: string; name: string; price: number } }[];
};

export default async function RandevularimPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/giris");
  }

  if (session.user.role !== "CUSTOMER") {
    redirect("/");
  }

  const cookieStore = await cookies();
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/appointments/me`, {
    headers: { Cookie: cookieStore.toString() },
    cache: "no-store",
  });

  const appointments: Appointment[] = res.ok ? await res.json() : [];

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
              ← Ana Sayfa
            </Link>
            <Link
              href="/randevu"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              + Yeni Randevu
            </Link>
          </div>
          <h1 className="text-2xl font-semibold">Randevularım</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Geçmiş ve gelecek randevularınız
          </p>
        </header>

        {appointments.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Henüz randevunuz yok.{" "}
            <Link href="/randevu" className="underline">
              Randevu oluşturun
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((a) => {
              const totalPrice = a.services.reduce(
                (sum, s) => sum + Number(s.service.price),
                0
              );
              const canCancel = a.status !== "CANCELLED" && a.status !== "COMPLETED";
              const start = new Date(a.startTime);
              const end = new Date(a.endTime);

              return (
                <div
                  key={a.id}
                  className="rounded-xl border border-border bg-card p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{a.employee.name || "Çalışan"}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {toDateString(start)} · {toTimeString(start)} – {toTimeString(end)}
                      </p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {a.services.map((s) => (
                      <span
                        key={s.service.id}
                        className="text-xs bg-muted px-2 py-1 rounded-md"
                      >
                        {s.service.name}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">
                      Toplam · ₺{totalPrice.toLocaleString("tr-TR")}
                    </span>
                    {canCancel && <CancelButton appointmentId={a.id} />}
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
