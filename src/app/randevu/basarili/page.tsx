import Link from "next/link";

export default function BasariliPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-4 py-10">
        <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background text-xl font-semibold">
            ✓
          </div>

          <p className="mb-1 text-sm text-muted-foreground">Randevu tamamlandı</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Randevunuz oluşturuldu
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Randevu talebiniz başarıyla alındı. İsterseniz yeni bir randevu
            oluşturabilir veya ana akışa dönebilirsiniz.
          </p>

          <div className="mt-6 space-y-3">
            <Link
              href="/randevu"
              className="block w-full rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background transition-opacity active:opacity-80"
            >
              Yeni randevu oluştur
            </Link>

            <Link
              href="/"
              className="block w-full rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium transition-colors hover:border-foreground/40"
            >
              Ana sayfaya dön
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
