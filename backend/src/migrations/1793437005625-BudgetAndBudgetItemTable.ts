import { MigrationInterface, QueryRunner } from "typeorm";

export class BudgetAndBudgetItemTable1793437005625 implements MigrationInterface {
    name = 'BudgetAndBudgetItemTable1793437005625'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`budget\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NOT NULL, \`name\` varchar(255) NOT NULL, \`start_date\` date NOT NULL, \`end_date\` date NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`budget_item\` (\`id\` int NOT NULL AUTO_INCREMENT, \`budget_id\` int NOT NULL, \`category_id\` int NOT NULL, \`amount\` decimal(15,2) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`budget\` ADD CONSTRAINT \`FK_68df09bd8001a1fb0667a9b42f7\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`budget_item\` ADD CONSTRAINT \`FK_6eedbc72da8315f4fd4e0c2f6f8\` FOREIGN KEY (\`budget_id\`) REFERENCES \`budget\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`budget_item\` ADD CONSTRAINT \`FK_c8adb87cf845dec6901f8da2468\` FOREIGN KEY (\`category_id\`) REFERENCES \`category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`budget_item\` DROP FOREIGN KEY \`FK_c8adb87cf845dec6901f8da2468\``);
        await queryRunner.query(`ALTER TABLE \`budget_item\` DROP FOREIGN KEY \`FK_6eedbc72da8315f4fd4e0c2f6f8\``);
        await queryRunner.query(`ALTER TABLE \`budget\` DROP FOREIGN KEY \`FK_68df09bd8001a1fb0667a9b42f7\``);
        await queryRunner.query(`DROP TABLE \`budget_item\``);
        await queryRunner.query(`DROP TABLE \`budget\``);
    }

}
