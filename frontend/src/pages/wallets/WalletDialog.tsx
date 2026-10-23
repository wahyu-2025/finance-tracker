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
import { Wallets } from "@/types";

interface WalletsDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (value: boolean) => void;
  selectedWallet: Wallets | null;
  actionType: "add" | "edit";
}

const WalletsDialog = ({
  isDialogOpen,
  setIsDialogOpen,
  selectedWallet,
  actionType,
}: WalletsDialogProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {actionType === "edit" ? "Edit Wallet" : "Add Wallet"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Type</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  //   value={type}
                  //   onChange={(e) => {
                  //     setType(e.target.value as "INCOME" | "EXPENSE");
                  //     setCategoryId(""); // reset category on type change
                  //   }}
                >
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Amount</label>
                <Input
                //   type="text"
                //   value={displayValue}
                //   placeholder="Rp. 0,00"
                //   required
                //   onChange={(e) => {
                //     const raw = e.target.value;

                //     setDisplayValue(raw);

                //     setAmount(parsePrice(raw));
                //   }}
                //   onBlur={() => {
                //     if (amount !== null) {
                //       setDisplayValue(formatPrice(amount));
                //     }
                //   }}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
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
            <Button
              type="submit"
              //   disabled={
              //     createMutation.isPending ||
              //     updateMutation.isPending ||
              //     !categoryId
              //   }
            >
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WalletsDialog;
