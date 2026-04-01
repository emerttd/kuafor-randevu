"use client";

import { useActionState, useState } from "react";
import { SubmitButton } from "@/components/ui/submit-button";
import { createService } from "./actions";

export function AddServiceForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(createService, null);

  return (
    <div className="mb-6">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="h-10 rounded-xl bg-foreground px-4 text-sm font-medium text-background"
        >
          + Yeni Hizmet Ekle
        </button>
      ) : (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Yeni Hizmet Ekle</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              İptal
            </button>
          </div>
          <form action={formAction} className="space-y-3">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-foreground">
                Hizmet adı
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Örn: Saç Kesimi"
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none"
              />
            </div>
            <div>
              <label htmlFor="duration" className="mb-1 block text-sm font-medium text-foreground">
                Süre (dakika)
              </label>
              <input
                id="duration"
                name="duration"
                type="number"
                min="1"
                required
                placeholder="Örn: 30"
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none"
              />
            </div>
            <div>
              <label htmlFor="price" className="mb-1 block text-sm font-medium text-foreground">
                Fiyat
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min="1"
                step="0.01"
                required
                placeholder="Örn: 250"
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none"
              />
            </div>

            {state?.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}

            <SubmitButton
              label="Ekle"
              className="h-11 w-full rounded-xl bg-foreground px-4 text-sm font-medium text-background"
            />
          </form>
        </div>
      )}
    </div>
  );
}
