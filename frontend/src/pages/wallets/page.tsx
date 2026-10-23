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
import { Input } from "@/components/ui/input";
import { Edit2, Search, Trash2 } from "lucide-react";
import WalletsDialog from "./WalletDialog";
import { WalletService } from "@/api/wallet.services";
import { useAuth } from "@/contexts/AuthContext";

const WalletsPage = () => {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallets | null>(null);
  const [actionType, setActionType] = useState<"add" | "edit">("add");

  const { data: walletsResponse, isLoading: isLoadingTx } = useQuery({
    queryKey: ["wallets", "get"],
    queryFn: () => WalletService.getWallet(user?.id),
  });

  const walletsData = walletsResponse?.data || [];
  return (
    <div className="container space-y-6">
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle>Wallets</ToolbarPageTitle>
          <ToolbarDescription>View and manage your wallets</ToolbarDescription>
        </ToolbarHeading>
        <ToolbarActions>
          {/* <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add Transaction
          </Button> */}
        </ToolbarActions>
      </Toolbar>

      <Card className=" p-4 flex flex-col md:flex-row gap-4 flex-wrap">
        <div className="w-full md:w-auto">
          <label className="text-xs font-medium mb-1 block">Start Date</label>
          <Input
          // type="date"
          // // value={dateRange.startDate}
          // onChange={(e) =>
          //   setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
          // }
          />
        </div>
        <div className="w-full md:w-auto">
          <label className="text-xs font-medium mb-1 block">End Date</label>
          <Input
          // type="date"
          // value={dateRange.endDate}
          // onChange={(e) =>
          //   setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
          // }
          />
        </div>
        <Button
          variant="outline"
          className="w-full md:w-auto md:mt-auto"
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["transactions"] })
          }
        >
          <Search className="mr-2 h-4 w-4" /> Filter
        </Button>
      </Card>

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
            walletsData.map((wallets) => (
              <Card key={wallets.id} className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{wallets.name || "-"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {/* {format(new Date(tx.transaction_date), "MMM dd, yyyy")} */}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="px-2 py-1 rounded bg-secondary text-secondary-foreground text-xs">
                    {wallets.type || "Unknown"}
                  </span>
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
              ) : walletsData?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                walletsData?.map((wallets) => (
                  <TableRow key={wallets.id}>
                    <TableCell>
                      {/* {format(new Date(tx.transaction_date), "MMM dd, yyyy")} */}
                    </TableCell>
                    <TableCell className="font-medium">
                      {wallets.name || "-"}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded bg-secondary text-secondary-foreground text-xs">
                        {wallets.type || "Unknown"}
                      </span>
                    </TableCell>
                    <TableCell></TableCell>
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
