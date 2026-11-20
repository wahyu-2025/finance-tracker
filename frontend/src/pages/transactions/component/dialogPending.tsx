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
          <DialogTitle>Change Transaction Status</DialogTitle>
        </DialogHeader>

        <DialogBody className="space-y-3 py-4 text-sm">
          <p>
            Change the status of this transaction to{" "}
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
              ? "Once successful, the wallet balance will decrease by the corresponding amount."
              : "Once in Pending status, this amount will no longer be deducted from your wallet balance until it is marked as Success."}
          </p>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isUpdating}>
            {isUpdating
              ? "Saving..."
              : toSuccess
                ? "Mark as Success"
                : "Mark as Pending"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogPending;
