import { useEffect, useState } from "react";
import { TranscListForm, CatgList } from "@/types";
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
import { format } from "date-fns";
import { formatPrice, parsePrice } from "@/lib/helpers";
import { useIsMobile } from "@/hooks/use-mobile";
import { TranscApiForm, TranscGetList, UseTranscApi } from "./api/useTranscApi";
import { UseCatgApi } from "../categories/api/useCatgApi";
import StatusPending from "./component/statusPending";
import DialogPending from "./component/dialogPending";

const tgl = (transc: number) => String(transc).padStart(2, "0");

const getMonthRange = () => {
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
  const [reload, setReload] = useState(0);
  const [categories, setCategories] = useState<CatgList[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [walletDatas, setWallteDatas] = useState<WalletsOption[]>([]);
  const [transcList, setTranscList] = useState<TranscListForm[]>([]);
  const [dateRange, setDateRange] = useState<TranscGetList>(getMonthRange());
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

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await getCategory();
      if (response?.status) {
        setCategories(response.data || []);
      }
    };
    fetchCategories();
  }, []);

  const fetchListTransac = async (params: TranscGetList) => {
    setIsLoading(true);
    const response = await getTransc(params);
    if (response?.status) {
      setTranscList(response.data?.history || []);
      setWallteDatas(response.data?.wallets || []);
    } else {
      toast.error("Table Gagal dimuat bro");
    }
    setIsLoading(false);
  };
  useEffect(() => {
    fetchListTransac(dateRange);
  }, [reload]);

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

      <Card className=" p-4 flex flex-col md:flex-row gap-4 flex-wrap">
        <div className="w-full md:w-auto">
          <label className="text-xs font-medium mb-1 block">Start Date</label>
          <Input
            type="date"
            value={dateRange.startDate}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
            }
          />
        </div>
        <div className="w-full md:w-auto">
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
          className="w-full md:w-auto md:mt-auto"
          onClick={triggerReload}
        >
          <Search className="mr-2 h-4 w-4" /> Filter
        </Button>
      </Card>

      {isMobile ? (
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
                    <StatusPending transc={transc} onClick={setStatusTransc} />
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
                  <label className="text-sm font-medium mb-1 block">Type</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={type}
                    onChange={(e) => {
                      const newType = e.target.value as "INCOME" | "EXPENSE";
                      setType(newType);
                      setCategoryId("");
                      if (newType === "INCOME") setIsPending("N");
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
                <label className="text-sm font-medium mb-1 block">Status</label>
                <div className="flex gap-6">
                  {Status_Options.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-2 text-sm ${
                        type === "INCOME"
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
                        disabled={type === "INCOME"}
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
                <label className="text-sm font-medium mb-1 block">Wallet</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={walletsId}
                  onChange={(e) => setWalletsId(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select a wallet
                  </option>
                  {walletDatas.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
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
                  {categories.map((c: CatgList) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {categories.length === 0 && (
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
