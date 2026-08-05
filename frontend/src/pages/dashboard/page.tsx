import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TransactionService } from "@/api/transaction.service";
import {
  Toolbar,
  ToolbarHeading,
  ToolbarPageTitle,
  ToolbarDescription,
} from "@/components/layouts/layout-1/components/toolbar";
import { Card } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import { format, subDays } from "date-fns";
import { ArrowDownRight, ArrowUpRight, DollarSign } from "lucide-react";
import { formatPrice } from "@/lib/helpers";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#ffc658",
];

export function DashboardPage() {
  const [dateRange] = useState({
    startDate: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
  });

  const { data: historyResponse, isLoading } = useQuery({
    queryKey: ["transactions", "history", dateRange],
    queryFn: () =>
      TransactionService.getHistory(dateRange.startDate, dateRange.endDate),
  });

  const data = historyResponse?.data;

  const balanceSummary = data?.balance_summary || {
    total_income: 0,
    total_expense: 0,
    balance: 0,
  };
  const expenseByCategory = data?.expense_per_category || [];
  const recentTransactions = data?.history?.slice(0, 5) || [];

  return (
    <div className="container space-y-6">
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle>Dashboard</ToolbarPageTitle>
          <ToolbarDescription>
            Your financial overview for the last 30 days
          </ToolbarDescription>
        </ToolbarHeading>
      </Toolbar>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">Loading...</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="glassmorphism p-6 flex flex-col gap-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Total Balance
                </span>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-3xl font-bold tracking-tight">
                {formatPrice(balanceSummary.balance)}
              </span>
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <DollarSign className="h-24 w-24" />
              </div>
            </Card>

            <Card className="glassmorphism p-6 flex flex-col gap-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Total Income
                </span>
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              </div>
              <span className="text-3xl font-bold tracking-tight text-green-500">
                +{formatPrice(balanceSummary.total_income)}
              </span>
            </Card>

            <Card className="glassmorphism p-6 flex flex-col gap-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Total Expenses
                </span>
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              </div>
              <span className="text-3xl font-bold tracking-tight text-red-500">
                -{formatPrice(balanceSummary.total_expense)}
              </span>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="glassmorphism p-6 flex flex-col gap-4">
              <h3 className="text-lg font-semibold">Expenses by Category</h3>
              <div className="h-[300px] w-full">
                {expenseByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseByCategory}
                        dataKey="total"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                      >
                        {expenseByCategory.map((_: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(value: number) => formatPrice(value)}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No expense data available
                  </div>
                )}
              </div>
            </Card>

            <Card className="glassmorphism p-0 overflow-hidden flex flex-col">
              <div className="p-6 pb-2">
                <h3 className="text-lg font-semibold">Recent Transactions</h3>
              </div>
              <div className="flex-1 overflow-auto">
                {recentTransactions.length > 0 ? (
                  <div className="divide-y divide-border">
                    {recentTransactions.map((tx: any) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">
                            {tx.description || tx.category?.name || "Unknown"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(
                              new Date(tx.transaction_date),
                              "MMM dd, yyyy",
                            )}
                          </span>
                        </div>
                        <span
                          className={`font-semibold ${tx.type === "INCOME" ? "text-green-500" : "text-red-500"}`}
                        >
                          {tx.type === "INCOME" ? "+" : "-"}
                          {formatPrice(Number(tx.amount))}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center text-muted-foreground p-6">
                    No recent transactions
                  </div>
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
