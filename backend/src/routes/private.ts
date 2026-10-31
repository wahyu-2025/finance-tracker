import express from "express";
import { Language } from "../langs/lang";
import JwtHelper from "../helpers/jwt";
import guardPre from "express-jwt-permissions";
import { AuthController } from "../controllers/auth";
import { CategoryController } from "../controllers/category";
import { TransactionController } from "../controllers/transaction";
import { CustomRecapController } from "../controllers/custom-recap";
import { WalletController } from "../controllers/wallet";
import { MonthlyReportController } from "../controllers/monthly-report";
import { BudgetsController } from "../controllers/budgets";
import { BudgetItemsController } from "../controllers/budget-items";

const guard = guardPre({
  requestProperty: "auth",
  permissionsProperty: "data.type",
});

export class RoutePrivate {
  static setup(app: express.Application) {
    app.use(Language.apply);

    JwtHelper.secure(app);

    app.post("/api/auth/profile", AuthController.getProfile);
    app.post("/api/auth/update-profile", AuthController.updateProfile);

    // Category Routes
    app.post("/api/category/add", CategoryController.create);
    app.get("/api/category/get-all", CategoryController.getAll);
    app.put("/api/category/update/:id", CategoryController.update);
    app.delete("/api/category/delete/:id", CategoryController.delete);

    // Transaction Routes
    app.post("/api/transaction/add", TransactionController.create);
    app.put("/api/transaction/update/:id", TransactionController.update);
    app.put("/api/transaction/confirm/:id", TransactionController.confirm);
    app.delete("/api/transaction/delete/:id", TransactionController.delete);
    app.get("/api/transaction/history", TransactionController.getHistory);

    // Custom Recap Routes
    app.post("/api/custom-recap/add", CustomRecapController.create);
    app.get("/api/custom-recap/get-all", CustomRecapController.getAll);
    app.get("/api/custom-recap/getById/:id", CustomRecapController.getOne);
    app.put("/api/custom-recap/update/:id", CustomRecapController.update);
    app.delete("/api/custom-recap/delete/:id", CustomRecapController.delete);

    // Wallet Routes
    app.post("/api/wallet/add", WalletController.create);
    app.get("/api/wallet/get", WalletController.getWallet);
    app.post("/api/wallet/transfer-balance", WalletController.transferBalance);

    // Budget Routes
    app.post("/api/budget/add", BudgetsController.create);
    app.put("/api/budget/update/:id", BudgetsController.update);
    app.delete("/api/budget/delete/:id", BudgetsController.delete);

    // Budget Item Routes
    app.post(
      "/api/budget-items/add/budgetId/:budget_id",
      BudgetItemsController.create,
    );
    app.put(
      "/api/budget-items/update/budgetId/:budget_id/budgetItemId/:id",
      BudgetItemsController.update,
    );
    app.delete(
      "/api/budget-items/delete/budgetId/:budget_id/budgetItemId/:id",
      BudgetItemsController.delete,
    );

    // Monthly Report Routes
    app.get("/api/monthly-reports/get-all", MonthlyReportController.getAll);
    app.get("/api/monthly-reports/sync", MonthlyReportController.sync);
    // app.get("/api/monthly-reports/:id", MonthlyReportController.getById);
  }
}
