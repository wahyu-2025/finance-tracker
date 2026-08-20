import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TransactionService, TransactionData } from "@/api/transaction.service";
import { CategoryService } from "@/api/category.service";
import { Category, Transaction, AxiosErrorResponse } from "@/types";
import {
  Toolbar,
  ToolbarHeading,
  ToolbarPageTitle,
  ToolbarDescription,
  ToolbarActions,
} from "@/components/layouts/layout-1/components/toolbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
} from "@/components/ui/dialog";
import { Edit2, Trash2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { format, subDays } from "date-fns";
import { formatPrice, parsePrice } from "@/lib/helpers";

export function TransactionsPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 90), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
  });

  // Form state
  const [amount, setAmount] = useState<number | null>(null);
  const [displayValue, setDisplayValue] = useState("");
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [categoryId, setCategoryId] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [description, setDescription] = useState("");

  const { data: historyResponse, isLoading: isLoadingTx } = useQuery({
    queryKey: ["transactions", "history", dateRange],
    queryFn: () =>
      TransactionService.getHistory(dateRange.startDate, dateRange.endDate),
  });

  const { data: categoriesResponse } = useQuery({
    queryKey: ["categories"],
    queryFn: CategoryService.getAll,
  });

  const transactions = historyResponse?.data?.history || [];
  const categories = categoriesResponse?.data || [];
  const filteredCategories = categories.filter(
    (c: Category) => c.type === type,
  );

  const resetForm = () => {
    setAmount(null);
    setType("EXPENSE");
    setCategoryId("");
    setTransactionDate(format(new Date(), "yyyy-MM-dd"));
    setDescription("");
    setEditingTransaction(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (tx: Transaction) => {
    setEditingTransaction(tx);
    setAmount(Number(tx.amount));
    setDisplayValue(formatPrice(Number(tx.amount)))
    setType(tx.type);
    setCategoryId(tx.category_id.toString());
    setTransactionDate(format(new Date(tx.transaction_date), "yyyy-MM-dd"));
    setDescription(tx.description || "");
    setIsDialogOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: TransactionService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setIsDialogOpen(false);
      toast.success("Transaction added successfully");
    },
    onError: (err: AxiosErrorResponse) => {
      toast.error(err.response?.data?.message || "Failed to add transaction");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: TransactionData) => {
      const {id, ...rest} = data
      return TransactionService.update(id!, rest)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setIsDialogOpen(false);
      toast.success("Transaction updated successfully");
    },
    onError: (err: AxiosErrorResponse) => {
      toast.error(
        err.response?.data?.message || "Failed to update transaction",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: TransactionService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction deleted successfully");
    },
    onError: (err: AxiosErrorResponse) => {
      toast.error(
        err.response?.data?.message || "Failed to delete transaction",
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: TransactionData = {
      amount: Number(amount),
      type,
      category_id: Number(categoryId),
      transaction_date: transactionDate,
      description,
    };

    if (editingTransaction) {
      updateMutation.mutate({ ...payload, id: editingTransaction.id });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      deleteMutation.mutate(id);
    }
  };

  useEffect(() => {
    if (!isDialogOpen) {
      setAmount(null)
      setDisplayValue("")
    }
  }, [isDialogOpen])

  return (
    <div className="container space-y-6">
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle>Transactions</ToolbarPageTitle>
          <ToolbarDescription>
            View and manage your transactions
          </ToolbarDescription>
        </ToolbarHeading>
        <ToolbarActions>
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add Transaction
          </Button>
        </ToolbarActions>
      </Toolbar>

      <Card className=" p-4 flex gap-4 flex-wrap">
        <div>
          <label className="text-xs font-medium mb-1 block">Start Date</label>
          <Input
            type="date"
            value={dateRange.startDate}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block">End Date</label>
          <Input
            type="date"
            value={dateRange.endDate}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
            }
          />
        </div>
        <Button
          variant="outline"
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["transactions"] })
          }
        >
          <Search className="mr-2 h-4 w-4" /> Filter
        </Button>
      </Card>

      <Card className="glassmorphism p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="w-25">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingTx ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  Loading...
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    {format(new Date(tx.transaction_date), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="font-medium">
                    {tx.description || "-"}
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded bg-secondary text-secondary-foreground text-xs">
                      {tx.category?.name || "Unknown"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-semibold ${tx.type === "INCOME" ? "text-green-500" : "text-red-500"}`}
                    >
                      {tx.type === "INCOME" ? "+" : "-"}
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 2,
                      }).format(Number(tx.amount))}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(tx)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(tx.id!)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? "Edit Transaction" : "Add Transaction"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <DialogBody className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Type</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={type}
                    onChange={(e) => {
                      setType(e.target.value as "INCOME" | "EXPENSE");
                      setCategoryId(""); // reset category on type change
                    }}
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Amount
                  </label>
                  <Input
                    type="text"
                    value={displayValue}
                    placeholder="Rp. 0,00"
                    required
                    onChange={(e) => {
                      const raw = e.target.value;

                      setDisplayValue(raw);

                      setAmount(parsePrice(raw));
                    }}
                    onBlur={() => {
                      if (amount !== null) {
                        setDisplayValue(formatPrice(amount));
                      }
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Category
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {filteredCategories.map((c: Category) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {filteredCategories.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    No categories found for this type. Add one first.
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Date</label>
                <Input
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Description
                </label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional details"
                />
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
                disabled={
                  createMutation.isPending ||
                  updateMutation.isPending ||
                  !categoryId
                }
              >
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
