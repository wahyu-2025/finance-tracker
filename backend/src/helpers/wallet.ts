import { EntityManager } from "typeorm";
import { Wallet } from "../entities/wallet";
import { CategoryType } from "../types/types";

export class WalletHelper {
  /**
   * Mengubah saldo wallet berdasarkan tipe transaksi (EXPENSE / INCOME)
   * @param manager EntityManager TypeORM (dari OrmHelper.DB.transaction)
   * @param walletId ID Wallet
   * @param userId ID User pemilik wallet (untuk verifikasi kepemilikan)
   * @param type CategoryType (EXPENSE | INCOME)
   * @param amount Nominal transaksi
   * @param action 'APPLY' untuk mutasi biasa, 'REVERT' untuk membatalkan/mengembalikan saldo
   */
  static async adjustBalance({
    manager,
    walletId,
    userId,
    type,
    amount,
    action = "APPLY",
  }: {
    manager: EntityManager;
    walletId: number;
    userId: number;
    type: CategoryType;
    amount: number;
    action?: "APPLY" | "REVERT";
  }): Promise<{ wallet?: Wallet; error?: string }> {
    const walletRepository = manager.getRepository(Wallet);

    const wallet = await walletRepository.findOne({
      where: { id: walletId },
    });

    if (!wallet || wallet.user_id !== userId) {
      return { error: "Invalid wallet" };
    }

    const currentBalance = Number(wallet.balance);
    const numericAmount = Number(amount);

    // Menentukan apakah saldo dikurangi:
    // APPLY + EXPENSE => berkurang
    // APPLY + INCOME  => bertambah
    // REVERT + EXPENSE => bertambah (kembalikan uang belanja)
    // REVERT + INCOME  => berkurang (batalkan uang masuk)
    const isDeducting =
      (action === "APPLY" && type === CategoryType.EXPENSE) ||
      (action === "REVERT" && type === CategoryType.INCOME);

    if (isDeducting && currentBalance < numericAmount) {
      return { error: "Insufficient balance" };
    }

    if (isDeducting) {
      wallet.balance = currentBalance - numericAmount;
    } else {
      wallet.balance = currentBalance + numericAmount;
    }

    const savedWallet = await walletRepository.save(wallet);
    return { wallet: savedWallet };
  }
}
