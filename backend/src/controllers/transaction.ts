import { Request, Response } from 'express';
import { OrmHelper } from '../helpers/orm';
import { Transaction } from '../entities/Transaction';
import { Category, CategoryType } from '../entities/Category';
import { ReturnHelper } from '../helpers/express/return';
import Joi from 'joi';

export class TransactionController {

  static async create(req: Request, res: Response) {
    /* 
      #swagger.tags = ['Transaction']
      #swagger.summary = 'Create a new transaction'
      #swagger.security = [{"bearerAuth": []}]
    */
    try {
      const schema = Joi.object({
        category_id: Joi.number().required(),
        type: Joi.string().valid(CategoryType.INCOME, CategoryType.EXPENSE).required(),
        amount: Joi.number().min(0).required(),
        transaction_date: Joi.date().iso().required(),
        description: Joi.string().allow('', null).optional()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return ReturnHelper.errorResponse(res, 400, 400, error.message);
      }

      const categoryRepository = OrmHelper.DB.getRepository(Category);
      const transactionRepository = OrmHelper.DB.getRepository(Transaction);
      const userId = req.auth?.id;

      // Cek apakah kategori ada dan valid untuk user ini
      const category = await categoryRepository.findOne({ where: { id: value.category_id } });
      if (!category || (category.user_id !== null && category.user_id !== userId)) {
        return ReturnHelper.errorResponse(res, 400, 400, "Invalid category");
      }

      const newTransaction = transactionRepository.create({
        user_id: userId,
        category_id: value.category_id,
        type: value.type,
        amount: value.amount,
        transaction_date: value.transaction_date,
        description: value.description
      });

      const savedTransaction = await transactionRepository.save(newTransaction);
      return ReturnHelper.successResponseAny(res, 201, "Transaction created successfully", savedTransaction);
    } catch (err: any) {
      return ReturnHelper.errorResponse(res, 500, 500, err.message);
    }
  }

  static async update(req: Request, res: Response) {
    /* 
      #swagger.tags = ['Transaction']
      #swagger.summary = 'Update transaction'
      #swagger.security = [{"bearerAuth": []}]
    */
    try {
      const schema = Joi.object({
        category_id: Joi.number().required(),
        type: Joi.string().valid(CategoryType.INCOME, CategoryType.EXPENSE).required(),
        amount: Joi.number().min(0).required(),
        transaction_date: Joi.date().iso().required(),
        description: Joi.string().allow('', null).optional()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return ReturnHelper.errorResponse(res, 400, 400, error.message);
      }

      const transactionRepository = OrmHelper.DB.getRepository(Transaction);
      const categoryRepository = OrmHelper.DB.getRepository(Category);
      const transactionIdParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const transactionId = Number.parseInt(transactionIdParam, 10);
      const userId = req.auth?.id;

      if (Number.isNaN(transactionId)) {
        return ReturnHelper.errorResponse(res, 400, 400, "Invalid transaction id");
      }

      const transaction = await transactionRepository.findOne({ where: { id: transactionId } });
      
      if (!transaction || transaction.user_id !== userId) {
        return ReturnHelper.errorResponse(res, 404, 404, "Transaction not found");
      }

      // Cek validasi kategori
      const category = await categoryRepository.findOne({ where: { id: value.category_id } });
      if (!category || (category.user_id !== null && category.user_id !== userId)) {
        return ReturnHelper.errorResponse(res, 400, 400, "Invalid category");
      }

      transaction.category_id = value.category_id;
      transaction.type = value.type;
      transaction.amount = value.amount;
      transaction.transaction_date = value.transaction_date;
      transaction.description = value.description;

      const updatedTransaction = await transactionRepository.save(transaction);
      return ReturnHelper.successResponseAny(res, 200, "Transaction updated successfully", updatedTransaction);
    } catch (err: any) {
      return ReturnHelper.errorResponse(res, 500, 500, err.message);
    }
  }

  static async delete(req: Request, res: Response) {
    /* 
      #swagger.tags = ['Transaction']
      #swagger.summary = 'Delete transaction'
      #swagger.security = [{"bearerAuth": []}]
    */
    try {
      const transactionRepository = OrmHelper.DB.getRepository(Transaction);
      const transactionIdParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const transactionId = Number.parseInt(transactionIdParam, 10);
      const userId = req.auth?.id;

      if (Number.isNaN(transactionId)) {
        return ReturnHelper.errorResponse(res, 400, 400, "Invalid transaction id");
      }

      const transaction = await transactionRepository.findOne({ where: { id: transactionId } });
      
      if (!transaction || transaction.user_id !== userId) {
        return ReturnHelper.errorResponse(res, 404, 404, "Transaction not found");
      }

      await transactionRepository.softRemove(transaction);
      return ReturnHelper.successResponseAny(res, 200, "Transaction deleted successfully", null);
    } catch (err: any) {
      return ReturnHelper.errorResponse(res, 500, 500, err.message);
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
        return ReturnHelper.errorResponse(res, 400, 400, "startDate and endDate are required");
      }

      const transactionRepository = OrmHelper.DB.getRepository(Transaction);

      // 1. Ambil detail history
      const history = await transactionRepository.createQueryBuilder("transaction")
        .leftJoinAndSelect("transaction.category", "category")
        .where("transaction.user_id = :userId", { userId })
        .andWhere("transaction.transaction_date >= :startDate", { startDate })
        .andWhere("transaction.transaction_date <= :endDate", { endDate })
        .orderBy("transaction.transaction_date", "DESC")
        .getMany();

      let total_income = 0;
      let total_expense = 0;
      const expense_per_category: Record<string, number> = {};
      const income_per_category: Record<string, number> = {};

      for (const t of history) {
        const amount = Number(t.amount);
        const categoryName = t.category?.name || 'Unknown';
        
        if (t.type === CategoryType.INCOME) {
          total_income += amount;
          income_per_category[categoryName] = (income_per_category[categoryName] || 0) + amount;
        } else {
          total_expense += amount;
          expense_per_category[categoryName] = (expense_per_category[categoryName] || 0) + amount;
        }
      }

      const balance = total_income - total_expense;

      // Konversi object per category ke array format [{category: 'X', total: 100}]
      const mapToArray = (obj: Record<string, number>) => {
        return Object.keys(obj).map(key => ({
          category: key,
          total: obj[key]
        }));
      };

      const responseData = {
        balance_summary: {
          total_income,
          total_expense,
          balance
        },
        expense_per_category: mapToArray(expense_per_category),
        income_per_category: mapToArray(income_per_category),
        history
      };

      return ReturnHelper.successResponseAny(res, 200, "History fetched successfully", responseData);
    } catch (err: any) {
      return ReturnHelper.errorResponse(res, 500, 500, err.message);
    }
  }
}
