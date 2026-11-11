import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNameToBudgetItem1793440000000 implements MigrationInterface {
  name = "AddNameToBudgetItem1793440000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `budget_item` ADD `name` varchar(255) NOT NULL AFTER `budget_id`",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE `budget_item` DROP COLUMN `name`");
  }
}
