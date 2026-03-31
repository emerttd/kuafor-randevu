import { signOut } from "@/auth"

async function logout() {
  "use server"
  await signOut({ redirectTo: "/giris" })
}

export default function YonetimLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <form action={logout}>
          <button
            type="submit"
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Çıkış Yap
          </button>
        </form>
      </div>
      {children}
    </>
  )
}
