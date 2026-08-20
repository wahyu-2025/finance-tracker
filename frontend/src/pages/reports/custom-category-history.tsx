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
import { formatPrice } from "@/lib/helpers";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function CustomCategoryHistoryPage() {
  const { id, categoryName } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

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
  const history = data?.history || [];

  // Filter history by category name and search term
  const filteredHistory = history.filter((t: any) => {
    const isCategoryMatch = (t.category?.name || 'Lainnya') === categoryName;
    const isSearchMatch = t.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.category?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return isCategoryMatch && isSearchMatch;
  });

  // Group history by date
  const groupedHistory = filteredHistory.reduce((acc: any, curr: any) => {
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

  return (
    <div className="container space-y-6">
      <Toolbar className="flex justify-between items-center bg-primary text-primary-foreground p-4 -mx-4 sm:mx-0 sm:rounded-lg">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-primary-foreground hover:bg-primary-foreground/20">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <ToolbarHeading>
            <ToolbarPageTitle className="text-primary-foreground text-lg">Riwayat</ToolbarPageTitle>
          </ToolbarHeading>
        </div>
      </Toolbar>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Pencarian" 
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="pt-2 space-y-4">
          {Object.keys(groupedHistory).sort((a,b) => new Date(b).getTime() - new Date(a).getTime()).map(date => {
            const dayTransactions = groupedHistory[date];
            const dayTotal = dayTransactions.reduce((acc: number, t: any) => acc + (t.type === 'INCOME' ? Number(t.amount) : -Number(t.amount)), 0);
            
            // Format Day and Date like in Screenshot 4: "28 04 2026 Selasa"
            const d = new Date(date);
            const dayNum = d.getDate();
            const monthYear = d.toLocaleDateString('id-ID', { month: '2-digit', year: 'numeric' });
            const dayName = d.toLocaleDateString('id-ID', { weekday: 'long' });

            return (
              <div key={date} className="space-y-0 relative border-b last:border-0 pb-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-start gap-2">
                     <span className="text-3xl font-bold text-muted-foreground/50">{dayNum}</span>
                     <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground font-medium">{monthYear}</span>
                        <span className="text-xs bg-muted text-muted-foreground px-1 rounded inline-block w-fit mt-0.5">{dayName}</span>
                     </div>
                  </div>
                  <span className={`font-semibold ${dayTotal >= 0 ? 'text-emerald-500' : ''}`}>
                    {dayTotal > 0 ? '+' : ''}{formatPrice(dayTotal)}
                  </span>
                </div>
                
                <div className="divide-y pl-12">
                  {dayTransactions.map((t: any) => (
                    <div key={t.id} className="py-3 flex justify-between items-center cursor-pointer hover:bg-muted/30">
                      <div>
                        <div className="font-semibold text-sm">{t.category?.name || 'Lainnya'}</div>
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
                </div>
              </div>
            );
          })}
          {Object.keys(groupedHistory).length === 0 && (
            <div className="text-center p-8 text-muted-foreground">Tidak ada transaksi</div>
          )}
        </div>
    </div>
  );
}
