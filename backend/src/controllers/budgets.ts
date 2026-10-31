import Joi from "joi";
import { ReturnHelper } from "../helpers/express/return";
import { Request, Response } from "express";
import { OrmHelper } from "../helpers/orm";
import { Budget } from "../entities";

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
      #swagger.parameters['id'] = { in: path, description: 'id', type: 'integer' }
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
}
