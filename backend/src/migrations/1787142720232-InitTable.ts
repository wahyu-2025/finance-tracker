import { MigrationInterface, QueryRunner } from "typeorm";

export class InitTable1787142720232 implements MigrationInterface {
    name = 'InitTable1787142720232'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`category\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NULL, \`name\` varchar(255) NOT NULL, \`type\` enum ('INCOME', 'EXPENSE') NOT NULL DEFAULT 'EXPENSE', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`transaction\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NOT NULL, \`category_id\` int NOT NULL, \`type\` enum ('INCOME', 'EXPENSE') NOT NULL, \`amount\` decimal(15,2) NOT NULL, \`transaction_date\` date NOT NULL, \`description\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`category\` ADD CONSTRAINT \`FK_6562e564389d0600e6e243d9604\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`transaction\` ADD CONSTRAINT \`FK_b4a3d92d5dde30f3ab5c34c5862\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`transaction\` ADD CONSTRAINT \`FK_abbe63b71ee4193f61c322ab497\` FOREIGN KEY (\`category_id\`) REFERENCES \`category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transaction\` DROP FOREIGN KEY \`FK_abbe63b71ee4193f61c322ab497\``);
        await queryRunner.query(`ALTER TABLE \`transaction\` DROP FOREIGN KEY \`FK_b4a3d92d5dde30f3ab5c34c5862\``);
        await queryRunner.query(`ALTER TABLE \`category\` DROP FOREIGN KEY \`FK_6562e564389d0600e6e243d9604\``);
        await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP TABLE \`transaction\``);
        await queryRunner.query(`DROP TABLE \`category\``);
    }

}
