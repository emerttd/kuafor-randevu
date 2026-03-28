import { AppointmentStatus } from "@prisma/client";
import { updateAppointmentStatus } from "@/app/calisan/actions";
import { SubmitButton } from "./submit-button";

function ActionForm({
  appointmentId,
  currentStatus,
  nextStatus,
  label,
  className,
}: {
  appointmentId: string;
  currentStatus: AppointmentStatus;
  nextStatus: AppointmentStatus;
  label: string;
  className: string;
}) {
  return (
    <form action={updateAppointmentStatus} className="flex-1">
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <input type="hidden" name="currentStatus" value={currentStatus} />
      <input type="hidden" name="nextStatus" value={nextStatus} />
      <SubmitButton label={label} className={className} />
    </form>
  );
}

export function StatusActions({
  appointmentId,
  status,
}: {
  appointmentId: string;
  status: AppointmentStatus;
}) {
  if (status === "PENDING") {
    return (
      <div className="flex gap-2 pt-1">
        <ActionForm appointmentId={appointmentId} currentStatus={status} nextStatus="CONFIRMED" label="Onayla" className="bg-blue-600 text-white" />
        <ActionForm appointmentId={appointmentId} currentStatus={status} nextStatus="CANCELLED" label="İptal Et" className="border border-red-200 text-red-600" />
      </div>
    );
  }

  if (status === "CONFIRMED") {
    return (
      <div className="flex gap-2 pt-1">
        <ActionForm appointmentId={appointmentId} currentStatus={status} nextStatus="COMPLETED" label="Tamamla" className="bg-green-600 text-white" />
        <ActionForm appointmentId={appointmentId} currentStatus={status} nextStatus="CANCELLED" label="İptal Et" className="border border-red-200 text-red-600" />
        <ActionForm appointmentId={appointmentId} currentStatus={status} nextStatus="PENDING" label="Geri Al" className="border border-border text-muted-foreground" />
      </div>
    );
  }

  if (status === "CANCELLED") {
    return (
      <div className="flex gap-2 pt-1">
        <ActionForm appointmentId={appointmentId} currentStatus={status} nextStatus="PENDING" label="Geri Al" className="border border-border text-muted-foreground" />
      </div>
    );
  }

  if (status === "COMPLETED") {
    return (
      <div className="flex gap-2 pt-1">
        <ActionForm appointmentId={appointmentId} currentStatus={status} nextStatus="CONFIRMED" label="Geri Al" className="border border-border text-muted-foreground" />
      </div>
    );
  }

  return null;
}
