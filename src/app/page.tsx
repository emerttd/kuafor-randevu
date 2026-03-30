import Link from "next/link";
import { Scissors, Clock, CalendarCheck, ChevronRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 py-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <Scissors className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              ÖZ KARDEŞLER
            </span>
          </div>
          <Link
            href="/calisan"
            className="text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            Çalışan Girişi
          </Link>
        </header>

        {/* Hero Section */}
        <section className="flex flex-1 flex-col justify-center py-8">
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                Online Randevu Sistemi
              </span>
            </div>

            {/* Title */}
            <div className="space-y-3">
              <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground">
                Öz Kardeşler
                <br />
                <span className="text-primary">Berber Salonu</span>
              </h1>
              <p className="text-base leading-relaxed text-muted-foreground">
                Profesyonel berberlik hizmetleri için randevunuzu hızlıca oluşturun.
              </p>
            </div>

            {/* CTA Button */}
            <Link
              href="/randevu"
              className="group flex h-14 items-center justify-between rounded-2xl bg-primary px-6 text-base font-semibold text-primary-foreground transition-all active:scale-[0.98]"
            >
              <span>Randevu Al</span>
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3">
              <FeatureCard
                icon={<Clock className="h-5 w-5" />}
                title="Hızlı İşlem"
                description="Birkaç adımda randevu"
              />
              <FeatureCard
                icon={<CalendarCheck className="h-5 w-5" />}
                title="Kolay Takip"
                description="Randevularınızı yönetin"
              />
            </div>

            {/* Info Card */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <Scissors className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Nasıl Çalışır?</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Hizmeti seçin, uygun çalışanı ve saati belirleyin, randevunuzu kolayca oluşturun.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="flex items-center justify-center gap-2 border-t border-border pt-4">
          <span className="text-xs text-muted-foreground">
            © 2025 Öz Kardeşler Berber Salonu
          </span>
        </footer>
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
        {icon}
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
