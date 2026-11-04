import { TranscListForm } from "@/types";

interface StatusBadgeProps {
  transc: TranscListForm;
  onClick: (transc: TranscListForm) => void;
}

const StatusPending = ({ transc, onClick }: StatusBadgeProps) => {
  const canChange = transc.type === "EXPENSE";

  return (
    <button
      type="button"
      onClick={() => onClick(transc)}
      disabled={!canChange}
      title={canChange ? "Klik untuk ubah status" : undefined}
      className={`rounded-full px-2.5 py-1 text-xs font-semibold transition disabled:cursor-default ${
        transc.is_pending === "Y"
          ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100"
      } ${
        canChange
          ? transc.is_pending === "Y"
            ? "hover:bg-amber-200"
            : "hover:bg-emerald-200"
          : ""
      }`}
    >
      {transc.is_pending === "Y" ? "Pending" : "Success"}
    </button>
  );
};

export default StatusPending;
