import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WalletList, WalletType } from "@/types";
import { useWalletsApi } from "./api/useWalletsApi";
import { toast } from "sonner";

interface WalletsDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (value: boolean) => void;
  selectedWallet: WalletList | null;
  actionType: "add" | "edit";
  onSuccess: () => void;
}

interface FormWallet {
  name: string;
  type: WalletType;
  initial_balance: number;
  balance: number;
}

const initialForm: FormWallet = {
  name: "",
  type: "CASH",
  initial_balance: 0,
  balance: 0,
};

const WalletsDialog = ({
  isDialogOpen,
  setIsDialogOpen,
  selectedWallet,
  actionType,
  onSuccess,
}: WalletsDialogProps) => {
  const { postWallet, putWallet } = useWalletsApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<FormWallet>(initialForm);

  const isEdit = actionType === "edit" && selectedWallet !== null;

  useEffect(() => {
    if (!isDialogOpen) return;
    if (isEdit && selectedWallet) {
      setForm({
        name: selectedWallet.name ?? "",
        type: selectedWallet.type as WalletType,
        initial_balance: Number(selectedWallet.initial_balance ?? 0),
        balance: Number(selectedWallet.balance ?? 0),
      });
    } else {
      setForm(initialForm);
    }
  }, [isDialogOpen, isEdit, selectedWallet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Wallet name is required");
      return;
    }

    const data = {
      name: form.name.trim(),
      type: form.type,
      initial_balance: form.initial_balance,
      balance: form.balance,
    };

    setIsSubmitting(true);
    try {
      const response =
        isEdit && selectedWallet
          ? await putWallet(selectedWallet.id, data)
          : await postWallet(data);

      if (response.status) {
        toast.success(
          response.message ||
            (isEdit
              ? "Wallet successfully updated"
              : "Wallet successfully added"),
        );
        setForm(initialForm);
        setIsDialogOpen(false);
        onSuccess();
      } else {
        toast.error(
          response.message ||
            (isEdit ? "Failed to change wallet" : "Failed to add wallet"),
        );
      }
    } catch {
      toast.error("There is an error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="w-[calc(100%-1.5rem)] max-w-lg sm:w-full">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Wallet" : "Add Wallet"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-medium mb-1 block">
                Bank Name
              </Label>
              <Input
                placeholder="Bank Name......"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-1 block">Type</Label>
              <Select
                value={form.type}
                onValueChange={(value) =>
                  setForm({ ...form, type: value as WalletType })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="BANK">Bank</SelectItem>
                  <SelectItem value="EWALLET">E-Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-sm font-medium mb-1 block">
                  Initial Balance
                </Label>
                <Input
                  placeholder="Initial Balance"
                  type="number"
                  inputMode="numeric"
                  value={form.initial_balance}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      initial_balance: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-1 block">
                  Balance
                </Label>
                <Input
                  placeholder="Balance"
                  type="number"
                  inputMode="numeric"
                  value={form.balance}
                  onChange={(e) =>
                    setForm({ ...form, balance: Number(e.target.value) })
                  }
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WalletsDialog;
