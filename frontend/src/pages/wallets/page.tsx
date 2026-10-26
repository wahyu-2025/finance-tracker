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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Wallets } from "@/types";
import { Edit2, Plus, Search, Trash2 } from "lucide-react";
import WalletsDialog from "./WalletDialog";
import { WalletService } from "@/api/wallet.services";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/lib/helpers";

const WalletsPage = () => {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallets | null>(null);
  const [actionType, setActionType] = useState<"add" | "edit">("add");

  const { data: walletsResponse, isLoading: isLoadingTx } = useQuery({
    queryKey: ["wallets", "getWallet"],
    queryFn: () => WalletService.getWallet(user?.id),
  });

  const walletsData = walletsResponse?.data || [];

  const handleShowModal = (type: "add" | "edit", wallet?: Wallets) => {
    setActionType(type);
    setSelectedWallet(wallet || null);
    setIsDialogOpen(true);
  };

  const handleCloseModal = () => {
    setIsDialogOpen(false);
    setSelectedWallet(null);
    setActionType("add");
  };
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
          {isLoadingTx ? (
            <div className="text-center p-8 text-muted-foreground bg-muted/20 rounded-lg">
              Loading...
            </div>
          ) : walletsData?.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground bg-muted/20 rounded-lg">
              No transactions found
            </div>
          ) : (
            walletsData.map((wallet) => (
              <Card key={wallet.id} className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{wallet.name || "-"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {/* {format(new Date(tx.transaction_date), "MMM dd, yyyy")} */}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded ${
                      wallet.type === "CASH"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                        : wallet.type === "BANK"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                    } text-secondary-foreground text-xs`}
                  >
                    {wallet.type || "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm">
                      Initial Balance: {formatPrice(wallet.initial_balance)}
                    </p>
                    <p className="text-sm">
                      Balance: {formatPrice(wallet.balance)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      //   onClick={() => openEditDialog(tx)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      //   onClick={() => handleDelete(tx.id!)}
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
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Initial Balance</TableHead>
                <TableHead>Balance</TableHead>
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
              ) : walletsData?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                walletsData?.map((wallet) => (
                  <TableRow
                    key={wallet.id}
                    onClick={() => setSelectedWallet(wallet)}
                    className={
                      selectedWallet?.id == wallet.id
                        ? "bg-primary/10 hover:bg-primary/10"
                        : ""
                    }
                  >
                    <TableCell>{wallet.name}</TableCell>
                    <TableCell className="font-medium">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${wallet.type === "CASH" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : wallet.type === "BANK" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"}`}
                      >
                        {wallet.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      {formatPrice(wallet.initial_balance || 0)}
                    </TableCell>
                    <TableCell>{formatPrice(wallet.balance || 0)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          //   onClick={() => openEditDialog(tx)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          //   onClick={() => handleDelete(tx.id!)}
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

      <WalletsDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        selectedWallet={selectedWallet}
        actionType={actionType}
      />
    </div>
  );
};

export default WalletsPage;
