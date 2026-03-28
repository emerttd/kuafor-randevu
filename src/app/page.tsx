import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col px-4 py-8">
        <section className="flex flex-1 flex-col justify-center">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                Online Randevu
              </p>

              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Öz Kardeşler Berber Salonu
              </h1>

              <p className="text-base text-foreground">
                Randevunuzu hızlıca oluşturun
              </p>

              <p className="text-sm leading-6 text-muted-foreground">
                Hizmeti seçin, uygun çalışanı ve saati belirleyin, randevunuzu
                kolayca oluşturun.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/randevu"
                className="flex h-11 items-center justify-center rounded-xl bg-foreground px-4 text-sm font-medium text-background"
              >
                Randevu Al
              </Link>

              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-medium text-foreground">
                  Hızlı ve pratik kullanım
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Telefonda ya da doğrudan şubede, birkaç adımda randevu
                  oluşturabilirsiniz.
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="pt-6 text-center">
          <Link
            href="/calisan"
            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            Çalışan girişi
          </Link>
        </footer>
      </div>
    </main>
  );
}
