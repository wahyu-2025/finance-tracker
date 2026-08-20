import { Request, Response } from 'express';
import { OrmHelper } from '../helpers/orm';
import { CustomRecap } from '../entities/CustomRecap';
import { Transaction } from '../entities/Transaction';
import { CategoryType } from '../entities/Category';
import { ReturnHelper } from '../helpers/express/return';
import Joi from 'joi';

export class CustomRecapController {

  static async create(req: Request, res: Response) {
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

      const customRecapRepository = OrmHelper.DB.getRepository(CustomRecap);
      const userId = req.auth?.id;

      const newRecap = customRecapRepository.create({
        user_id: userId,
        name: value.name,
        start_date: value.start_date,
        end_date: value.end_date,
      });

      const savedRecap = await customRecapRepository.save(newRecap);
      return ReturnHelper.successResponseAny(res, 201, "Custom recap created successfully", savedRecap);
    } catch (err: any) {
      return ReturnHelper.errorResponse(res, 500, 500, err.message);
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const userId = req.auth?.id;
      const customRecapRepository = OrmHelper.DB.getRepository(CustomRecap);
      const transactionRepository = OrmHelper.DB.getRepository(Transaction);

      const recaps = await customRecapRepository.find({
        where: { user_id: userId },
        order: { createdAt: 'DESC' }
      });

      // Calculate totals for each recap
      const recapsWithTotals = await Promise.all(recaps.map(async (recap) => {
        const transactions = await transactionRepository.createQueryBuilder("transaction")
          .where("transaction.user_id = :userId", { userId })
          .andWhere("transaction.transaction_date >= :startDate", { startDate: recap.start_date })
          .andWhere("transaction.transaction_date <= :endDate", { endDate: recap.end_date })
          .getMany();

        let total_income = 0;
        let total_expense = 0;

        for (const t of transactions) {
          if (t.type === CategoryType.INCOME) {
            total_income += Number(t.amount);
          } else {
            total_expense += Number(t.amount);
          }
        }

        return {
          ...recap,
          total_income,
          total_expense,
          balance: total_income - total_expense
        };
      }));

      return ReturnHelper.successResponseAny(res, 200, "Custom recaps fetched successfully", recapsWithTotals);
    } catch (err: any) {
      return ReturnHelper.errorResponse(res, 500, 500, err.message);
    }
  }

  static async getOne(req: Request, res: Response) {
      try {
        const userId = req.auth?.id;
        const recapIdParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const recapId = Number.parseInt(recapIdParam, 10);
        
        if (Number.isNaN(recapId)) {
          return ReturnHelper.errorResponse(res, 400, 400, "Invalid custom recap id");
        }

        const customRecapRepository = OrmHelper.DB.getRepository(CustomRecap);
        const recap = await customRecapRepository.findOne({
            where: { id: recapId, user_id: userId }
        });

        if (!recap) {
            return ReturnHelper.errorResponse(res, 404, 404, "Custom recap not found");
        }
        
        return ReturnHelper.successResponseAny(res, 200, "Custom recap fetched successfully", recap);

      } catch (err: any) {
          return ReturnHelper.errorResponse(res, 500, 500, err.message);
      }
  }

  static async update(req: Request, res: Response) {
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

      const customRecapRepository = OrmHelper.DB.getRepository(CustomRecap);
      const recapIdParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const recapId = Number.parseInt(recapIdParam, 10);
      const userId = req.auth?.id;

      if (Number.isNaN(recapId)) {
        return ReturnHelper.errorResponse(res, 400, 400, "Invalid recap id");
      }

      const recap = await customRecapRepository.findOne({ where: { id: recapId } });
      
      if (!recap || recap.user_id !== userId) {
        return ReturnHelper.errorResponse(res, 404, 404, "Custom recap not found");
      }

      recap.name = value.name;
      recap.start_date = value.start_date;
      recap.end_date = value.end_date;

      const updatedRecap = await customRecapRepository.save(recap);
      return ReturnHelper.successResponseAny(res, 200, "Custom recap updated successfully", updatedRecap);
    } catch (err: any) {
      return ReturnHelper.errorResponse(res, 500, 500, err.message);
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const customRecapRepository = OrmHelper.DB.getRepository(CustomRecap);
      const recapIdParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const recapId = Number.parseInt(recapIdParam, 10);
      const userId = req.auth?.id;

      if (Number.isNaN(recapId)) {
        return ReturnHelper.errorResponse(res, 400, 400, "Invalid recap id");
      }

      const recap = await customRecapRepository.findOne({ where: { id: recapId } });
      
      if (!recap || recap.user_id !== userId) {
        return ReturnHelper.errorResponse(res, 404, 404, "Custom recap not found");
      }

      await customRecapRepository.softRemove(recap);
      return ReturnHelper.successResponseAny(res, 200, "Custom recap deleted successfully", null);
    } catch (err: any) {
      return ReturnHelper.errorResponse(res, 500, 500, err.message);
    }
  }
}
