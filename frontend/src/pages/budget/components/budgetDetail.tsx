import { useState } from "react";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice, parsePrice } from "@/lib/helpers";
import { CatgList } from "@/types";
import { BudgetResponse, BudgItemRequestApi } from "../types/budgetsTypes";
import { ConfirmDialog } from "./deleteBudget";
import {
  StatBox,
  UsageBar,
  formatDate,
  getBudgetSummary,
  getUsageColor,
} from "./budgetUtils";

interface DialogBudgetDetailProps {
  budget: BudgetResponse | null;
  categories: CatgList[];
  onClose: () => void;
  onAddItem: (budget_id: number, data: BudgItemRequestApi) => Promise<boolean>;
  onDeleteItem: (budget_id: number, id: number) => Promise<void>;
}

const DialogBudgetDetail = ({
  budget,
  categories,
  onClose,
  onAddItem,
  onDeleteItem,
}: DialogBudgetDetailProps) => {
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState<number | null>(null);
  const [displayValue, setDisplayValue] = useState("");
  const [itemName, setItemName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const items = budget?.budget_items ?? [];
  const summary = budget
    ? getBudgetSummary(budget)
    : { totalAmount: 0, usage: 0, remaining: 0, percentage: 0 };
  const summaryColor = getUsageColor(summary.percentage);

  const usedIds = items.map((item) => item.category_id);
  const availableCategories = categories.filter((c) => !usedIds.includes(c.id));

  const resetForm = () => {
    setItemName("");
    setCategoryId("");
    setAmount(null);
    setDisplayValue("");
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budget || !categoryId || !amount) return;

    const selectedCategory = categories.find(
      (c) => c.id === Number(categoryId),
    );

    setIsAdding(true);
    const success = await onAddItem(budget.id, {
      name: itemName.trim() || selectedCategory?.name || "",
      category_id: Number(categoryId),
      amount,
    });
    setIsAdding(false);
    if (success) resetForm();
  };

  const handleDelete = (itemId: number, itemName: string) => {
    setDeleteItem({ id: itemId, name: itemName });
  };

  const handleConfirmDelete = async () => {
    if (!budget || !deleteItem) return;
    setIsDeleting(true);
    try {
      await onDeleteItem(budget.id, deleteItem.id);
    } finally {
      setIsDeleting(false);
      setDeleteItem(null);
    }
  };

  return (
    <>
      <Dialog
        open={budget !== null}
        onOpenChange={(open) => {
          if (!open) {
            resetForm();
            setDeleteItem(null);
            onClose();
          }
        }}
      >
        <DialogContent className="w-[calc(100%-1.5rem)] max-w-2xl p-0 sm:w-full">
          <DialogHeader className="border-b px-4 py-4 sm:px-6">
            <DialogTitle className="truncate pr-6 p-2">
              {budget?.name}
            </DialogTitle>
            {budget && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                {formatDate(budget.start_date)} – {formatDate(budget.end_date)}
              </p>
            )}
          </DialogHeader>

          <DialogBody className="max-h-[75dvh] space-y-5 overflow-y-auto px-4 py-4 sm:px-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatBox label="Total Budget" value={summary.totalAmount} />
              <StatBox label="Usage" value={summary.usage} />
              <StatBox
                label="Remaining"
                value={summary.remaining}
                valueClassName={
                  summary.remaining < 0
                    ? "text-red-500"
                    : "text-green-600 dark:text-green-400"
                }
              />
              <StatBox
                label="Total Percentage"
                value={`${summary.percentage}%`}
                valueClassName={summaryColor.text}
              />
            </div>
            <UsageBar percentage={summary.percentage} className="h-2.5" />

            {/* Daftar item */}
            <div className="space-y-3">
              <p className="text-sm font-semibold">
                Budget List{" "}
                <span className="font-normal text-muted-foreground">
                  ({items.length})
                </span>
              </p>

              {items.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No Budget List yet
                </div>
              ) : (
                items.map((item) => {
                  const displayName =
                    item.name || item.category?.name || "Unknown";
                  const categoryName = item.category?.name;
                  const itemAmount = Number(item.amount);
                  const usage = Number(item.usage ?? 0);
                  const remaining = Number(
                    item.remaining ?? itemAmount - usage,
                  );
                  const percentage = Math.round(
                    Number(item.usage_percentage ?? 0),
                  );
                  const color = getUsageColor(percentage);

                  return (
                    <div
                      key={item.id}
                      className="rounded-lg border p-3 transition hover:-translate-y-1 hover:border-emerald-500/100"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <p className="truncate font-medium">
                              {displayName}
                            </p>
                            {categoryName && categoryName !== displayName && (
                              <span className="rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                                {categoryName}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatPrice(usage)} / {formatPrice(itemAmount)}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <span
                            className={`text-sm font-semibold ${color.text}`}
                          >
                            {percentage}%
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDelete(item.id, displayName)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      <UsageBar percentage={percentage} className="mt-2 h-2" />
                      <p
                        className={`mt-1 text-xs ${
                          remaining < 0
                            ? "text-red-500"
                            : "text-muted-foreground"
                        }`}
                      >
                        {remaining < 0
                          ? `Over by ${formatPrice(Math.abs(remaining))}`
                          : `Remaining ${formatPrice(remaining)}`}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleAdd} className="space-y-2 border-t pt-4">
              <p className="text-sm font-semibold">Add Budget Items</p>
              <div className="h-12">
                <Input
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Input Name......"
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:flex-1"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={availableCategories.length === 0}
                  required
                >
                  <option value="" disabled>
                    {availableCategories.length === 0
                      ? "All categories added"
                      : "Select a category"}
                  </option>
                  {availableCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={displayValue}
                  placeholder="Rp. 0,00"
                  className="sm:w-44"
                  required
                  onChange={(e) => {
                    setDisplayValue(e.target.value);
                    setAmount(parsePrice(e.target.value));
                  }}
                  onBlur={() => {
                    if (amount !== null) setDisplayValue(formatPrice(amount));
                  }}
                />
                <Button
                  type="submit"
                  disabled={isAdding || !categoryId || !amount}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {isAdding ? "Adding..." : "Add"}
                </Button>
              </div>
            </form>
          </DialogBody>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteItem !== null}
        title="Delete budget item?"
        description={
          <>
            <b>{deleteItem?.name}</b> will be removed from this budget.
          </>
        }
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteItem(null)}
      />
    </>
  );
};

export default DialogBudgetDetail;
