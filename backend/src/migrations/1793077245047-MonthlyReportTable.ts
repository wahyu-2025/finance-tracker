import { MigrationInterface, QueryRunner } from "typeorm";

export class MonthlyReportTable1793077245047 implements MigrationInterface {
    name = 'MonthlyReportTable1793077245047'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`monthly_report\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NOT NULL, \`year\` int NOT NULL, \`month\` int NOT NULL, \`month_name\` varchar(50) NOT NULL, \`start_date\` date NOT NULL, \`end_date\` date NOT NULL, \`total_income\` decimal(15,2) NOT NULL DEFAULT '0.00', \`total_expense\` decimal(15,2) NOT NULL DEFAULT '0.00', \`net_savings\` decimal(15,2) NOT NULL DEFAULT '0.00', \`total_transactions\` int NOT NULL DEFAULT '0', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, UNIQUE INDEX \`IDX_0d2a9794995e5aaab393adccf4\` (\`user_id\`, \`year\`, \`month\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`monthly_report\` ADD CONSTRAINT \`FK_bb688bbaf05065b39b1822c82c1\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`monthly_report\` DROP FOREIGN KEY \`FK_bb688bbaf05065b39b1822c82c1\``);
        await queryRunner.query(`DROP INDEX \`IDX_0d2a9794995e5aaab393adccf4\` ON \`monthly_report\``);
        await queryRunner.query(`DROP TABLE \`monthly_report\``);
    }

}
