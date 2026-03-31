import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { login } from "./actions"

interface Props {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>
}

export default async function GirisPage({ searchParams }: Props) {
  const session = await auth()

  if (session) {
    const role = session.user.role
    redirect(role === "ADMIN" ? "/yonetim/calisanlar" : `/calisan/${session.user.id}`)
  }

  const { callbackUrl = "/", error } = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Giriş Yap</h1>
          <p className="text-sm text-muted-foreground">Email ve şifrenizle giriş yapın</p>
        </div>

        {error === "invalid" && (
          <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Email veya şifre hatalı
          </div>
        )}

        <form action={login} className="space-y-4">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Şifre
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  )
}
