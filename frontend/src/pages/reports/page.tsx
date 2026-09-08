import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CustomRecapService,
  // CustomRecapData,
  CustomRecapItem,
} from "@/api/custom-recap.service";
import {
  Toolbar,
  ToolbarHeading,
  ToolbarPageTitle,
  ToolbarDescription,
} from "@/components/layouts/layout-1/components/toolbar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice } from "@/lib/helpers";
import { useNavigate } from "react-router-dom"; // Need router-dom for Navigation
import { Button } from "@/components/ui/button";
import { CustomRecapFormModal } from "./custom-recap-form-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronRight, Plus, SquarePen, Trash2 } from "lucide-react";

export function ReportsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<CustomRecapItem | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: recapsResponse, isLoading } = useQuery({
    queryKey: ["custom-recaps"],
    queryFn: () => CustomRecapService.getAll(),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (id: number) => CustomRecapService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-recaps"] });
      setDeleteId(null);
    },
  });

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const confirmDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (deleteId !== null) {
      mutate(deleteId);
    }
  };

  const handleEdit = (e: React.MouseEvent, recap: CustomRecapItem) => {
    e.stopPropagation();
    setEditData(recap);
    setIsModalOpen(true);
  };

  const recaps = recapsResponse?.data || [];

  return (
    <div className="container space-y-6">
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle>Rekap</ToolbarPageTitle>
          <ToolbarDescription>
            Ringkasan transaksi keuangan Anda
          </ToolbarDescription>
        </ToolbarHeading>
      </Toolbar>

      <Tabs defaultValue="custom" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="realtime">Realtime</TabsTrigger>
          <TabsTrigger value="bulanan">Bulanan</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>
        <TabsContent
          value="realtime"
          className="p-4 text-center text-muted-foreground"
        >
          Fitur Realtime belum tersedia.
        </TabsContent>
        <TabsContent
          value="bulanan"
          className="p-4 text-center text-muted-foreground"
        >
          Fitur Bulanan belum tersedia.
        </TabsContent>
        <TabsContent value="custom" className="space-y-4 pt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Daftar Rekap Custom</h3>
            <Button
              size="sm"
              onClick={() => {
                setEditData(null);
                setIsModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" /> Tambah Rekap
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-8">Loading...</div>
          ) : recaps.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground bg-muted/20 rounded-lg">
              Belum ada rekap custom. Silakan buat baru.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recaps.map((recap: CustomRecapItem) => (
                <Card
                  key={recap.id}
                  className="p-0 overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => navigate(`/reports/custom/${recap.id}`)}
                >
                  <div className="p-4 bg-muted/10 border-b flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-base">{recap.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {recap.start_date} - {recap.end_date}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={(e) => handleEdit(e, recap)}
                      >
                        <SquarePen className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30"
                        onClick={(e) => handleDelete(e, recap.id)}
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500" />
                      </Button>
                      <ChevronRight className="text-muted-foreground w-5 h-5 ml-1" />
                    </div>
                  </div>
                  <div className="p-4 grid gap-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Pengeluaran</span>
                      <span className="font-medium text-red-500">
                        {formatPrice(recap.total_expense)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Pemasukan</span>
                      <span className="font-medium text-emerald-500">
                        +{formatPrice(recap.total_income)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t mt-1">
                      <span className="font-medium">Selisih</span>
                      <span
                        className={`font-bold ${recap.balance >= 0 ? "text-emerald-500" : "text-red-500"}`}
                      >
                        {recap.balance >= 0 ? "+" : ""}
                        {formatPrice(recap.balance)}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      <CustomRecapFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        editData={editData}
      />
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Rekap?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Rekap beserta riwayat
              kategori di dalamnya akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isPending}
              className="bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
            >
              {isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
