import { format } from "date-fns";
import { formatPrice } from "@/lib/helpers";
import { BudgetResponse } from "../types/budgetsTypes";

export const formatDate = (date: string) =>
  format(new Date(`${date}T00:00:00`), "MMM dd, yyyy");

export const getStatus = (start: string, end: string) => {
  const today = format(new Date(), "yyyy-MM-dd");
  if (today < start)
    return {
      label: "Upcoming",
      className:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    };
  if (today > end)
    return {
      label: "Ended",
      className: "bg-secondary text-secondary-foreground",
    };
  return {
    label: "Active",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  };
};

export const getBudgetSummary = (budget: BudgetResponse) => {
  const totalAmount = Number(budget.total_amount ?? 0);
  const usage = Number(budget.total_usage ?? 0);
  const remaining = Number(budget.total_remaining ?? totalAmount - usage);
  const percentage = Math.round(
    Number(
      budget.usage_percentage ??
        (totalAmount > 0 ? (usage / totalAmount) * 100 : 0),
    ),
  );
  return { totalAmount, usage, remaining, percentage };
};

export const getUsageColor = (percentage: number) =>
  percentage >= 100
    ? { bar: "bg-red-500", text: "text-red-500" }
    : percentage >= 75
      ? { bar: "bg-amber-400", text: "text-amber-600 dark:text-amber-400" }
      : { bar: "bg-emerald-500", text: "text-green-600 dark:text-green-400" };

export const UsageBar = ({
  percentage,
  className = "h-2",
}: {
  percentage: number;
  className?: string;
}) => (
  <div
    className={`w-full overflow-hidden rounded-full bg-secondary ${className}`}
  >
    <div
      className={`h-full rounded-full transition-[width] duration-500 ${getUsageColor(percentage).bar}`}
      style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
    />
  </div>
);

export const StatBox = ({
  label,
  value,
  valueClassName = "",
  size = "md",
}: {
  label: string;
  value: number | string;
  valueClassName?: string;
  size?: "md" | "lg";
}) => (
  <div className="min-w-0 rounded-lg bg-secondary/60 p-3">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p
      className={`mt-1 truncate font-semibold ${
        size === "lg" ? "text-lg sm:text-xl" : "text-sm sm:text-base"
      } ${valueClassName}`}
      title={typeof value === "number" ? formatPrice(value) : value}
    >
      {typeof value === "number" ? formatPrice(value) : value}
    </p>
  </div>
);
