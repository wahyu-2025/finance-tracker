import { Request, Response } from "express";
import { ReturnHelper } from "../helpers/express/return";
import { ILogObj, Logger } from "tslog";
import { OrmHelper } from "../helpers/orm";
import { Wallet } from "../entities/wallet";
import Joi from "joi";
import { Transfer } from "../entities/Transfer";
import { WalletType } from "../types/types";

const log: Logger<ILogObj> = new Logger({ name: "[WalletController]" });

export class WalletController {
  static async create(req: Request, res: Response) {
    /* 
      #swagger.tags = ['Wallet']
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
        balance: Joi.number().required(),
      });

      const { error, value } = schema.validate(req.body);

      const walletRepository = OrmHelper.DB.getRepository(Wallet);

      const userId = req.auth?.id;

      if (!userId) {
        return ReturnHelper.errorResponse(res, 401, 401, "Unauthorized");
      }

      const isExisting = await walletRepository.findOne({
        where: { name: value.name, type: value.type, user_id: userId },
      });

      if (isExisting) {
        return ReturnHelper.errorResponse(
          res,
          400,
          400,
          "Wallet already exists",
        );
      }

      if (error) {
        return ReturnHelper.errorResponse(res, 400, 400, error.message);
      }

      const newWallet = walletRepository.create({
        name: value.name,
        type: value.type,
        initial_balance: value.initial_balance,
        balance: value.balance ? value.balance : value.initial_balance,
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

  static async getWallet(req: Request, res: Response) {
    /* 
      #swagger.tags = ['Wallet']
      #swagger.security = [{"bearerAuth": []}]
      #swagger.parameters['user_id'] = { in: 'query', type: 'integer', required: false, description: 'User ID' }
    */
    try {
      const walletRepository = OrmHelper.DB.getRepository(Wallet);
      const userId = req.query.user_id ? Number(req.query.user_id) : null;

      // Ambil kategori global (user_id IS NULL) dan private milik user
      const query = walletRepository.createQueryBuilder("wallet");

      if (userId != null) {
        query
          .where("wallet.user_id IS NULL")
          .orWhere("wallet.user_id = :userId", { userId });
      }

      const wallets = await query.getMany();

      if (userId != null) {
        const total_balance_wallet = wallets.reduce(
          (sum, w) => sum + Number(w.balance),
          0,
        );
        return ReturnHelper.successResponseAny(
          res,
          200,
          "Wallets fetched successfully",
          { wallets, total_balance_wallet },
        );
      }

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

  static async update(req: Request, res: Response) {
    /* 
      #swagger.tags = ['Wallet']
      #swagger.security = [{"bearerAuth": []}]
      #swagger.parameters['id'] = { description: 'Wallet ID', type: 'integer' }
      #swagger.requestBody = {
          required: true,
          content: {
              "application/json": {
                  schema: { $ref: "#/components/schemas/UpdateWalletRequest" }  
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
        balance: Joi.number().required(),
      });

      const { error, value } = schema.validate(req.body);

      const walletRepository = OrmHelper.DB.getRepository(Wallet);

      const userId = req.auth?.id;
      const walletId = Number(req.params?.id);

      if (!userId) {
        return ReturnHelper.errorResponse(res, 401, 401, "Unauthorized");
      }

      const wallet = await walletRepository.findOne({
        where: { user_id: userId, id: walletId },
      });

      if (!wallet) {
        return ReturnHelper.errorResponse(res, 400, 400, "Wallet Not Found.");
      }

      if (error) {
        return ReturnHelper.errorResponse(res, 400, 400, error.message);
      }

      wallet.name = value.wallet;
      wallet.type = value.type;
      wallet.initial_balance = value.initial_balance;
      wallet.balance = value.balance;

      const savedWallet = await walletRepository.save(wallet);
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

  static async delete(req: Request, res: Response) {
    /* 
        #swagger.tags = ['Wallet']
        #swagger.summary = 'Delete Wallet'
        #swagger.security = [{"bearerAuth": []}]
        #swagger.parameters['id'] = { description: 'Wallet ID', type: 'integer' }
      */
    try {
      const walletRepository = OrmHelper.DB.getRepository(Wallet);
      const walletId = Number(req.params.id);
      const userId = req.auth?.id;

      const wallet = await walletRepository.findOne({
        where: { id: walletId, user_id: userId },
      });

      if (!wallet) {
        return ReturnHelper.errorResponse(res, 404, 404, "wallet not found");
      }

      if (wallet.user_id !== userId) {
        return ReturnHelper.errorResponse(
          res,
          403,
          403,
          "Cannot delete global wallet or other user's wallet",
        );
      }

      await walletRepository.softRemove(wallet);
      return ReturnHelper.successResponseAny(
        res,
        200,
        "Wallet deleted successfully",
      );
    } catch (err: unknown) {
      return ReturnHelper.errorResponse(res, 500, 500, (err as Error).message);
    }
  }

  static async transferBalance(req: Request, res: Response) {
    /* 
        #swagger.tags = ['Wallet']
        #swagger.security = [{"bearerAuth": []}]
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: "#/components/schemas/CreateTransferBalance" }  
                }
            }
        }
      */
    try {
      const userId = req?.auth.id;

      if (!userId) {
        return ReturnHelper.errorResponse(res, 401, 401, "Unauthorized");
      }

      const schema = Joi.object({
        from_wallet_id: Joi.number().required(),
        to_wallet_id: Joi.number().required(),
        amount: Joi.number().required(),
        transfer_date: Joi.string().required(),
        description: Joi.string().optional(),
      });

      const { error, value } = schema.validate(req.body);

      const {
        from_wallet_id,
        to_wallet_id,
        amount,
        transfer_date,
        description,
      } = value;

      if (error) {
        return ReturnHelper.errorResponse(res, 400, 400, error.message);
      }

      if (from_wallet_id === to_wallet_id) {
        return ReturnHelper.errorResponse(
          res,
          400,
          400,
          "Source and Destination Wallet must be different.",
        );
      }

      return await OrmHelper.DB.transaction(async (manager) => {
        const walletRepository = manager.getRepository(Wallet);
        const transferRepository = manager.getRepository(Transfer);

        const fromWallet = await walletRepository
          .createQueryBuilder("wallet")
          .setLock("pessimistic_write")
          .where("wallet.id = :id", { id: from_wallet_id })
          .andWhere("wallet.user_id = :user_id", { user_id: userId })
          .getOne();

        if (!fromWallet) {
          return ReturnHelper.errorResponse(
            res,
            404,
            404,
            "From wallet not found",
          );
        }

        const toWallet = await walletRepository
          .createQueryBuilder("wallet")
          .setLock("pessimistic_write")
          .where("wallet.id = :id", { id: to_wallet_id })
          .andWhere("wallet.user_id = :user_id", { user_id: userId })
          .getOne();

        if (!toWallet) {
          return ReturnHelper.errorResponse(
            res,
            404,
            404,
            "To wallet not found",
          );
        }

        if (Number(fromWallet.balance) < amount) {
          return ReturnHelper.errorResponse(
            res,
            400,
            400,
            "Insufficient wallet balance",
          );
        }

        fromWallet.balance = Number(fromWallet.balance) - amount;
        toWallet.balance = Number(toWallet.balance) + amount;

        await walletRepository.save([fromWallet, toWallet]);

        const newTransfer = transferRepository.create({
          user_id: userId,
          from_wallet_id,
          to_wallet_id,
          amount,
          transfer_date,
          description,
        });

        const savedTransfer = await transferRepository.save(newTransfer);

        return ReturnHelper.successResponseAny(
          res,
          200,
          "Transfer created successfully",
          savedTransfer,
        );
      });
    } catch (error) {
      return ReturnHelper.errorResponse(res, 500, 500, error.message);
    }
  }
}
