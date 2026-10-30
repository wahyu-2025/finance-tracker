import { Request, Response } from "express";
import { OrmHelper } from "../helpers/orm";
import { Transaction } from "../entities/Transaction";
import { Category } from "../entities/Category";
import { ReturnHelper } from "../helpers/express/return";
import Joi from "joi";
import { Wallet } from "../entities";
import { CategoryType, IsPendingType } from "../types/types";
import { MonthlyReportService } from "../services/monthly-report";
import { WalletHelper } from "../helpers/wallet";

export class TransactionController {
  static async create(req: Request, res: Response) {
    /* 
      #swagger.tags = ['Transaction']
      #swagger.summary = 'Create a new transaction'
      #swagger.security = [{"bearerAuth": []}]
      #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateTransactionRequest" }
          }
        }
      }
    */
    try {
      const schema = Joi.object({
        category_id: Joi.number().required(),
        type: Joi.string()
          .valid(CategoryType.INCOME, CategoryType.EXPENSE)
          .required(),
        amount: Joi.number().positive().required(),
        transaction_date: Joi.date().iso().required(),
        is_pending: Joi.string()
          .valid(IsPendingType.Y, IsPendingType.N)
          .default(IsPendingType.N),
        wallet_id: Joi.number().required(),
        description: Joi.string().allow("", null).optional(),
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return ReturnHelper.errorResponse(res, 400, 400, error.message);
      }

      const userId = req.auth?.id;
      const amount = Number(value.amount);

      return await OrmHelper.DB.transaction(async (manager) => {
        const categoryRepository = manager.getRepository(Category);
        const transactionRepository = manager.getRepository(Transaction);

        // 1. Validasi Kategori
        const category = await categoryRepository.findOne({
          where: { id: value.category_id },
        });
        if (
          !category ||
          (category.user_id !== null && category.user_id !== userId)
        ) {
          return ReturnHelper.errorResponse(res, 400, 400, "Invalid category");
        }

        const isSettled = value.is_pending === IsPendingType.N;

        // 2. Update Saldo Wallet jika bukan pending
        if (isSettled) {
          const balanceRes = await WalletHelper.adjustBalance({
            manager,
            walletId: value.wallet_id,
            userId,
            type: value.type,
            amount,
            action: "APPLY",
          });

          if (balanceRes.error) {
            return ReturnHelper.errorResponse(res, 400, 400, balanceRes.error);
          }
        } else {
          // Jika pending, cukup pastikan wallet valid dan milik user
          const walletRepository = manager.getRepository(Wallet);
          const wallet = await walletRepository.findOne({
            where: { id: value.wallet_id },
          });
          if (!wallet || wallet.user_id !== userId) {
            return ReturnHelper.errorResponse(res, 400, 400, "Invalid wallet");
          }
        }

        // 3. Simpan Transaksi
        const newTransaction = transactionRepository.create({
          user_id: userId,
          category_id: value.category_id,
          type: value.type,
          amount: amount,
          is_pending: value.is_pending,
          wallet_id: value.wallet_id,
          transaction_date: value.transaction_date,
          description: value.description,
        });

        const savedTransaction =
          await transactionRepository.save(newTransaction);

        // Sync monthly report secara asynchronous jika settled
        if (isSettled) {
          MonthlyReportService.syncMonth(
            userId,
            savedTransaction.transaction_date,
          ).catch(() => {});
        }

        return ReturnHelper.successResponseAny(
          res,
          201,
          "Transaction created successfully",
          savedTransaction,
        );
      });
    } catch (err: unknown) {
      return ReturnHelper.errorResponse(res, 500, 500, (err as Error).message);
    }
  }

  static async update(req: Request, res: Response) {
    /* 
      #swagger.tags = ['Transaction']
      #swagger.summary = 'Update transaction'
      #swagger.security = [{"bearerAuth": []}]
      #swagger.parameters['id'] = { description: 'Transaction ID', type: 'integer' }
      #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateTransactionRequest" }
          }
        }
      }
    */
    try {
      const schema = Joi.object({
        category_id: Joi.number().required(),
        wallet_id: Joi.number().optional(),
        type: Joi.string()
          .valid(CategoryType.INCOME, CategoryType.EXPENSE)
          .required(),
        amount: Joi.number().positive().required(),
        transaction_date: Joi.date().iso().required(),
        description: Joi.string().allow("", null).optional(),
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return ReturnHelper.errorResponse(res, 400, 400, error.message);
      }

      const transactionIdParam = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const transactionId = Number.parseInt(transactionIdParam, 10);
      const userId = req.auth?.id;

      if (Number.isNaN(transactionId)) {
        return ReturnHelper.errorResponse(
          res,
          400,
          400,
          "Invalid transaction id",
        );
      }

      return await OrmHelper.DB.transaction(async (manager) => {
        const transactionRepository = manager.getRepository(Transaction);
        const categoryRepository = manager.getRepository(Category);

        const transaction = await transactionRepository.findOne({
          where: { id: transactionId },
        });

        if (!transaction || transaction.user_id !== userId) {
          return ReturnHelper.errorResponse(
            res,
            404,
            404,
            "Transaction not found",
          );
        }

        const oldTransactionDate = transaction.transaction_date;

        // 1. Validasi Kategori
        const category = await categoryRepository.findOne({
          where: { id: value.category_id },
        });
        if (
          !category ||
          (category.user_id !== null && category.user_id !== userId)
        ) {
          return ReturnHelper.errorResponse(res, 400, 400, "Invalid category");
        }

        const targetWalletId = value.wallet_id || transaction.wallet_id;
        const isSettled = transaction.is_pending === IsPendingType.N;
        const newAmount = Number(value.amount);

        if (isSettled) {
          // Revert saldo transaksi lama
          const revertRes = await WalletHelper.adjustBalance({
            manager,
            walletId: transaction.wallet_id,
            userId,
            type: transaction.type,
            amount: transaction.amount,
            action: "REVERT",
          });
          if (revertRes.error) {
            return ReturnHelper.errorResponse(res, 400, 400, revertRes.error);
          }

          // Apply saldo transaksi baru ke target wallet
          const applyRes = await WalletHelper.adjustBalance({
            manager,
            walletId: targetWalletId,
            userId,
            type: value.type,
            amount: newAmount,
            action: "APPLY",
          });
          if (applyRes.error) {
            return ReturnHelper.errorResponse(res, 400, 400, applyRes.error);
          }
        } else {
          // Transaksi pending: jika ganti wallet, pastikan wallet valid dan milik user
          if (targetWalletId !== transaction.wallet_id) {
            const walletRepository = manager.getRepository(Wallet);
            const targetWallet = await walletRepository.findOne({
              where: { id: targetWalletId },
            });
            if (!targetWallet || targetWallet.user_id !== userId) {
              return ReturnHelper.errorResponse(
                res,
                400,
                400,
                "Invalid new wallet",
              );
            }
          }
        }

        // 2. Update Data Transaksi
        transaction.category_id = value.category_id;
        transaction.wallet_id = targetWalletId;
        transaction.type = value.type;
        transaction.amount = newAmount;
        transaction.transaction_date = value.transaction_date;
        transaction.description = value.description;

        const updatedTransaction =
          await transactionRepository.save(transaction);

        // Sync monthly report secara asynchronous jika transaksi settled
        if (isSettled) {
          MonthlyReportService.syncMonth(
            userId,
            updatedTransaction.transaction_date,
          ).catch(() => {});
          if (
            oldTransactionDate &&
            String(oldTransactionDate) !==
              String(updatedTransaction.transaction_date)
          ) {
            MonthlyReportService.syncMonth(userId, oldTransactionDate).catch(
              () => {},
            );
          }
        }

        return ReturnHelper.successResponseAny(
          res,
          200,
          "Transaction updated successfully",
          updatedTransaction,
        );
      });
    } catch (err: unknown) {
      return ReturnHelper.errorResponse(res, 500, 500, (err as Error).message);
    }
  }

  static async confirm(req: Request, res: Response) {
    /* 
      #swagger.tags = ['Transaction']
      #swagger.summary = 'Confirm a pending transaction'
      #swagger.security = [{"bearerAuth": []}]
      #swagger.parameters['id'] = { description: 'Transaction ID', type: 'integer' }
    */
    try {
      const transactionIdParam = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const transactionId = Number.parseInt(transactionIdParam, 10);
      const userId = req.auth?.id;

      if (Number.isNaN(transactionId)) {
        return ReturnHelper.errorResponse(
          res,
          400,
          400,
          "Invalid transaction id",
        );
      }

      return await OrmHelper.DB.transaction(async (manager) => {
        const transactionRepository = manager.getRepository(Transaction);

        const transaction = await transactionRepository.findOne({
          where: { id: transactionId },
        });

        if (!transaction || transaction.user_id !== userId) {
          return ReturnHelper.errorResponse(
            res,
            404,
            404,
            "Transaction not found",
          );
        }

        if (transaction.is_pending !== IsPendingType.Y) {
          return ReturnHelper.errorResponse(
            res,
            400,
            400,
            "Transaction is already confirmed",
          );
        }

        // Apply saldo ke wallet
        const balanceRes = await WalletHelper.adjustBalance({
          manager,
          walletId: transaction.wallet_id,
          userId,
          type: transaction.type,
          amount: transaction.amount,
          action: "APPLY",
        });

        if (balanceRes.error) {
          return ReturnHelper.errorResponse(res, 400, 400, balanceRes.error);
        }

        // Update status pending menjadi settled
        transaction.is_pending = IsPendingType.N;
        const updatedTransaction =
          await transactionRepository.save(transaction);

        // Sync monthly report
        MonthlyReportService.syncMonth(
          userId,
          updatedTransaction.transaction_date,
        ).catch(() => {});

        return ReturnHelper.successResponseAny(
          res,
          200,
          "Transaction confirmed successfully",
          updatedTransaction,
        );
      });
    } catch (err: unknown) {
      return ReturnHelper.errorResponse(res, 500, 500, (err as Error).message);
    }
  }

  static async delete(req: Request, res: Response) {
    /* 
      #swagger.tags = ['Transaction']
      #swagger.summary = 'Delete transaction'
      #swagger.security = [{"bearerAuth": []}]
      #swagger.parameters['id'] = { description: 'Transaction ID', type: 'integer' }
    */
    try {
      const transactionIdParam = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const transactionId = Number.parseInt(transactionIdParam, 10);
      const userId = req.auth?.id;

      if (Number.isNaN(transactionId)) {
        return ReturnHelper.errorResponse(
          res,
          400,
          400,
          "Invalid transaction id",
        );
      }

      return await OrmHelper.DB.transaction(async (manager) => {
        const transactionRepository = manager.getRepository(Transaction);

        const transaction = await transactionRepository.findOne({
          where: { id: transactionId },
        });

        if (!transaction || transaction.user_id !== userId) {
          return ReturnHelper.errorResponse(
            res,
            404,
            404,
            "Transaction not found",
          );
        }

        const isSettled = transaction.is_pending === IsPendingType.N;

        if (isSettled) {
          // Revert saldo transaksi
          const revertRes = await WalletHelper.adjustBalance({
            manager,
            walletId: transaction.wallet_id,
            userId,
            type: transaction.type,
            amount: transaction.amount,
            action: "REVERT",
          });

          if (revertRes.error) {
            return ReturnHelper.errorResponse(res, 400, 400, revertRes.error);
          }
        }

        const deletedDate = transaction.transaction_date;
        await transactionRepository.softRemove(transaction);

        // Sync monthly report secara asynchronous jika settled
        if (isSettled) {
          MonthlyReportService.syncMonth(userId, deletedDate).catch(() => {});
        }

        return ReturnHelper.successResponseAny(
          res,
          200,
          "Transaction deleted successfully",
          null,
        );
      });
    } catch (err: unknown) {
      return ReturnHelper.errorResponse(res, 500, 500, (err as Error).message);
    }
  }

  static async getHistory(req: Request, res: Response) {
    /* 
      #swagger.tags = ['Transaction']
      #swagger.summary = 'Get transaction history with summary'
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
