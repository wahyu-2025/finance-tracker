import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CustomRecapService, CustomRecapData } from "@/api/custom-recap.service";
import {
  Toolbar,
  ToolbarHeading,
  ToolbarPageTitle,
  ToolbarDescription,
} from "@/components/layouts/layout-1/components/toolbar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice } from "@/lib/helpers";
import { Link, useNavigate } from "react-router-dom"; // Need router-dom for Navigation
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function ReportsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRecap, setNewRecap] = useState<CustomRecapData>({
    name: "",
    start_date: "",
    end_date: "",
  });

  const { data: recapsResponse, isLoading } = useQuery({
    queryKey: ["custom-recaps"],
    queryFn: () => CustomRecapService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CustomRecapData) => CustomRecapService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-recaps"] });
      setIsModalOpen(false);
      setNewRecap({ name: "", start_date: "", end_date: "" });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newRecap);
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
        <TabsContent value="realtime" className="p-4 text-center text-muted-foreground">
          Fitur Realtime belum tersedia.
        </TabsContent>
        <TabsContent value="bulanan" className="p-4 text-center text-muted-foreground">
          Fitur Bulanan belum tersedia.
        </TabsContent>
        <TabsContent value="custom" className="space-y-4 pt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Daftar Rekap Custom</h3>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Tambah Rekap</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Buat Rekap Custom Baru</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Nama Rekap</label>
                    <Input 
                      placeholder="e.g., Liburan Bali" 
                      value={newRecap.name}
                      onChange={(e) => setNewRecap({...newRecap, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Mulai Tanggal</label>
                      <Input 
                        type="date" 
                        value={newRecap.start_date}
                        onChange={(e) => setNewRecap({...newRecap, start_date: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Sampai Tanggal</label>
                      <Input 
                        type="date" 
                        value={newRecap.end_date}
                        onChange={(e) => setNewRecap({...newRecap, end_date: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Menyimpan..." : "Simpan"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
             <div className="flex justify-center p-8">Loading...</div>
          ) : recaps.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground bg-muted/20 rounded-lg">
              Belum ada rekap custom. Silakan buat baru.
            </div>
          ) : (
            <div className="grid gap-4">
              {recaps.map((recap: any) => (
                <Card 
                  key={recap.id} 
                  className="p-0 overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => navigate(`/reports/custom/${recap.id}`)}
                >
                  <div className="p-4 bg-muted/10 border-b flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-base">{recap.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {recap.start_date} - {recap.end_date}
                      </p>
                    </div>
                    <ChevronRight className="text-muted-foreground w-5 h-5" />
                  </div>
                  <div className="p-4 grid gap-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Pengeluaran</span>
                      <span className="font-medium text-red-500">{formatPrice(recap.total_expense)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Pemasukan</span>
                      <span className="font-medium text-emerald-500">+{formatPrice(recap.total_income)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t mt-1">
                      <span className="font-medium">Selisih</span>
                      <span className={`font-bold ${recap.balance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {recap.balance >= 0 ? '+' : ''}{formatPrice(recap.balance)}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
