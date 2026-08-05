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
  Tooltip,
  Legend,
} from "recharts";
import { format, subDays } from "date-fns";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/helpers";

const EXPENSE_COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
];
const INCOME_COLORS = [
  "#3b82f6",
  "#0ea5e9",
  "#06b6d4",
  "#14b8a6",
  "#10b981",
  "#34d399",
];

export function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 90), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
  });

  const { data: historyResponse, isLoading } = useQuery({
    queryKey: ["transactions", "history", dateRange],
    queryFn: () =>
      TransactionService.getHistory(dateRange.startDate, dateRange.endDate),
  });

  const data = historyResponse?.data;
  const expenseByCategory = data?.expense_per_category || [];
  const incomeByCategory = data?.income_per_category || [];

  return (
    <div className="container space-y-6">
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle>Reports</ToolbarPageTitle>
          <ToolbarDescription>
            Detailed analysis of your income and expenses
          </ToolbarDescription>
        </ToolbarHeading>
      </Toolbar>

      <Card className="glassmorphism p-4 flex gap-4 items-end flex-wrap">
        <div>
          <label className="text-xs font-medium mb-1 block">Start Date</label>
          <Input
            type="date"
            value={dateRange.startDate}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block">End Date</label>
          <Input
            type="date"
            value={dateRange.endDate}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
            }
          />
        </div>
      </Card>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">Loading...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="glassmorphism p-6 flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-red-500">
              Expenses Breakdown
            </h3>
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
                      outerRadius={100}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {expenseByCategory.map((_: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatPrice(value)}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No expense data available for this period
                </div>
              )}
            </div>
          </Card>

          <Card className="glassmorphism p-6 flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-blue-500">
              Income Breakdown
            </h3>
            <div className="h-[300px] w-full">
              {incomeByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incomeByCategory}
                      dataKey="total"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {incomeByCategory.map((_: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={INCOME_COLORS[index % INCOME_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatPrice(value)}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No income data available for this period
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
