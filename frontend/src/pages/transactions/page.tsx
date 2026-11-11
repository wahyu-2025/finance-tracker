import { useEffect, useState } from "react";
import { TranscListForm, CatgList, dateRangeProps } from "@/types";
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
  TableFooter,
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
import { Edit2, Trash2, Plus, Search, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { formatPrice, parsePrice } from "@/lib/helpers";
import { useIsMobile } from "@/hooks/use-mobile";
import { TranscApiForm, UseTranscApi } from "./api/useTranscApi";
import { UseCatgApi } from "../categories/api/useCatgApi";
import { useWalletsApi } from "../wallets/api/useWalletsApi";
import { useAuth } from "@/contexts/AuthContext";
import StatusPending from "./component/statusPending";
import DialogPending from "./component/dialogPending";
import { TransactionListParams } from "@/api/transaction.service";
import { TablePagination } from "@/components/ui/table-pagination";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const tgl = (transc: number) => String(transc).padStart(2, "0");

const getMonthRange = (): dateRangeProps => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const lastDay = new Date(year, month, 0).getDate();
  return {
    startDate: `${year}-${tgl(month)}-01`,
    endDate: `${year}-${tgl(month)}-${tgl(lastDay)}`,
  };
};

const Status_Options = [
  { value: "N", label: "Success" },
  { value: "Y", label: "Pending" },
] as const;

interface WalletsOption {
  id: number;
  name: string;
}

export function TransactionsPage() {
  const { deleteTransc, getTransc, postTransac, putTransac, confirmTransc } =
    UseTranscApi();
  const { getCategory } = UseCatgApi();
  const { getWalletList } = useWalletsApi();
  const { user } = useAuth();

  const [reload, setReload] = useState(0);
  const [categories, setCategories] = useState<CatgList[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [walletDatas, setWallteDatas] = useState<WalletsOption[]>([]);
  const [transcList, setTranscList] = useState<TranscListForm[]>([]);
  const [dateRange] = useState<dateRangeProps>(getMonthRange());
  const [selectTransc, setSelectTransc] = useState<TranscListForm | null>(null);
  const isMobile = useIsMobile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<TranscListForm | null>(null);
  const [statusTransc, setStatusTransc] = useState<TranscListForm | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isPending, setIsPending] = useState<"Y" | "N">("N");
  const [amount, setAmount] = useState<number | null>(null);
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [displayValue, setDisplayValue] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [walletsId, setWalletsId] = useState("");
  const [description, setDescription] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );

  const [filterForm, setFilterForm] = useState({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    type: "",
    category_id: "",
    wallet_id: "",
    is_pending: "",
  });

  const intitalFilter: TransactionListParams = {
    page: 1,
    limit: 5,
    category_id: undefined,
    wallet_id: undefined,
    type: undefined,
    is_pending: undefined,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  };

  const [filterParams, setFilterParams] =
    useState<TransactionListParams>(intitalFilter);

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await getCategory();
      if (response?.status) {
        setCategories(response.data || []);
      }
    };
    const fetchWallets = async () => {
      if (!user?.id) return;
      const res = await getWalletList(user.id);
      if (res?.status) {
        setWallteDatas(res.data || []);
      }
    };
    fetchCategories();
    fetchWallets();
  }, [user?.id]);

  const fetchListTransac = async (params: TransactionListParams) => {
    setIsLoading(true);
    const response = await getTransc(params);
    if (response?.status) {
      setTranscList(response.data?.list || []);
      if (response.data?.wallets) {
        setWallteDatas(response.data.wallets);
      }
      setTotalCount(response.data?.total_count || 0);
    } else {
      toast.error("Table Gagal dimuat bro");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const payload: TransactionListParams = filterParams;
    fetchListTransac(payload);
  }, [reload, filterParams]);

  const handleApplyFilter = () => {
    setFilterParams((prev) => ({
      ...prev,
      page: 1,
      startDate: filterForm.startDate || undefined,
      endDate: filterForm.endDate || undefined,
      type: (filterForm.type as "INCOME" | "EXPENSE") || undefined,
      category_id: filterForm.category_id
        ? Number(filterForm.category_id)
        : undefined,
      wallet_id: filterForm.wallet_id
        ? Number(filterForm.wallet_id)
        : undefined,
      is_pending: (filterForm.is_pending as "Y" | "N") || undefined,
    }));
  };

  const handleResetFilter = () => {
    const freshRange = getMonthRange();
    setFilterForm({
      startDate: freshRange.startDate,
      endDate: freshRange.endDate,
      type: "",
      category_id: "",
      wallet_id: "",
      is_pending: "",
    });
    setFilterParams({
      page: 1,
      limit: filterParams.limit || 5,
      startDate: freshRange.startDate,
      endDate: freshRange.endDate,
      type: undefined,
      category_id: undefined,
      wallet_id: undefined,
      is_pending: undefined,
    });
  };

  const triggerReload = () => {
    setReload((prev) => prev + 1);
  };

  const resetForm = () => {
    setAmount(null);
    setDisplayValue("");
    setType("EXPENSE");
    setIsPending("N");
    setCategoryId("");
    setWalletsId("");
    setTransactionDate(format(new Date(), "yyyy-MM-dd"));
    setDescription("");
    setEditingTransaction(null);
    setSelectTransc(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (transc: TranscListForm) => {
    setEditingTransaction(transc);
    setSelectTransc(transc);
    setWalletsId(String(transc.wallet_id));
    setAmount(Number(transc.amount));
    setIsPending(transc.is_pending);
    setDisplayValue(formatPrice(Number(transc.amount)));
    setType(transc.type);
    setCategoryId(transc.category_id.toString());
    setTransactionDate(format(new Date(transc.transaction_date), "yyyy-MM-dd"));
    setDescription(transc.description || "");
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: TranscApiForm) => {
    setIsLoading(true);
    try {
      if (editingTransaction && selectTransc) {
        delete data.is_pending;
        const response = await putTransac(selectTransc.id, data);
        if (response?.status) {
          toast.success("Sukses Cuyyyy");
          setIsDialogOpen(false);
          triggerReload();
          resetForm();
        } else {
          toast.error("Di cek dulu ada yg belum di isi tuuh");
        }
      } else {
        const response = await postTransac(data);
        if (response?.status) {
          toast.success("Di cek dulu ada yg belum di isi tuuh");
          setIsDialogOpen(false);
          triggerReload();
          resetForm();
        }
      }
    } catch {
      toast.error("Cek semua nya dulu cuyy ada yang janggal nih");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleted = async (id: number) => {
    try {
      const response = await deleteTransc(id);
      if (response?.status) {
        toast.success("Data nya berhasil ilang ni bro");
        triggerReload();
      } else {
        toast.error("delete gagal bro");
      }
    } catch {
      toast.error("delete gagal bro, cek koneksi lu dulu gih");
    }
  };

  const handleConfirm = async () => {
    if (!statusTransc) return;
    setIsUpdatingStatus(true);
    try {
      const response = await confirmTransc(statusTransc.id);
      if (response?.status) {
        toast.success("Status berhasil diubah jadi Success");
        setStatusTransc(null);
        triggerReload();
      } else {
        toast.error(response?.message || "Gagal mengubah status");
      }
    } catch {
      toast.error("Terjadi kesalahan, coba lagi");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

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

      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground block mb-1">
              Start Date
            </Label>
            <Input
              type="date"
              className="h-9 text-xs"
              value={filterForm.startDate}
              onChange={(e) =>
                setFilterForm((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground block mb-1">
              End Date
            </Label>
            <Input
              type="date"
              className="h-9 text-xs"
              value={filterForm.endDate}
              onChange={(e) =>
                setFilterForm((prev) => ({ ...prev, endDate: e.target.value }))
              }
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground block mb-1">
              Type
            </Label>
            <Select
              value={filterForm.type || "ALL"}
              onValueChange={(val) =>
                setFilterForm((prev) => ({
                  ...prev,
                  type: val === "ALL" ? "" : val,
                }))
              }
            >
              <SelectTrigger className="h-9 w-full text-xs" size="sm">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent side="bottom">
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="EXPENSE">Expense</SelectItem>
                <SelectItem value="INCOME">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground block mb-1">
              Category
            </Label>
            <Select
              value={filterForm.category_id || "ALL"}
              onValueChange={(val) =>
                setFilterForm((prev) => ({
                  ...prev,
                  category_id: val === "ALL" ? "" : val,
                }))
              }
            >
              <SelectTrigger className="h-9 w-full text-xs" size="sm">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent side="bottom">
                <SelectItem value="ALL">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground block mb-1">
              Wallet
            </Label>
            <Select
              value={filterForm.wallet_id || "ALL"}
              onValueChange={(val) =>
                setFilterForm((prev) => ({
                  ...prev,
                  wallet_id: val === "ALL" ? "" : val,
                }))
              }
            >
              <SelectTrigger className="h-9 w-full text-xs" size="sm">
                <SelectValue placeholder="All Wallets" />
              </SelectTrigger>
              <SelectContent side="bottom">
                <SelectItem value="ALL">All Wallets</SelectItem>
                {walletDatas.map((w) => (
                  <SelectItem key={w.id} value={String(w.id)}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground block mb-1">
              Status
            </Label>
            <Select
              value={filterForm.is_pending || "ALL"}
              onValueChange={(val) =>
                setFilterForm((prev) => ({
                  ...prev,
                  is_pending: val === "ALL" ? "" : val,
                }))
              }
            >
              <SelectTrigger className="h-9 w-full text-xs" size="sm">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent side="bottom">
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="N">Success</SelectItem>
                <SelectItem value="Y">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={handleResetFilter}
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset
          </Button>
          <Button size="sm" className="h-8 text-xs" onClick={handleApplyFilter}>
            <Search className="mr-1.5 h-3.5 w-3.5" /> Apply Filter
          </Button>
        </div>
      </Card>

      {isMobile ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4">
            {isLoading ? (
              <div className="text-center p-8 text-muted-foreground bg-muted/20 rounded-lg">
                Loading...
              </div>
            ) : transcList.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground bg-muted/20 rounded-lg">
                No transactions found
              </div>
            ) : (
              transcList.map((transc) => (
                <Card key={transc.id} className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{transc.description || "-"}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(
                          new Date(transc.transaction_date),
                          "MMM dd, yyyy",
                        )}
                      </p>
                    </div>
                    <span
                      className={`font-bold ${transc.type === "INCOME" ? "text-green-500" : "text-red-500"}`}
                    >
                      {transc.type === "INCOME" ? "+" : "-"}
                      {formatPrice(Number(transc.amount))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded bg-secondary text-secondary-foreground text-xs">
                        {transc.category?.name ?? "Unknown"}
                      </span>
                      <StatusPending
                        transc={transc}
                        onClick={setStatusTransc}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(transc)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDeleted(transc.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          <Card className="p-3">
            <TablePagination
              page={filterParams.page}
              limit={filterParams.limit}
              totalCount={totalCount}
              isLoading={isLoading}
              onPageChange={(e) =>
                setFilterParams({ ...filterParams, page: e })
              }
              onLimitChange={(e) =>
                setFilterParams({ ...filterParams, limit: e })
              }
            />
          </Card>
        </div>
      ) : (
        <Card className="glassmorphism p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-25">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : transcList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transcList.map((transc) => (
                  <TableRow key={transc.id}>
                    <TableCell>
                      {format(
                        new Date(transc.transaction_date),
                        "MMM dd, yyyy",
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {transc.description || "-"}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded bg-secondary text-secondary-foreground text-xs">
                        {transc.category?.name ?? "Unknown"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`font-semibold ${transc.type === "INCOME" ? "text-green-500" : "text-red-500"}`}
                      >
                        {transc.type === "INCOME" ? "+" : "-"}
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 2,
                        }).format(Number(transc.amount))}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusPending
                        transc={transc}
                        onClick={setStatusTransc}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(transc)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleted(transc.id)}
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
          <TableFooter className="px-3">
            <TablePagination
              page={filterParams.page}
              limit={filterParams.limit}
              totalCount={totalCount}
              isLoading={isLoading}
              onPageChange={(e) =>
                setFilterParams({ ...filterParams, page: e })
              }
              onLimitChange={(e) =>
                setFilterParams({ ...filterParams, limit: e })
              }
            />
          </TableFooter>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? "Edit Transaction" : "Add Transaction"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit({
                wallet_id: Number(walletsId),
                category_id: Number(categoryId),
                type,
                amount: amount ?? 0,
                is_pending: type === "EXPENSE" ? isPending : "N",
                transaction_date: transactionDate,
                description,
              });
            }}
          >
            <DialogBody className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-1 block">Type</Label>
                  <Select
                    value={type}
                    onValueChange={(val) => {
                      const newType = val as "INCOME" | "EXPENSE";
                      setType(newType);
                      setCategoryId("");
                      if (newType === "INCOME") setIsPending("N");
                    }}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EXPENSE">Expense</SelectItem>
                      <SelectItem value="INCOME">Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">
                    Amount
                  </Label>
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
                <Label className="text-sm font-medium mb-1 block">Status</Label>
                <div className="flex gap-6">
                  {Status_Options.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-2 text-sm ${
                        type === "INCOME" || !!editingTransaction
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer"
                      }`}
                    >
                      <input
                        type="radio"
                        name="is_pending"
                        value={opt.value}
                        checked={isPending === opt.value}
                        onChange={() => setIsPending(opt.value)}
                        disabled={type === "INCOME" || !!editingTransaction}
                        className="h-4 w-4 accent-emerald-600"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
                {type === "INCOME" && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Status pending hanya untuk pengeluaran.
                  </p>
                )}
                {type === "EXPENSE" && isPending === "Y" && (
                  <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                    Transaksi pending belum memotong saldo wallet.
                  </p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium mb-1 block">Wallet</Label>
                <Select
                  value={walletsId}
                  onValueChange={(val) => setWalletsId(val)}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Select a wallet" />
                  </SelectTrigger>
                  <SelectContent>
                    {walletDatas.map((w) => (
                      <SelectItem key={w.id} value={String(w.id)}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-1 block">
                  Category
                </Label>
                <Select
                  value={categoryId}
                  onValueChange={(val) => setCategoryId(val)}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c: CatgList) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {categories.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    No categories found for this type. Add one first.
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium mb-1 block">Date</Label>
                <Input
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-1 block">
                  Description
                </Label>
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
              <Button type="submit">{isLoading ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DialogPending
        transc={statusTransc}
        isUpdating={isUpdatingStatus}
        onClose={() => setStatusTransc(null)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
