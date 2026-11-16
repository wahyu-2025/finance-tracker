import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BudgetResponse, BudgRequestApi } from "../types/budgetsTypes";

interface DialogBudgetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingBudget: BudgetResponse | null;
  isSubmitting: boolean;
  onSubmit: (data: BudgRequestApi) => void;
}

const DialogBudget = ({
  isOpen,
  onOpenChange,
  editingBudget,
  isSubmitting,
  onSubmit,
}: DialogBudgetProps) => {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setName(editingBudget?.name ?? "");
    setStartDate(editingBudget?.start_date ?? "");
    setEndDate(editingBudget?.end_date ?? "");
  }, [isOpen, editingBudget]);

  const isDateInvalid =
    startDate !== "" && endDate !== "" && endDate < startDate;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-1.5rem)] max-w-lg sm:w-full">
        <DialogHeader>
          <DialogTitle>
            {editingBudget ? "Edit Budgeting" : "Add Budgeting"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isDateInvalid) return;
            onSubmit({
              name: name.trim(),
              start_date: startDate,
              end_date: endDate,
            });
          }}
        >
          <DialogBody className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Budget...."
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  End Date
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
            {isDateInvalid && (
              <p className="text-xs text-red-500">
                End date harus setelah start date.
              </p>
            )}
            {!editingBudget && (
              <p className="text-xs text-muted-foreground">
                Kategori bisa ditambahkan dari tombol View Detail setelah budget
                dibuat.
              </p>
            )}
          </DialogBody>
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isDateInvalid}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DialogBudget;
