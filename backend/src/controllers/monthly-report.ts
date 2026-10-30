import { Request, Response } from "express";
import { OrmHelper } from "../helpers/orm";
import { MonthlyReport } from "../entities/MonthlyReport";
import { Transaction } from "../entities/Transaction";
import { ReturnHelper } from "../helpers/express/return";
import { MonthlyReportService } from "../services/monthly-report";

export class MonthlyReportController {
  /**
   * Get all monthly reports for the authenticated user (optional query: year)
   */
  static async getAll(req: Request, res: Response) {
    /* 
      #swagger.tags = ['Monthly Report']
      #swagger.summary = 'Get all monthly reports'
      #swagger.security = [{"bearerAuth": []}]
      #swagger.parameters['year'] = { in: 'query', type: 'integer', description: 'Filter by year (e.g. 2026)' }
    */
    try {
      const userId = req.auth?.id;
      const year = req.query.year ? Number(req.query.year) : undefined;

      const repo = OrmHelper.DB.getRepository(MonthlyReport);
      const query = repo.createQueryBuilder("r")
        .where("r.user_id = :userId", { userId })
        .orderBy("r.year", "DESC")
        .addOrderBy("r.month", "DESC");

      if (year && !isNaN(year)) {
        query.andWhere("r.year = :year", { year });
      }

      const reports = await query.getMany();

      return ReturnHelper.successResponseAny(
        res,
        200,
        "Monthly reports retrieved successfully",
        reports
      );
    } catch (err: unknown) {
      return ReturnHelper.errorResponse(res, 500, 500, (err as Error).message);
    }
  }

  // /**
  //  * Get detail of a specific monthly report including transactions breakdown
  //  */
  // static async getById(req: Request, res: Response) {
  //   /* 
  //     #swagger.tags = ['Monthly Report']
  //     #swagger.summary = 'Get monthly report detail'
  //     #swagger.security = [{"bearerAuth": []}]
  //     #swagger.parameters['id'] = { description: 'Monthly Report ID', type: 'integer' }
  //   */
  //   try {
  //     const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  //     const reportId = Number.parseInt(idParam, 10);
  //     const userId = req.auth?.id;

  //     if (isNaN(reportId)) {
  //       return ReturnHelper.errorResponse(res, 400, 400, "Invalid report id");
  //     }

  //     const repo = OrmHelper.DB.getRepository(MonthlyReport);
  //     const report = await repo.findOne({
  //       where: { id: reportId, user_id: userId },
  //     });

  //     if (!report) {
  //       return ReturnHelper.errorResponse(res, 404, 404, "Monthly report not found");
  //     }

  //     // Fetch transactions in this monthly report
  //     const txRepo = OrmHelper.DB.getRepository(Transaction);
  //     const transactions = await txRepo.createQueryBuilder("t")
  //       .leftJoinAndSelect("t.category", "category")
  //       .leftJoinAndSelect("t.wallet", "wallet")
  //       .where("t.user_id = :userId", { userId })
  //       .andWhere("t.transaction_date >= :startDate", { startDate: report.start_date })
  //       .andWhere("t.transaction_date <= :endDate", { endDate: report.end_date })
  //       .orderBy("t.transaction_date", "DESC")
  //       .addOrderBy("t.id", "DESC")
  //       .getMany();

  //     return ReturnHelper.successResponseAny(
  //       res,
  //       200,
  //       "Monthly report detail retrieved successfully",
  //       {
  //         report,
  //         transactions,
  //       }
  //     );
  //   } catch (err: unknown) {
  //     return ReturnHelper.errorResponse(res, 500, 500, (err as Error).message);
  //   }
  // }

  /**
   * Manual trigger to recalculate Year-To-Date monthly reports for the user
   */
  static async sync(req: Request, res: Response) {
    /* 
      #swagger.tags = ['Monthly Report']
      #swagger.summary = 'Sync Year-To-Date monthly reports for current user'
      #swagger.security = [{"bearerAuth": []}]
    */
    try {
      const userId = req.auth?.id;
      await MonthlyReportService.generateYearToDate(userId);

      return ReturnHelper.successResponseAny(
        res,
        200,
        "Monthly reports synchronized successfully",
        null
      );
    } catch (err: unknown) {
      return ReturnHelper.errorResponse(res, 500, 500, (err as Error).message);
    }
  }
}
