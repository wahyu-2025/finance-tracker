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
import { useState } from "react";
import { useCallApi } from "@/hooks/useCallApi";
import { useWalletsApi } from "./api/useWalletsApi";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

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

const WalletsDialog = ({
  isDialogOpen,
  setIsDialogOpen,
  selectedWallet,
  actionType,
  onSuccess,
}: WalletsDialogProps) => {
  const { postWallet } = useWalletsApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const initialForm: FormWallet = {
    name: "",
    type: "CASH",
    initial_balance: 0,
    balance: 0,
  };
  const [form, setForm] = useState<FormWallet>(initialForm);

  const handleAddWallet = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Nama wallet wajib diisi");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await postWallet({
        name: form.name.trim(),
        type: form.type,
        initial_balance: form.initial_balance,
        balance: form.balance,
      });

      if (response.status) {
        toast.success("Wallet berhasil ditambahkan");
        setForm(initialForm);
        setIsDialogOpen(false);
        onSuccess();
      } else {
        toast.error(response.message || "Gagal menambahkan wallet");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {actionType === "edit" ? "Edit Wallet" : "Add Wallet"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddWallet}>
          <DialogBody className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="text-sm font-medium mb-1 block">
                  Bank Name
                </Label>
                <Input
                  placeholder="Name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="col-span-2">
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
              <div className="">
                <Label className="text-sm font-medium mb-1 block">
                  Initial Balance
                </Label>
                <Input
                  placeholder="Initial Balance"
                  type="number"
                  value={form.initial_balance}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      initial_balance: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="">
                <Label className="text-sm font-medium mb-1 block">
                  Balance
                </Label>
                <Input
                  placeholder="Balance"
                  type="number"
                  value={form.balance}
                  onChange={(e) =>
                    setForm({ ...form, balance: Number(e.target.value) })
                  }
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
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
