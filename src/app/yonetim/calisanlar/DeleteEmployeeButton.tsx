"use client";

import { useActionState } from "react";
import { deleteEmployee } from "./actions";

export function DeleteEmployeeButton({
  employeeId,
  employeeName,
}: {
  employeeId: string;
  employeeName: string;
}) {
  const [state, formAction] = useActionState(deleteEmployee, null);

  return (
    <div className="absolute right-3 top-3">
      <form
        action={formAction}
        onSubmit={(e) => {
          if (!confirm(`"${employeeName}" silinsin mi? Geçmiş randevu kayıtları da silinecek.`))
            e.preventDefault();
        }}
      >
        <input type="hidden" name="employeeId" value={employeeId} />
        <button
          type="submit"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-destructive/10 text-destructive transition-colors hover:bg-destructive hover:text-white"
          aria-label="Sil"
        >
          ✕
        </button>
      </form>
      {state?.error && (
        <p className="mt-1 w-48 text-right text-xs text-destructive">{state.error}</p>
      )}
    </div>
  );
}
