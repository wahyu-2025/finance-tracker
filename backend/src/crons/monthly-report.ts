import cron from "node-cron";
import { MonthlyReportService } from "../services/monthly-report";
import { Logger, ILogObj } from "tslog";

const log: Logger<ILogObj> = new Logger({
  name: "[MonthlyReportCron]",
  type: "pretty",
});

export class MonthlyReportCron {
  static init() {
    // Schedule: Jalan setiap tanggal 1 setiap bulan pukul 00:05 WIB
    cron.schedule(
      "5 0 1 * *",
      async () => {
        log.info(
          "Cron triggered: Generating Monthly Reports for Year-To-Date...",
        );
        await MonthlyReportService.generateYearToDate();
      },
      { timezone: "Asia/Jakarta" },
    );

    log.info(
      "Monthly report cron scheduled (at 00:05 on day 1 of every month)",
    );

    // Jalankan juga 5 detik setelah startup agar saat server restart, laporan Jan - bulan berjalan langsung ter-generate
    setTimeout(async () => {
      try {
        log.info(
          "Startup check: Ensuring Year-To-Date monthly reports exist...",
        );
        await MonthlyReportService.generateYearToDate();
      } catch (err) {
        log.error("Startup check for monthly report failed:", err);
      }
    }, 5000);
  }
}
