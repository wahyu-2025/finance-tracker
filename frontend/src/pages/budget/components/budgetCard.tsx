import { useState } from "react";
import { CalendarDays, Edit2, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BudgetResponse } from "../types/budgetsTypes";
import { ConfirmDialog } from "./deleteBudget";
import {
  StatBox,
  formatDate,
  getBudgetSummary,
  getStatus,
} from "./budgetUtils";

interface BudgetCardProps {
  budget: BudgetResponse;
  onEdit: (budget: BudgetResponse) => void;
  onDelete: (id: number) => Promise<void>;
  onDetail: (budget: BudgetResponse) => void;
}

const BudgetCard = ({
  budget,
  onEdit,
  onDelete,
  onDetail,
}: BudgetCardProps) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const status = getStatus(budget.start_date, budget.end_date);
  const { totalAmount, usage, remaining } = getBudgetSummary(budget);
  const itemCount = budget.budget_items?.length ?? 0;

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(budget.id);
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  };

  return (
    <>
      <Card className="glassmorphism p-0 overflow-hidden flex flex-col">
        <div className="flex items-start justify-between gap-3 border-b p-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold truncate">{budget.name}</p>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${status.className}`}
              >
                {status.label}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              {formatDate(budget.start_date)} – {formatDate(budget.end_date)}
            </p>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(budget)}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsConfirmOpen(true)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>

        <div className="space-y-3 p-4">
          <StatBox label="Total Budget" value={totalAmount} size="lg" />
          <div className="grid grid-cols-2 gap-3">
            <StatBox label="Usage" value={usage} />
            <StatBox
              label="Remaining"
              value={remaining}
              valueClassName={
                remaining < 0
                  ? "text-red-500"
                  : "text-green-600 dark:text-green-400"
              }
            />
          </div>
        </div>

        <div className="mt-auto border-t p-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onDetail(budget)}
          >
            <Eye className="mr-2 h-4 w-4" /> View Detail
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        open={isConfirmOpen}
        title="Delete Budget ?"
        description={
          <>
            Budget <b>{budget.name}</b>
            {itemCount > 0 && (
              <> A long with {itemCount} items within it</>
            )}{" "}
            will be deleted and cannot be recovered.
          </>
        }
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
};

export default BudgetCard;
