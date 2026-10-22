import { Request, Response } from "express";
import { ReturnHelper } from "../helpers/express/return";
import { ILogObj, Logger } from "tslog";
import { OrmHelper } from "../helpers/orm";
import { Wallet, WalletType } from "../entities/wallet";
import Joi from "joi";

const log: Logger<ILogObj> = new Logger({ name: "[WalletController]" });

export class WalletController {
  static async create(req: Request, res: Response) {
    /* 
      #swagger.tags = ['Wallet']
      #swagger.summary = 'Create a new private wallet'
      #swagger.security = [{"bearerAuth": []}]
      #swagger.requestBody = {
          required: true,
          content: {
              "application/json": {
                  schema: { $ref: "#/components/schemas/CreateWalletRequest" }  
              }
          }
      }
    */
    try {
      const schema = Joi.object({
        name: Joi.string().required(),
        type: Joi.string().valid(
          WalletType.BANK,
          WalletType.EWALLET,
          WalletType.CASH,
        ),
        initial_balance: Joi.number().required(),
      });

      const { error, value } = schema.validate(req.body);

      if (error) {
        return ReturnHelper.errorResponse(res, 400, 400, error.message);
      }

      const userId = req.auth?.id;
      console.log("User ID:", userId);
      
      if (!userId) {
        return ReturnHelper.errorResponse(res, 401, 401, "Unauthorized");
      }

      const walletRepository = OrmHelper.DB.getRepository(Wallet);

      const newWallet = walletRepository.create({
        name: value.name,
        type: value.type,
        initial_balance: value.initial_balance,
        balance: value.initial_balance,
        user_id: userId,
      });

      const savedWallet = await walletRepository.save(newWallet);
      return ReturnHelper.successResponseAny(
        res,
        201,
        "Wallet created successfully",
        savedWallet,
      );
    } catch (error) {
      return ReturnHelper.errorResponse(res, 500, 500, error.message);
    }
  }

  static async getAll(req: Request, res: Response) {
    /* 
      #swagger.tags = ['Wallet']
      #swagger.summary = 'Get all wallets (Global & Private)'
      #swagger.security = [{"bearerAuth": []}]
    */
    try {
      const walletRepository = OrmHelper.DB.getRepository(Wallet);
      const userId = req.auth?.id;

      if (!userId) {
        return ReturnHelper.errorResponse(res, 401, 401, "Unauthorized");
      }

      // Ambil kategori global (user_id IS NULL) dan private milik user
      const wallets = await walletRepository
        .createQueryBuilder("wallet")
        .where("wallet.user_id IS NULL")
        .orWhere("wallet.user_id = :userId", { userId })
        .getMany();

      return ReturnHelper.successResponseAny(
        res,
        200,
        "Wallets fetched successfully",
        wallets,
      );
    } catch (err: unknown) {
      return ReturnHelper.errorResponse(res, 500, 500, (err as Error).message);
    }
  }
}
