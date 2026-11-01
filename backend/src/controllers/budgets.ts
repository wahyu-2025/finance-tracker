import Joi from "joi";
import { ReturnHelper } from "../helpers/express/return";
import { Request, Response } from "express";
import { OrmHelper } from "../helpers/orm";
import { Budget, Transaction } from "../entities";
import { Brackets } from "typeorm";
import { CategoryType } from "../types/types";

export class BudgetsController {
  static async create(req: Request, res: Response) {
    /* 
      #swagger.tags = ['Budget']
      #swagger.summary = 'Create a new budget'
      #swagger.security = [{"bearerAuth": []}]
      #swagger.requestBody = {
          required: true,
          content: {
              "application/json": {
                  schema: { $ref: "#/components/schemas/CreateBudgetRequest" }  
              }
          }
      }
    */
    try {
      const schema = Joi.object({
        name: Joi.string().required(),
        start_date: Joi.date().iso().required(),
        end_date: Joi.date().iso().required(),
      });

      const { error, value } = schema.validate(req.body);

      if (error) {
        return ReturnHelper.errorResponse(res, 400, 400, error.message);
      }

      const user_id = req.auth?.id;

      if (!user_id) {
        return ReturnHelper.errorResponse(res, 401, 401, "Unauthorized");
      }

      const BudgetRepository = OrmHelper.DB.getRepository(Budget);

      const newBudget = BudgetRepository.create({
        user_id,
        name: value.name,
        start_date: value.start_date,
        end_date: value.end_date,
      });

      await BudgetRepository.save(newBudget);

      return ReturnHelper.successResponseAny(
        res,
        201,
        "Budget created successfully",
      );
    } catch (error: unknown) {
      return ReturnHelper.errorResponse(
        res,
        500,
        500,
        (error as Error).message,
      );
    }
  }

  static async update(req: Request, res: Response) {
    /* 
      #swagger.tags = ['Budget']
      #swagger.summary = 'Update a budget'
      #swagger.security = [{"bearerAuth": []}]
      #swagger.parameters['id'] = { description: 'id', type: 'integer' }
      #swagger.requestBody = {
          required: true,
          content: {
              "application/json": {
                  schema: { $ref: "#/components/schemas/UpdateBudgetRequest" }  
              }
          }
      }
    */
    try {
      const schema = Joi.object({
        name: Joi.string().required(),
        start_date: Joi.date().iso().required(),
        end_date: Joi.date().iso().required(),
      });

      const { error, value } = schema.validate(req.body);

      if (error) {
        return ReturnHelper.errorResponse(res, 400, 400, error.message);
      }

      const user_id = req.auth?.id;

      if (!user_id) {
        return ReturnHelper.errorResponse(res, 401, 401, "Unauthorized");
      }

      const budget_id = Number(req.params.id);

      if (!Number.isInteger(budget_id) || budget_id <= 0) {
        return ReturnHelper.errorResponse(res, 400, 400, "Invalid budget id");
      }

      const budgetRepository = OrmHelper.DB.getRepository(Budget);

      const budget = await budgetRepository.findOne({
        where: { id: budget_id, user_id },
      });

      if (!budget) {
        return ReturnHelper.errorResponse(res, 404, 404, "Budget not found");
      }

      const startDate = value.start_date ? value.start_date : budget.start_date;
      const endDate = value.end_date ? value.end_date : budget.end_date;

      if (new Date(endDate) < new Date(startDate)) {
        return ReturnHelper.errorResponse(
          res,
          400,
          400,
          "End date cannot be earlier than start date",
        );
      }

      budget.name = value.name || budget.name;
      budget.start_date = startDate;
      budget.end_date = endDate;

      await budgetRepository.save(budget);

      return ReturnHelper.successResponseAny(
        res,
        200,
        "Budget updated successfully",
      );
    } catch (error: unknown) {
      return ReturnHelper.errorResponse(
        res,
        500,
        500,
        (error as Error).message,
      );
    }
  }

  static async delete(req: Request, res: Response) {
    /* 
      #swagger.tags = ['Budget']
      #swagger.summary = 'Delete a budget'
      #swagger.security = [{"bearerAuth": []}]
      #swagger.parameters['id'] = { description: 'id', type: 'integer' }
    */
    try {
      const user_id = req.auth?.id;
      const budget_id = Number(req.params.id);

      if (!user_id) {
        return ReturnHelper.errorResponse(res, 401, 401, "Unauthorized");
      }

      if (!Number.isInteger(budget_id) || budget_id <= 0) {
        return ReturnHelper.errorResponse(res, 400, 400, "Invalid budget id");
      }

      const budgetRepository = OrmHelper.DB.getRepository(Budget);

      const budget = await budgetRepository.findOne({
        where: { id: budget_id, user_id },
      });

      if (!budget) {
        return ReturnHelper.errorResponse(res, 404, 404, "Budget not found");
      }

      await budgetRepository.softRemove(budget);

      return ReturnHelper.successResponseAny(
        res,
        200,
        "Budget deleted successfully",
      );
    } catch (error: unknown) {
      return ReturnHelper.errorResponse(
        res,
        500,
        500,
        (error as Error).message,
      );
    }
  }

  static async getBudgets(req: Request, res: Response) {
    /* 
      #swagger.tags = ['Budget']
      #swagger.summary = 'get budget list'
      #swagger.security = [{"bearerAuth": []}]
    */
    try {
      const user_id = req.auth?.id;

      if (!user_id) {
        return ReturnHelper.errorResponse(res, 401, 401, "Unauthorized");
      }

      const budgetRepository = OrmHelper.DB.getRepository(Budget);

      const budget = await budgetRepository.find({
        where: { user_id },
      });

      if (budget.length === 0) {
        return ReturnHelper.successResponseAny(
          res,
          200,
          "Budget retrieved successfully",
          [],
        );
      }

      return ReturnHelper.successResponseAny(
        res,
        200,
        "Budget retrieved successfully",
        budget,
      );
    } catch (error: unknown) {
      return ReturnHelper.errorResponse(
        res,
        500,
        500,
        (error as Error).message,
      );
    }
  }

  static async getDetailBudget(req: Request, res: Response) {
    /* 
      #swagger.tags = ['Budget']
      #swagger.summary = 'get budget detail'
      #swagger.security = [{"bearerAuth": []}]
      #swagger.parameters['id'] = { description: 'id', type: 'integer' }
    */
    try {
      const user_id = req.auth?.id;
      const budget_id = Number(req.params.id);

      if (!user_id) {
        return ReturnHelper.errorResponse(res, 401, 401, "Unauthorized");
      }

      if (!Number.isInteger(budget_id) || budget_id <= 0) {
        return ReturnHelper.errorResponse(res, 400, 400, "Invalid budget id");
      }

      const budgetRepository = OrmHelper.DB.getRepository(Budget);

      const budget = await budgetRepository.findOne({
        where: { id: budget_id, user_id },
        relations: { budget_items: { category: true } },
      });

      if (!budget) {
        return ReturnHelper.errorResponse(res, 404, 404, "Budget not found");
      }

      const categoryIds = budget.budget_items.map((item) => item.category_id);

      const transactionRepository = OrmHelper.DB.getRepository(Transaction);

      const query = transactionRepository
        .createQueryBuilder("t")
        .select("t.category_id", "category_id")
        .addSelect("SUM(t.amount)", "usage")
        .where("t.user_id = :user_id", { user_id })
        .andWhere("t.type = :type", { type: CategoryType.EXPENSE })
        .andWhere("t.category_id IN (:...categoryIds)", { categoryIds })
        .andWhere("t.transaction_date >= :start_date", {
          start_date: budget.start_date,
        })
        .andWhere("t.transaction_date < DATE_ADD(:end_date, INTERVAL 1 DAY)", {
          end_date: budget.end_date,
        })
        .groupBy("t.category_id")
        .getRawMany<{ category_id: number; usage: string }>();

      const usageRows = categoryIds.length ? await query : [];

      const usageMap = new Map<number, number>(
        usageRows.map((row) => [Number(row.category_id), Number(row.usage)]),
      );

      const budgetItems = budget.budget_items.map((item) => {
        const amount = Number(item.amount);
        const usage = usageMap.get(item.category_id) ?? 0;

        return {
          ...item,
          amount,
          usage,
          remaining: amount - usage,
          usage_percentage: amount > 0 ? (usage / amount) * 100 : 0,
        };
      });

      // Calculate budget summary
      const totalBudget = budgetItems.reduce(
        (sum, item) => sum + item.amount,
        0,
      );

      const totalAmount = budgetItems.reduce(
        (sum, item) => sum + item.amount,
        0,
      );

      const totalUsage = budgetItems.reduce((sum, item) => sum + item.usage, 0);

      const totalRemaining = totalBudget - totalUsage;

      const usagePercentage =
        totalBudget > 0
          ? Number(((totalUsage / totalBudget) * 100).toFixed(2))
          : 0;

      return ReturnHelper.successResponseAny(
        res,
        200,
        "Budget retrieved successfully",
        {
          ...budget,
          total_amount: totalAmount,
          total_usage: totalUsage,
          total_remaining: totalRemaining,
          usage_percentage: usagePercentage,
          budget_items: budgetItems,
        },
      );
    } catch (error: unknown) {
      return ReturnHelper.errorResponse(
        res,
        500,
        500,
        (error as Error).message,
      );
    }
  }
}
