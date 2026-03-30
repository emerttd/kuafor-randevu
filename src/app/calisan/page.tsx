import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export default async function CalisanIndexPage() {
  const employees = await prisma.user.findMany({
    where: {
      role: "EMPLOYEE",
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
    },
  });

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <header className="mb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Çalışanlar</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Panelini açmak istediğin çalışanı seç
              </p>
            </div>
            <Link
              href="/yonetim/calisanlar"
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              Çalışan Yönetimi
            </Link>
          </div>
        </header>

        {employees.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Kayıtlı çalışan yok
          </div>
        ) : (
          <div className="space-y-3">
            {employees.map((employee) => (
              <Link
                key={employee.id}
                href={`/calisan/${employee.id}`}
                className="block rounded-xl border border-border bg-card p-4 transition hover:bg-muted/40"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">
                    {employee.name || "İsimsiz çalışan"}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    Panele git
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
