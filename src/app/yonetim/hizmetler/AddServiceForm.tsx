"use client";

import { useState } from "react";
import { SubmitButton } from "@/components/ui/submit-button";
import { createService } from "./actions";

export function AddServiceForm() {
  const [open, setOpen] = useState(false);

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
              onClick={() => setOpen(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              İptal
            </button>
          </div>
          <form action={createService} className="space-y-3">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-foreground">
                Hizmet adı
              </label>
              <input
                id="name"
                name="name"
                type="text"
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
                placeholder="Örn: 250"
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none"
              />
            </div>
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
