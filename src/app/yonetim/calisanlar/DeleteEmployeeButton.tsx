"use client";

import { deleteEmployee } from "./actions";

export function DeleteEmployeeButton({
  employeeId,
  employeeName,
}: {
  employeeId: string;
  employeeName: string;
}) {
  return (
    <form
      action={deleteEmployee}
      onSubmit={(e) => {
        if (!confirm(`"${employeeName}" silinsin mi? Geçmiş randevu kayıtları da silinecek.`))
          e.preventDefault();
      }}
      className="absolute right-3 top-3"
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
  );
}
