import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/components/layouts/layout-1/components/toolbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CatgList } from "@/types";
import BudgetCard from "./components/budgetCard";
import DialogBudget from "./components/dialogBudget";
import DialogBudgetDetail from "./components/budgetDetail";
import { UseBudgetApi } from "./api/useBudgetApi";
import { UseCatgApi } from "../categories/api/useCatgApi";
import {
  BudgetResponse,
  BudgItemRequestApi,
  BudgRequestApi,
} from "./types/budgetsTypes";

export function BudgetPage() {
  const {
    getBudget,
    getDetailBudget,
    postBudget,
    putBudget,
    deletedBudget,
    postBudgetItem,
    deletedBudgetItem,
  } = UseBudgetApi();
  const { getCategory } = UseCatgApi();

  const [isLoading, setIsLoading] = useState(false);
  const [budgetList, setBudgetList] = useState<BudgetResponse[]>([]);
  const [categories, setCategories] = useState<CatgList[]>([]);
  const [editingBudget, setEditingBudget] = useState<BudgetResponse | null>(
    null,
  );
  const [detailBudgetId, setDetailBudgetId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reload, setReload] = useState(0);

  const triggerReload = () => setReload((prev) => prev + 1);

  const catgList = categories.filter((catg) => catg.type === "EXPENSE");

  const sortBudgets = [...budgetList].sort((a, b) =>
    a.start_date.localeCompare(b.start_date),
  );

  const detailBudget = budgetList.find((b) => b.id === detailBudgetId) ?? null;

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await getCategory();
      if (response?.status) setCategories(response.data || []);
    };
    fetchCategories();
  }, []);

  const fetchBudget = async () => {
    setIsLoading(true);
    try {
      const response = await getBudget();
      if (!response.status) {
        toast.error(response.message || "Failed to load budget");
        return;
      }

      const details = await Promise.all(
        response.data.map(async (budg: BudgetResponse) => {
          const detail = await getDetailBudget(budg.id);
          return detail.status && detail.data
            ? (detail.data as BudgetResponse)
            : budg;
        }),
      );

      setBudgetList(details);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, [reload]);

  const openAddDialog = () => {
    setEditingBudget(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (budget: BudgetResponse) => {
    setEditingBudget(budget);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: BudgRequestApi) => {
    setIsSubmitting(true);
    try {
      const response = editingBudget
        ? await putBudget(editingBudget.id, data)
        : await postBudget(data);
      if (response?.status) {
        toast.success(
          editingBudget
            ? "Budget successfully updated"
            : "Budget successfully created",
        );
        setIsDialogOpen(false);
        setEditingBudget(null);
        triggerReload();
      } else {
        toast.error(response?.message || "Failed to save budget");
      }
    } catch {
      toast.error("An error occurred, please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this budget?")) return;
    const response = await deletedBudget(id);
    if (response?.status) {
      toast.success("Budget successfully deleted");
      if (detailBudgetId === id) setDetailBudgetId(null);
      triggerReload();
    } else {
      toast.error(response?.message || "Failed to delete budget");
    }
  };

  const handleAddItem = async (budget_id: number, data: BudgItemRequestApi) => {
    const response = await postBudgetItem(budget_id, data);
    if (response?.status) {
      toast.success("Category successfully added");
      triggerReload();
      return true;
    }
    toast.error(response?.message || "Failed to add category");
    return false;
  };

  const handleDeleteItem = async (budget_id: number, id: number) => {
    const response = await deletedBudgetItem(budget_id, id);
    if (response?.status) {
      toast.success("Category successfully removed from the budget");
      triggerReload();
    } else {
      toast.error(response?.message || "Failed to delete category");
    }
  };

  return (
    <div className="container space-y-6">
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle>Budgeting Cost</ToolbarPageTitle>
          <ToolbarDescription>
            Manage your income and expense budgets
          </ToolbarDescription>
        </ToolbarHeading>
        <ToolbarActions>
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add Budgeting
          </Button>
        </ToolbarActions>
      </Toolbar>

      {isLoading && budgetList.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          Loading...
        </Card>
      ) : sortBudgets.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          No Budgets Found
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
          {sortBudgets.map((budg) => (
            <BudgetCard
              key={budg.id}
              budget={budg}
              onEdit={openEditDialog}
              onDelete={handleDelete}
              onDetail={(b) => setDetailBudgetId(b.id)}
            />
          ))}
        </div>
      )}

      <DialogBudget
        isOpen={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingBudget(null);
        }}
        editingBudget={editingBudget}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />

      <DialogBudgetDetail
        budget={detailBudget}
        categories={catgList}
        onClose={() => setDetailBudgetId(null)}
        onAddItem={handleAddItem}
        onDeleteItem={handleDeleteItem}
      />
    </div>
  );
}
