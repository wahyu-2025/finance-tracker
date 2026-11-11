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

  static async getTransaction(req: Request, res: Response) {
    /* 
      #swagger.tags = ['Transaction']
      #swagger.summary = 'Get transaction history'
      #swagger.security = [{"bearerAuth": []}]
      #swagger.parameters['page'] = { in: 'query', type: 'integer', default: 1 }
      #swagger.parameters['limit'] = { in: 'query', type: 'integer', default: 10 }
      #swagger.parameters['type'] = { in: 'query', type: 'string', enum: ['INCOME', 'EXPENSE'] }
      #swagger.parameters['category_id'] = { in: 'query', type: 'integer' }
      #swagger.parameters['wallet_id'] = { in: 'query', type: 'integer' }
      #swagger.parameters['is_pending'] = { in: 'query', type: 'string', enum: ['Y', 'N'] }
      #swagger.parameters['startDate'] = { in: 'query', type: 'string', description: 'YYYY-MM-DD' }
      #swagger.parameters['endDate'] = { in: 'query', type: 'string', description: 'YYYY-MM-DD' }
    */
    try {
      const userId = req.auth?.id;

      if (!userId) {
        return ReturnHelper.errorResponse(res, 401, 401, "Unauthorized");
      }
      // 1. Ambil Query Params untuk Paging & Filter
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10)); // max 100 per page
      const skip = (page - 1) * limit;
      const { type, category_id, wallet_id, is_pending, startDate, endDate } =
        req.query;

      const transactionRepository = OrmHelper.DB.getRepository(Transaction);

      const query = transactionRepository
        .createQueryBuilder("transaction")
        .leftJoin("transaction.category", "category")
        .leftJoin("transaction.wallet", "wallet")
        .addSelect(["category.id", "category.name", "wallet.id", "wallet.name"])
        .where("transaction.user_id = :userId", { userId });

      if (type) {
        query.andWhere("transaction.type = :type", { type });
      }

      if (category_id) {
        query.andWhere("transaction.category_id = :category_id", {
          category_id,
        });
      }

      if (wallet_id) {
        query.andWhere("transaction.wallet_id = :wallet_id", { wallet_id });
      }

      if (is_pending) {
        query.andWhere("transaction.is_pending = :is_pending", { is_pending });
      }

      if (startDate) {
        query.andWhere("transaction.transaction_date >= :startDate", {
          startDate,
        });
      }

      if (endDate) {
        query.andWhere("transaction.transaction_date <= :endDate", { endDate });
      }

      // 4. Sorting & Pagination (getManyAndCount mengembalikan [data, totalCount])
      const [transactions, totalCount] = await query
        .orderBy("transaction.transaction_date", "DESC")
        .addOrderBy("transaction.id", "DESC")
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return ReturnHelper.successResponselist(
        res,
        200,
        "Transactions fetched successfully",
        transactions.length, // data yang didapat di halaman ini
        page, // halaman saat ini
        totalCount, // total semua data yang cocok
        transactions, // list array transaksi
      );
    } catch (err: unknown) {
      return ReturnHelper.errorResponse(res, 500, 500, (err as Error).message);
    }
  }
}
