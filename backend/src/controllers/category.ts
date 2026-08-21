import { Request, Response } from 'express';
import { OrmHelper } from '../helpers/orm';
import { Category, CategoryType } from '../entities/Category';
import { ReturnHelper } from '../helpers/express/return';
import Joi from 'joi';

export class CategoryController {

  static async create(req: Request, res: Response) {
    /* 
      #swagger.tags = ['Category']
      #swagger.summary = 'Create a new private category'
      #swagger.security = [{"bearerAuth": []}]
      #swagger.requestBody = {
          required: true,
          content: {
              "application/json": {
                  schema: { $ref: "#/components/schemas/CreateCategoryRequest" }  
              }
          }
      }
    */
    try {
      const schema = Joi.object({
        name: Joi.string().required(),
        type: Joi.string().valid(CategoryType.INCOME, CategoryType.EXPENSE).required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return ReturnHelper.errorResponse(res, 400, 400, error.message);
      }

      const categoryRepository = OrmHelper.DB.getRepository(Category);
      
      const newCategory = categoryRepository.create({
        name: value.name,
        type: value.type,
        user_id: req.auth?.id
      });

      const savedCategory = await categoryRepository.save(newCategory);
      return ReturnHelper.successResponseAny(res, 201, "Category created successfully", savedCategory);
    } catch (err: unknown) {
      return ReturnHelper.errorResponse(res, 500, 500, (err as Error).message);
    }
  }

  static async getAll(req: Request, res: Response) {
    /* 
      #swagger.tags = ['Category']
      #swagger.summary = 'Get all categories (Global & Private)'
      #swagger.security = [{"bearerAuth": []}]
    */
    try {
      const categoryRepository = OrmHelper.DB.getRepository(Category);
      const userId = req.auth?.id;

      // Ambil kategori global (user_id IS NULL) dan private milik user
      const categories = await categoryRepository.createQueryBuilder("category")
        .where("category.user_id IS NULL")
        .orWhere("category.user_id = :userId", { userId })
        .getMany();

      return ReturnHelper.successResponseAny(res, 200, "Categories fetched successfully", categories);
    } catch (err: unknown) {
      return ReturnHelper.errorResponse(res, 500, 500, (err as Error).message);
    }
  }

  static async update(req: Request, res: Response) {
    /* 
      #swagger.tags = ['Category']
      #swagger.summary = 'Update private category'
      #swagger.security = [{"bearerAuth": []}]
      #swagger.parameters['id'] = { description: 'Category ID', type: 'integer' }
      #swagger.requestBody = {
          required: true,
          content: {
              "application/json": {
                  schema: { $ref: "#/components/schemas/UpdateCategoryRequest" }  
              }
          }
      }
    */
    try {
      const schema = Joi.object({
        name: Joi.string().required(),
        type: Joi.string().valid(CategoryType.INCOME, CategoryType.EXPENSE).required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return ReturnHelper.errorResponse(res, 400, 400, error.message);
      }

      const categoryRepository = OrmHelper.DB.getRepository(Category);
      const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const categoryId = parseInt(rawId as string);
      const userId = req.auth?.id;

      const category = await categoryRepository.findOne({ where: { id: categoryId } });
      
      if (!category) {
        return ReturnHelper.errorResponse(res, 404, 404, "Category not found");
      }

      if (category.user_id !== userId) {
        return ReturnHelper.errorResponse(res, 403, 403, "Cannot edit global category or other user's category");
      }

      category.name = value.name;
      category.type = value.type;

      const updatedCategory = await categoryRepository.save(category);
      return ReturnHelper.successResponseAny(res, 200, "Category updated successfully", updatedCategory);
    } catch (err: unknown) {
      return ReturnHelper.errorResponse(res, 500, 500, (err as Error).message);
    }
  }

  static async delete(req: Request, res: Response) {
    /* 
      #swagger.tags = ['Category']
      #swagger.summary = 'Delete private category'
      #swagger.security = [{"bearerAuth": []}]
      #swagger.parameters['id'] = { description: 'Category ID', type: 'integer' }
    */
    try {
      const categoryRepository = OrmHelper.DB.getRepository(Category);
      const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const categoryId = parseInt(rawId as string);
      const userId = req.auth?.id;

      const category = await categoryRepository.findOne({ where: { id: categoryId } });
      
      if (!category) {
        return ReturnHelper.errorResponse(res, 404, 404, "Category not found");
      }

      if (category.user_id !== userId) {
        return ReturnHelper.errorResponse(res, 403, 403, "Cannot delete global category or other user's category");
      }

      await categoryRepository.softRemove(category);
      return ReturnHelper.successResponseAny(res, 200, "Category deleted successfully", null);
    } catch (err: unknown) {
      return ReturnHelper.errorResponse(res, 500, 500, (err as Error).message);
    }
  }
}
