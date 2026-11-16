import { useEffect, useState } from "react";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Toolbar,
  ToolbarHeading,
  ToolbarPageTitle,
  ToolbarDescription,
  ToolbarActions,
} from "@/components/layouts/layout-1/components/toolbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "./component/deleteDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/lib/helpers";
import { WalletList } from "@/types";
import WalletsDialog from "./WalletDialog";
import { useWalletsApi } from "./api/useWalletsApi";

const getTypeBadge = (type: string) =>
  type === "CASH"
    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
    : type === "BANK"
      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";

const WalletsPage = () => {
  const { getWalletList, deleteWallet } = useWalletsApi();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [dataWallets, setDataWallets] = useState<WalletList[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletList | null>(null);
  const [actionType, setActionType] = useState<"add" | "edit">("add");

  // State popup konfirmasi hapus
  const [deleteTarget, setDeleteTarget] = useState<WalletList | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchWalletList = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const response = await getWalletList(user.id);
      if (response?.status) {
        setDataWallets(response.data);
      } else {
        toast.error(response.message || "Table failed to load");
      }
    } catch {
      toast.error("Error Get Type Data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleShowModal = (type: "add" | "edit", wallet?: WalletList) => {
    setActionType(type);
    setSelectedWallet(wallet || null);
    setIsDialogOpen(true);
  };

  // Dipanggil saat tombol "Hapus" di popup konfirmasi diklik
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const response = await deleteWallet(deleteTarget.id);
      if (response?.status) {
        toast.success(response.message || "Wallet deleted successfully");
        setDeleteTarget(null);
        fetchWalletList();
      } else {
        toast.error(response?.message || "Failed to delete wallet");
      }
    } catch {
      toast.error("There is an error");
    } finally {
      setIsDeleting(false);
    }
  };

  const ActionButtons = ({ wallet }: { wallet: WalletList }) => (
    <div className="flex gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => handleShowModal("edit", wallet)}
      >
        <Edit2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setDeleteTarget(wallet)}
      >
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  );

  return (
    <div className="container space-y-6">
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle>Wallets</ToolbarPageTitle>
          <ToolbarDescription>View and manage your wallets</ToolbarDescription>
        </ToolbarHeading>
        <ToolbarActions>
          <Button onClick={() => handleShowModal("add")}>
            <Plus className="mr-2 h-4 w-4" /> Add Wallet
          </Button>
        </ToolbarActions>
      </Toolbar>

      {isMobile ? (
        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            <div className="text-center p-8 text-muted-foreground bg-muted/20 rounded-lg">
              Loading...
            </div>
          ) : dataWallets.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground bg-muted/20 rounded-lg">
              No wallets found
            </div>
          ) : (
            dataWallets.map((wallet) => (
              <Card key={wallet.id} className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start gap-3">
                  <p className="font-medium truncate">{wallet.name || "-"}</p>
                  <span
                    className={`shrink-0 px-2 py-1 rounded-full text-xs font-semibold ${getTypeBadge(wallet.type)}`}
                  >
                    {wallet.type || "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between items-end gap-3">
                  <div className="flex flex-col gap-1 text-sm">
                    <p className="text-muted-foreground">
                      Initial:{" "}
                      {formatPrice(Number(wallet.initial_balance ?? 0))}
                    </p>
                    <p className="font-semibold">
                      Balance: {formatPrice(Number(wallet.balance ?? 0))}
                    </p>
                  </div>
                  <ActionButtons wallet={wallet} />
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
                <TableHead>Bank Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Initial Balance</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead className="w-25">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : dataWallets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No wallets found
                  </TableCell>
                </TableRow>
              ) : (
                dataWallets.map((wallet) => (
                  <TableRow key={wallet.id}>
                    <TableCell className="font-medium">{wallet.name}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeBadge(wallet.type)}`}
                      >
                        {wallet.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      {formatPrice(Number(wallet.initial_balance ?? 0))}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatPrice(Number(wallet.balance ?? 0))}
                    </TableCell>
                    <TableCell>
                      <ActionButtons wallet={wallet} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      <WalletsDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        selectedWallet={selectedWallet}
        actionType={actionType}
        onSuccess={fetchWalletList}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete wallet?"
        description={
          <>
            Wallet <b>{deleteTarget?.name}</b> will be deleted and cannot be
            recovered.
          </>
        }
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default WalletsPage;
