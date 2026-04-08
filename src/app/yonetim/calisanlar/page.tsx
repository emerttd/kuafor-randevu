import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { updateEmployee, toggleEmployeeStatus, updateEmployeeServices, updateEmployeeCredentials } from "./actions";
import { AddEmployeeForm } from "./AddEmployeeForm";
import { DeleteEmployeeButton } from "./DeleteEmployeeButton";
import { SubmitButton } from "@/components/ui/submit-button";

export const runtime = "nodejs";

export default async function EmployeeManagementPage() {
  const [employees, services] = await Promise.all([
    prisma.user.findMany({
      where: { role: "EMPLOYEE" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        workerServices: { select: { serviceId: true } },
      },
    }),
    prisma.service.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Çalışan Yönetimi</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Yeni çalışan ekleyebilir ve mevcut çalışanları düzenleyebilirsin
            </p>
          </div>
          <Link
            href="/yonetim/hizmetler"
            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            Hizmetler
          </Link>
        </header>

        <AddEmployeeForm />

        <section>
          <h2 className="mb-3 text-sm font-semibold">Mevcut Çalışanlar</h2>

          {employees.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
              Henüz çalışan yok
            </div>
          ) : (
            <div className="space-y-3">
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  className="relative rounded-xl border border-border bg-card p-4"
                >
                  <DeleteEmployeeButton employeeId={employee.id} employeeName={employee.name} />
                  {/* Ad düzenleme */}
                  <form action={updateEmployee} className="space-y-3 pt-6">
                    <input type="hidden" name="employeeId" value={employee.id} />
                    <div>
                      <label
                        htmlFor={`name-${employee.id}`}
                        className="mb-1 block text-sm font-medium text-foreground"
                      >
                        Çalışan adı
                      </label>
                      <input
                        id={`name-${employee.id}`}
                        name="name"
                        type="text"
                        defaultValue={employee.name}
                        className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground"
                      />
                    </div>
                    <SubmitButton
                      label="Kaydet"
                      className="h-9 bg-foreground text-background"
                    />
                  </form>

                  {/* Email / Şifre */}
                  <form action={updateEmployeeCredentials} className="mt-3 space-y-2 border-t border-border pt-3">
                    <input type="hidden" name="employeeId" value={employee.id} />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Email</label>
                        <input
                          name="email"
                          type="email"
                          defaultValue={employee.email}
                          className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Yeni şifre</label>
                        <input
                          name="password"
                          type="password"
                          placeholder="Değiştirmek için gir"
                          className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>
                    <SubmitButton
                      label="Güncelle"
                      className="h-8 rounded-xl border border-border px-3 text-xs font-medium text-foreground bg-transparent"
                    />
                  </form>

                  {/* Çalışan linkleri */}
                  <div className="mt-3 flex gap-4">
                    <Link
                      href={`/yonetim/calisanlar/${employee.id}/calisma-saatleri`}
                      className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                    >
                      Çalışma saatleri →
                    </Link>
                    <Link
                      href={`/yonetim/calisanlar/${employee.id}/blocked-times`}
                      className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                    >
                      İzinli zamanlar →
                    </Link>
                  </div>

                  {/* Aktif/Pasif */}
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Durum: {employee.isActive ? "Aktif" : "Pasif"}
                    </p>
                    <form action={toggleEmployeeStatus}>
                      <input type="hidden" name="employeeId" value={employee.id} />
                      <input type="hidden" name="currentValue" value={String(employee.isActive)} />
                      <SubmitButton
                        label={employee.isActive ? "Pasife Al" : "Aktif Yap"}
                        className={employee.isActive
                          ? "h-8 rounded-xl border border-red-200 px-3 text-xs font-medium text-red-600"
                          : "h-8 rounded-xl border border-border px-3 text-xs font-medium text-foreground"
                        }
                      />
                    </form>
                  </div>

                  {/* Hizmet atama */}
                  <form action={updateEmployeeServices} className="mt-4 space-y-3 border-t border-border pt-4">
                    <input type="hidden" name="employeeId" value={employee.id} />
                    <div>
                      <p className="mb-2 text-sm font-medium">Verdiği Hizmetler</p>
                      {services.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          Önce hizmet eklemelisin
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {services.map((service) => {
                            const isChecked = employee.workerServices.some(
                              (ws) => ws.serviceId === service.id
                            );
                            return (
                              <label
                                key={service.id}
                                className="flex items-center gap-2 text-sm text-foreground"
                              >
                                <input
                                  type="checkbox"
                                  name="serviceIds"
                                  value={service.id}
                                  defaultChecked={isChecked}
                                />
                                <span>{service.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {services.length > 0 && (
                      <SubmitButton
                        label="Hizmetleri Kaydet"
                        className="h-10 rounded-xl border border-border px-4 text-sm font-medium text-foreground"
                      />
                    )}
                  </form>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
