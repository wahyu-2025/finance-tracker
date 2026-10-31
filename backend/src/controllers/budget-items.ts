import Joi from "joi";
import { ReturnHelper } from "../helpers/express/return";
import { Request, Response } from "express";
import { OrmHelper } from "../helpers/orm";
import { Budget, BudgetItem, Category } from "../entities";
import { Brackets, In } from "typeorm";
import { CategoryType } from "../types/types";

interface BudgetItemsReq {
  budget_id: number;
  category_id: number;
  amount: number;
}

export class BudgetItemsController {
  static async create(req: Request, res: Response) {
    /* 
      #swagger.tags = ['Budget Items']
      #swagger.summary = 'Create a new budget item'
      #swagger.security = [{"bearerAuth": []}]
      #swagger.parameters['budget_id'] = { description: 'budget_id', type: 'integer' }
      #swagger.requestBody = {
          required: true,
          content: {
              "application/json": {
                  schema: { $ref: "#/components/schemas/CreateBudgetItemsRequest" }  
              }
          }
      }
    */
    try {
      const schema = Joi.object({
        budget_items: Joi.array()
          .items(
            Joi.object({
              category_id: Joi.number().integer().positive().required(),
              amount: Joi.number().positive().required(),
            }),
          )
          .min(1)
          .unique("category_id")
          .required(),
      });

      const { error, value } = schema.validate(req.body);

      if (error) {
        return ReturnHelper.errorResponse(res, 400, 400, error.message);
      }

      const budget_id = Number(req.params.budget_id);
      const user_id = req.auth?.id;

      if (!Number.isInteger(user_id)) {
        return ReturnHelper.errorResponse(res, 401, 401, "Unauthorized");
      }

      if (!Number.isInteger(budget_id) || budget_id <= 0) {
        return ReturnHelper.errorResponse(res, 400, 400, "Invalid Budget Id.");
      }

      const BudgetRepository = OrmHelper.DB.getRepository(Budget);
      const budget = await BudgetRepository.findOne({
        where: { id: budget_id, user_id },
      });

      if (!budget) {
        return ReturnHelper.errorResponse(res, 404, 404, "Budget not found");
      }

      const CategoryRepository = OrmHelper.DB.getRepository(Category);

      const categoryIds = value.budget_items.map(
        (item: BudgetItemsReq) => item.category_id,
      );

      const categories = await CategoryRepository.createQueryBuilder("category")
        .where("category.id IN (:...categoryIds)", { categoryIds })
        .andWhere(
          new Brackets((qb) => {
            qb.where("category.user_id IS NULL").orWhere(
              "category.user_id = :user_id",
              { user_id },
            );
          }),
        )
        .andWhere("category.type = :type", {
          type: CategoryType.EXPENSE,
        })
        .getMany();

      if (categories.length !== categoryIds.length) {
        const missingCategory = categoryIds.filter(
          (id: number) =>
            !categories.find((item: Category) => item.id === id)?.name,
        );
        return ReturnHelper.errorResponse(
          res,
          404,
          404,
          `Category with name ${missingCategory.join(", ")} not found.`,
        );
      }

      const BudgetItemsRepository = OrmHelper.DB.getRepository(BudgetItem);

      const existingCategory = await BudgetItemsRepository.find({
        where: {
          budget_id,
          category_id: In(
            value.budget_items.map((item: BudgetItemsReq) => item.category_id),
          ),
        },
      });

      if (existingCategory.length > 0) {
        const duplicateCategoryName = existingCategory.map(
          (item: BudgetItem) =>
            categories.find((c) => c.id === item.category_id)?.name,
        );
        return ReturnHelper.errorResponse(
          res,
          400,
          400,
          `Budget Item with category ${duplicateCategoryName.join(", ")} already exists in budget`,
        );
      }

      const newItems = value.budget_items.map((item: BudgetItemsReq) => {
        return BudgetItemsRepository.create({
          budget_id: budget_id,
          category_id: item.category_id,
          amount: item.amount,
        });
      });

      await BudgetItemsRepository.save(newItems);

      return ReturnHelper.successResponseAny(
        res,
        201,
        "Budget Items created successfully",
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
      #swagger.tags = ['Budget Items']
      #swagger.summary = 'Update a budget item'
      #swagger.security = [{"bearerAuth": []}]
      #swagger.parameters['id'] = { description: 'id', type: 'integer' }
      #swagger.parameters['budget_id'] = { description: 'budget_id', type: 'integer' }
      #swagger.requestBody = {
          required: true,
          content: {
              "application/json": {
                  schema: { $ref: "#/components/schemas/UpdateBudgetItemsRequest" }  
              }
          }
      }
    */
    try {
      const schema = Joi.object({
        category_id: Joi.number().integer().positive().optional(),
        amount: Joi.number().positive().optional(),
      }).min(1);

      const { error, value } = schema.validate(req.body);

      if (error) {
        return ReturnHelper.errorResponse(res, 400, 400, error.message);
      }

      const budget_id = Number(req.params.budget_id);
      const id = Number(req.params.id);
      const user_id = req.auth?.id;

      if (!user_id || !Number.isInteger(user_id)) {
        return ReturnHelper.errorResponse(res, 401, 401, "Unauthorized");
      }

      if (
        !Number.isInteger(budget_id) ||
        budget_id <= 0 ||
        !Number.isInteger(id) ||
        id <= 0
      ) {
        return ReturnHelper.errorResponse(
          res,
          400,
          400,
          "Invalid Budget or Budget Item Id.",
        );
      }

      const BudgetRepository = OrmHelper.DB.getRepository(Budget);

      const budget = await BudgetRepository.findOne({
        where: { id: budget_id, user_id },
      });

      if (!budget) {
        return ReturnHelper.errorResponse(res, 404, 404, "Budget not found");
      }

      const BudgetItemsRepository = OrmHelper.DB.getRepository(BudgetItem);

      const budgetItem = await BudgetItemsRepository.findOne({
        where: { id, budget_id },
      });

      if (!budgetItem) {
        return ReturnHelper.errorResponse(
          res,
          404,
          404,
          "Budget Item not found",
        );
      }

      if (value.category_id !== undefined) {
        const CategoryRepository = OrmHelper.DB.getRepository(Category);

        const category = await CategoryRepository.createQueryBuilder("category")
          .where("category.id = :category_id", {
            category_id: value.category_id,
          })
          .andWhere(
            new Brackets((qb) => {
              qb.where("category.user_id IS NULL").orWhere(
                "category.user_id = :user_id",
                { user_id },
              );
            }),
          )
          .andWhere("category.type = :type", {
            type: CategoryType.EXPENSE,
          })
          .getOne();

        if (!category) {
          return ReturnHelper.errorResponse(
            res,
            404,
            404,
            "Category not found or unavailable",
          );
        }

        const existingCategory = await BudgetItemsRepository.findOne({
          where: {
            budget_id,
            category_id: value.category_id,
          },
        });

        if (existingCategory && existingCategory.id !== budgetItem.id) {
          return ReturnHelper.errorResponse(
            res,
            400,
            400,
            "Category already exists in this budget",
          );
        }

        budgetItem.category_id = value.category_id;
      }

      if (value.amount !== undefined) {
        budgetItem.amount = value.amount;
      }

      await BudgetItemsRepository.save(budgetItem);

      return ReturnHelper.successResponseAny(
        res,
        200,
        "Budget Item updated successfully",
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
      #swagger.tags = ['Budget Items']
      #swagger.summary = 'Delete a budget item'
      #swagger.security = [{"bearerAuth": []}]
      #swagger.parameters['id'] = { description: 'id', type: 'integer' }
      #swagger.parameters['budget_id'] = { description: 'budget_id', type: 'integer' }
    */
    try {
      const budget_id = Number(req.params.budget_id);
      const id = Number(req.params.id);
      const user_id = req.auth?.id;

      if (!user_id || !Number.isInteger(user_id)) {
        return ReturnHelper.errorResponse(res, 401, 401, "Unauthorized");
      }

      if (
        !Number.isInteger(budget_id) ||
        budget_id <= 0 ||
        !Number.isInteger(id) ||
        id <= 0
      ) {
        return ReturnHelper.errorResponse(
          res,
          400,
          400,
          "Invalid Budget or Budget Item Id.",
        );
      }

      const BudgetRepository = OrmHelper.DB.getRepository(Budget);

      const budget = await BudgetRepository.findOne({
        where: {
          id: budget_id,
          user_id,
        },
      });

      if (!budget) {
        return ReturnHelper.errorResponse(res, 404, 404, "Budget not found");
      }

      const BudgetItemsRepository = OrmHelper.DB.getRepository(BudgetItem);

      const budgetItem = await BudgetItemsRepository.findOne({
        where: { id, budget_id },
      });

      if (!budgetItem) {
        return ReturnHelper.errorResponse(
          res,
          404,
          404,
          "Budget Item not found",
        );
      }

      await BudgetItemsRepository.softRemove(budgetItem);

      return ReturnHelper.successResponseAny(
        res,
        200,
        "Budget Item deleted successfully",
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
