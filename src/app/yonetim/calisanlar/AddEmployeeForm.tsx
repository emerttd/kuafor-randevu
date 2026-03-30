"use client";

import { useState } from "react";
import { SubmitButton } from "@/components/ui/submit-button";
import { createEmployee } from "./actions";

export function AddEmployeeForm() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-6">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="h-10 rounded-xl bg-foreground px-4 text-sm font-medium text-background"
        >
          + Yeni Çalışan Ekle
        </button>
      ) : (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Yeni Çalışan Ekle</h2>
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              İptal
            </button>
          </div>
          <form action={createEmployee} className="space-y-3">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-foreground">
                Çalışan adı
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Örn: Ahmet Yılmaz"
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <SubmitButton label="Ekle" className="h-11 bg-foreground text-background" />
          </form>
        </div>
      )}
    </div>
  );
}
