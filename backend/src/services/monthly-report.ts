import { OrmHelper } from "../helpers/orm";
import { MonthlyReport } from "../entities/MonthlyReport";
import { Transaction } from "../entities/Transaction";
import { User } from "../entities/User";
import { Logger, ILogObj } from "tslog";
import { CategoryType, IsPendingType } from "../types/types";

const log: Logger<ILogObj> = new Logger({ name: "[MonthlyReportService]", type: "pretty" });

export const MONTH_NAMES_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export class MonthlyReportService {
  /**
   * Helper format date to YYYY-MM-DD
   */
  private static formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  /**
   * Recalculate and synchronize a specific month for a user.
   * Can accept either a Date object, date string (YYYY-MM-DD), or explicit year and month (1-12).
   */
  static async syncMonth(
    userId: number,
    dateOrYear: Date | string | number,
    monthNum?: number
  ): Promise<MonthlyReport | null> {
    try {
      if (!OrmHelper.DB || !OrmHelper.DB.isInitialized) {
        return null;
      }

      let year: number;
      let month: number; // 1 - 12

      if (typeof dateOrYear === "number" && typeof monthNum === "number") {
        year = dateOrYear;
        month = monthNum;
      } else {
        const d = new Date(dateOrYear as string | Date);
        year = d.getFullYear();
        month = d.getMonth() + 1;
      }

      // Hitung start_date (tanggal 1) dan end_date (tanggal terakhir bulan)
      const startDate = this.formatDate(new Date(year, month - 1, 1));
      const endDate = this.formatDate(new Date(year, month, 0));
      const monthName = `${MONTH_NAMES_ID[month - 1]} ${year}`;

      const transactionRepository = OrmHelper.DB.getRepository(Transaction);
      const monthlyReportRepository = OrmHelper.DB.getRepository(MonthlyReport);

      // Hitung agregasi transaksi di bulan tersebut
      const transactions = await transactionRepository
        .createQueryBuilder("t")
        .where("t.user_id = :userId", { userId })
        .andWhere("t.is_pending = :isPending", { isPending: IsPendingType.N })
        .andWhere("t.transaction_date >= :startDate", { startDate })
        .andWhere("t.transaction_date <= :endDate", { endDate })
        .getMany();

      let totalIncome = 0;
      let totalExpense = 0;

      for (const t of transactions) {
        if (t.type === CategoryType.INCOME) {
          totalIncome += Number(t.amount);
        } else if (t.type === CategoryType.EXPENSE) {
          totalExpense += Number(t.amount);
        }
      }

      const netSavings = totalIncome - totalExpense;
      const totalTransactions = transactions.length;

      // Cari atau buat entitas MonthlyReport
      let report = await monthlyReportRepository.findOne({
        where: {
          user_id: userId,
          year: year,
          month: month,
        },
      });

      if (!report) {
        report = monthlyReportRepository.create({
          user_id: userId,
          year: year,
          month: month,
          month_name: monthName,
          start_date: startDate,
          end_date: endDate,
          total_income: totalIncome,
          total_expense: totalExpense,
          net_savings: netSavings,
          total_transactions: totalTransactions,
        });
      } else {
        report.total_income = totalIncome;
        report.total_expense = totalExpense;
        report.net_savings = netSavings;
        report.total_transactions = totalTransactions;
        report.month_name = monthName;
        report.start_date = startDate;
        report.end_date = endDate;
      }

      const saved = await monthlyReportRepository.save(report);
      return saved;
    } catch (error) {
      log.error(`Error syncing monthly report for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Generates or syncs all monthly reports from January up to current month (e.g. Jan - Oct)
   * for a specific user, or for ALL users if userId is omitted.
   */
  static async generateYearToDate(userId?: number) {
    try {
      if (!OrmHelper.DB || !OrmHelper.DB.isInitialized) {
        return;
      }

      const userRepository = OrmHelper.DB.getRepository(User);
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1; // 1 to 12

      let users: User[] = [];
      if (userId) {
        const u = await userRepository.findOne({ where: { id: userId } });
        if (u) users = [u];
      } else {
        users = await userRepository.find();
      }

      log.info(`Generating YTD Monthly Reports for ${users.length} user(s) (Jan - ${MONTH_NAMES_ID[currentMonth - 1]} ${currentYear})...`);

      for (const user of users) {
        for (let m = 1; m <= currentMonth; m++) {
          await this.syncMonth(user.id, currentYear, m);
        }
      }

      log.info("Finished generating YTD Monthly Reports.");
    } catch (error) {
      log.error("Error in generateYearToDate:", error);
    }
  }
}
