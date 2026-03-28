import { AppointmentStatus } from "@prisma/client";

const statusMap: Record<AppointmentStatus, { label: string; className: string }> = {
  PENDING: {
    label: "Bekliyor",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  CONFIRMED: {
    label: "Onaylandı",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  CANCELLED: {
    label: "İptal",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  COMPLETED: {
    label: "Tamamlandı",
    className: "bg-green-100 text-green-800 border-green-200",
  },
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const config = statusMap[status];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
