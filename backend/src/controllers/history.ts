import { Request, Response } from "express";
import { ReturnHelper } from "../helpers/express/return";
import { OrmHelper } from "../helpers/orm";
import { Transaction, Wallet } from "../entities";
import { CategoryType, IsPendingType } from "../types/types";

export class HistoryController {
  static async getHistory(req: Request, res: Response) {
    /* 
      #swagger.tags = ['History']
      #swagger.summary = 'Get history with summary'
      #swagger.security = [{"bearerAuth": []}]
      #swagger.parameters['startDate'] = { in: 'query', type: 'string', description: 'Start Date (YYYY-MM-DD)' }
      #swagger.parameters['endDate'] = { in: 'query', type: 'string', description: 'End Date (YYYY-MM-DD)' }
    */
    try {
      const userId = req.auth?.id;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return ReturnHelper.errorResponse(
          res,
          400,
          400,
          "startDate and endDate are required",
        );
      }

      const transactionRepository = OrmHelper.DB.getRepository(Transaction);
      const walletRepository = OrmHelper.DB.getRepository(Wallet);

      // Hitung total saldo dari semua wallet user saat ini
      const wallets = await walletRepository.find({
        where: { user_id: userId },
      });

      let total_balance_wallet = 0;
      wallets.forEach((w) => {
        total_balance_wallet += Number(w.balance);
      });

      // 1. Ambil detail history beserta relasi category & wallet
      const history = await transactionRepository
        .createQueryBuilder("transaction")
        .leftJoinAndSelect("transaction.category", "category")
        .leftJoinAndSelect("transaction.wallet", "wallet")
        .where("transaction.user_id = :userId", { userId })
        .andWhere("transaction.transaction_date >= :startDate", { startDate })
        .andWhere("transaction.transaction_date <= :endDate", { endDate })
        .orderBy("transaction.transaction_date", "DESC")
        .getMany();

      let total_income = 0;
      let total_expense = 0;
      let total_pending_income = 0;
      let total_pending_expense = 0;
      let total_pending_count = 0;

      const expense_per_category: Record<string, number> = {};
      const income_per_category: Record<string, number> = {};

      for (const t of history) {
        const amount = Number(t.amount);
        const categoryName = t.category?.name || "Unknown";

        if (t.is_pending === IsPendingType.Y) {
          total_pending_count++;
          if (t.type === CategoryType.INCOME) {
            total_pending_income += amount;
          } else {
            total_pending_expense += amount;
          }
        } else {
          // Settled transactions (is_pending === 'N')
          if (t.type === CategoryType.INCOME) {
            total_income += amount;
            income_per_category[categoryName] =
              (income_per_category[categoryName] || 0) + amount;
          } else {
            total_expense += amount;
            expense_per_category[categoryName] =
              (expense_per_category[categoryName] || 0) + amount;
          }
        }
      }

      const period_balance = total_income - total_expense;

      // Konversi object per category ke array format [{category: 'X', total: 100}]
      const mapToArray = (obj: Record<string, number>) => {
        return Object.keys(obj).map((key) => ({
          category: key,
          total: obj[key],
        }));
      };

      const responseData = {
        total_balance_wallet,
        net_cash_flow_summary: {
          total_income,
          total_expense,
          net_cash_flow: period_balance,
        },
        balance_summary: {
          total_income,
          total_expense,
          balance: period_balance,
        },
        pending_summary: {
          total_pending_income,
          total_pending_expense,
          net_pending: total_pending_income - total_pending_expense,
          total_pending_count,
        },
        expense_per_category: mapToArray(expense_per_category),
        income_per_category: mapToArray(income_per_category),
        wallets: wallets.map((w) => ({
          id: w.id,
          name: w.name,
          type: w.type,
          balance: Number(w.balance),
        })),
        history,
      };

      return ReturnHelper.successResponseAny(
        res,
        200,
        "History fetched successfully",
        responseData,
      );
    } catch (err: unknown) {
      return ReturnHelper.errorResponse(res, 500, 500, (err as Error).message);
    }
  }
}
