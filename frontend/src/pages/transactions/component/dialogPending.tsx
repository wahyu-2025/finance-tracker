import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/helpers";
import { TranscListForm } from "@/types";

interface StatusDialogProps {
  transc: TranscListForm | null;
  isUpdating: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DialogPending = ({
  transc,
  isUpdating,
  onClose,
  onConfirm,
}: StatusDialogProps) => {
  const toSuccess = transc?.is_pending === "Y";

  return (
    <Dialog
      open={transc !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ubah Status Transaksi</DialogTitle>
        </DialogHeader>

        <DialogBody className="space-y-3 py-4 text-sm">
          <p>
            Ubah status transaksi ini menjadi{" "}
            <b>{toSuccess ? "Success" : "Pending"}</b>?
          </p>

          <div className="rounded-md bg-muted/50 p-3">
            <p className="font-medium">{transc?.description || "-"}</p>
            <p className="text-muted-foreground">
              {transc?.category?.name ?? "Unknown"} ·{" "}
              {transc?.wallet?.name ?? "-"}
            </p>
            <p className="mt-1 font-semibold text-red-500">
              -{formatPrice(Number(transc?.amount ?? 0))}
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            {toSuccess
              ? "Setelah Success, saldo wallet akan berkurang sesuai nominal."
              : "Setelah Pending, nominal ini tidak lagi memotong saldo wallet sampai ditandai Success."}
          </p>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={onConfirm} disabled={isUpdating}>
            {isUpdating
              ? "Menyimpan..."
              : toSuccess
                ? "Tandai Success"
                : "Tandai Pending"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogPending;
