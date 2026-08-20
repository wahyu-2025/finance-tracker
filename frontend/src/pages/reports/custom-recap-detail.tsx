import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CustomRecapService } from "@/api/custom-recap.service";
import { TransactionService } from "@/api/transaction.service";
import {
  Toolbar,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/components/layouts/layout-1/components/toolbar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice } from "@/lib/helpers";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, ChevronRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const EXPENSE_COLORS = ["#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e"];
const INCOME_COLORS = ["#3b82f6", "#0ea5e9", "#06b6d4", "#14b8a6", "#10b981", "#34d399"];

export function CustomRecapDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: recapResponse, isLoading: isLoadingRecap } = useQuery({
    queryKey: ["custom-recap", id],
    queryFn: () => CustomRecapService.getOne(Number(id)),
    enabled: !!id,
  });

  const recap = recapResponse?.data;

  const { data: historyResponse, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["transactions", "history", recap?.start_date, recap?.end_date],
    queryFn: () => TransactionService.getHistory(recap!.start_date, recap!.end_date),
    enabled: !!recap,
  });

  const data = historyResponse?.data;
  const expenseByCategory = data?.expense_per_category || [];
  const incomeByCategory = data?.income_per_category || [];
  const history = data?.history || [];

  // Group history by date for Riwayat tab
  const groupedHistory = history.reduce((acc: any, curr: any) => {
    const date = curr.transaction_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(curr);
    return acc;
  }, {});

  if (isLoadingRecap || isLoadingHistory) {
    return <div className="flex justify-center p-12">Loading...</div>;
  }

  if (!recap) {
    return <div className="text-center p-12">Recap not found</div>;
  }

  const { total_income, total_expense, balance } = data?.balance_summary || { total_income: 0, total_expense: 0, balance: 0 };

  return (
    <div className="container space-y-6">
      <Toolbar className="flex justify-between items-center bg-primary text-primary-foreground p-4 -mx-4 sm:mx-0 sm:rounded-lg">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-primary-foreground hover:bg-primary-foreground/20">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <ToolbarHeading>
            <ToolbarPageTitle className="text-primary-foreground text-lg">Detail Rekap</ToolbarPageTitle>
          </ToolbarHeading>
        </div>
        <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/20">
          <Download className="w-5 h-5" />
        </Button>
      </Toolbar>

      <div className="text-center py-2">
        <h2 className="font-bold text-lg">{recap.name}</h2>
        <p className="text-sm text-muted-foreground">{recap.start_date} - {recap.end_date}</p>
      </div>

      <Tabs defaultValue="grafik" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-transparent border-b rounded-none p-0 h-auto">
          <TabsTrigger value="grafik" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-3">Grafik</TabsTrigger>
          <TabsTrigger value="kategori" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-3">Kategori</TabsTrigger>
          <TabsTrigger value="riwayat" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-3">Riwayat</TabsTrigger>
        </TabsList>

        <TabsContent value="grafik" className="pt-4 space-y-6">
          <Card className="p-4">
            <h3 className="text-center font-semibold mb-4 text-red-500">Pengeluaran</h3>
            <div className="h-[250px] w-full">
              {expenseByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={expenseByCategory} dataKey="total" nameKey="category" cx="50%" cy="50%" innerRadius={60} outerRadius={90}>
                      {expenseByCategory.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatPrice(value)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground text-sm">Tidak ada pengeluaran</div>
              )}
            </div>
            <div className="space-y-2 mt-4">
              {expenseByCategory.map((item: any, index: number) => (
                <div key={item.category} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-10 text-xs font-bold text-white text-center py-0.5 rounded" style={{ backgroundColor: EXPENSE_COLORS[index % EXPENSE_COLORS.length] }}>
                      {((item.total / total_expense) * 100).toFixed(0)}%
                    </span>
                    <span>{item.category}</span>
                  </div>
                  <span className="font-semibold">{formatPrice(item.total)}</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="kategori" className="pt-4 space-y-4">
          <Card className="p-4 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Pengeluaran</span>
              <span className="font-bold">{formatPrice(total_expense)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Pemasukan</span>
              <span className="font-bold text-emerald-500">+{formatPrice(total_income)}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-t pt-2">
              <span className="text-muted-foreground">Selisih</span>
              <span className={`font-bold ${balance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {balance >= 0 ? '+' : ''}{formatPrice(balance)}
              </span>
            </div>
          </Card>

          <div>
            <h4 className="font-semibold text-center mb-4 text-muted-foreground">Pengeluaran per Kategori</h4>
            <Card className="divide-y">
              {expenseByCategory.map((item: any) => (
                <div 
                  key={item.category} 
                  className="p-4 flex justify-between items-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigate(`/reports/custom/${recap.id}/category/${item.category}`)}
                >
                  <span className="text-sm">{item.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{formatPrice(item.total)}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
              {expenseByCategory.length === 0 && <div className="p-4 text-center text-sm text-muted-foreground">Tidak ada data</div>}
            </Card>
          </div>
          
          <div>
            <h4 className="font-semibold text-center mb-4 text-muted-foreground">Pemasukan per Kategori</h4>
            <Card className="divide-y">
              {incomeByCategory.map((item: any) => (
                <div 
                  key={item.category} 
                  className="p-4 flex justify-between items-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigate(`/reports/custom/${recap.id}/category/${item.category}`)}
                >
                  <span className="text-sm">{item.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-emerald-500">{formatPrice(item.total)}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
              {incomeByCategory.length === 0 && <div className="p-4 text-center text-sm text-muted-foreground">Tidak ada data</div>}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="riwayat" className="pt-4 space-y-4">
          {Object.keys(groupedHistory).sort((a,b) => new Date(b).getTime() - new Date(a).getTime()).map(date => {
            const dayTransactions = groupedHistory[date];
            const dayTotal = dayTransactions.reduce((acc: number, t: any) => acc + (t.type === 'INCOME' ? Number(t.amount) : -Number(t.amount)), 0);
            return (
              <div key={date} className="space-y-2">
                <div className="flex justify-between items-center px-2 py-1 bg-muted/50 rounded-md text-sm font-semibold">
                  <span>{new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  <span className={dayTotal >= 0 ? 'text-emerald-500' : ''}>{dayTotal > 0 ? '+' : ''}{formatPrice(dayTotal)}</span>
                </div>
                <Card className="divide-y">
                  {dayTransactions.map((t: any) => (
                    <div key={t.id} className="p-4 flex justify-between items-center">
                      <div>
                        <div className="font-medium text-sm">{t.category?.name || 'Lainnya'}</div>
                        <div className="text-xs text-muted-foreground">{t.description || t.category?.name}</div>
                      </div>
                      <div className="flex items-center gap-2">
                         <span className={`font-semibold ${t.type === 'INCOME' ? 'text-emerald-500' : ''}`}>
                          {t.type === 'INCOME' ? '+' : '-'}{formatPrice(t.amount)}
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </Card>
              </div>
            );
          })}
          {Object.keys(groupedHistory).length === 0 && (
            <div className="text-center p-8 text-muted-foreground">Tidak ada transaksi</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
