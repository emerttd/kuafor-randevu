"use client";

import { deleteService } from "./actions";

export function DeleteServiceButton({
  serviceId,
  serviceName,
}: {
  serviceId: string;
  serviceName: string;
}) {
  return (
    <form
      action={deleteService}
      onSubmit={(e) => {
        if (!confirm(`"${serviceName}" silinsin mi?`)) e.preventDefault();
      }}
      className="absolute right-3 top-3"
    >
      <input type="hidden" name="serviceId" value={serviceId} />
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
