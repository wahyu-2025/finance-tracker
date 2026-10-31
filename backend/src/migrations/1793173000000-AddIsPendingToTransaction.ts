import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsPendingToTransaction1793173000000 implements MigrationInterface {
    name = 'AddIsPendingToTransaction1793173000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            "ALTER TABLE `transaction` ADD `is_pending` enum ('Y', 'N') NOT NULL DEFAULT 'N' AFTER `transaction_date`"
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            "ALTER TABLE `transaction` DROP COLUMN `is_pending`"
        );
    }
}
