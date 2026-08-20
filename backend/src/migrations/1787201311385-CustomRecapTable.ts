import { MigrationInterface, QueryRunner } from "typeorm";

export class CustomRecapTable1787201311385 implements MigrationInterface {
    name = 'CustomRecapTable1787201311385'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`custom_recap\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NOT NULL, \`name\` varchar(255) NOT NULL, \`start_date\` date NOT NULL, \`end_date\` date NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`custom_recap\` ADD CONSTRAINT \`FK_dcd6d1fbe39ebf6f5e5ca89be2a\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`custom_recap\` DROP FOREIGN KEY \`FK_dcd6d1fbe39ebf6f5e5ca89be2a\``);
        await queryRunner.query(`DROP TABLE \`custom_recap\``);
    }

}
