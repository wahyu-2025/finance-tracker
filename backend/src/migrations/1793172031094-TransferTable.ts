import { MigrationInterface, QueryRunner } from "typeorm";

export class TransferTable1793172031094 implements MigrationInterface {
    name = 'TransferTable1793172031094'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`transfer\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NOT NULL, \`from_wallet_id\` int NOT NULL, \`to_wallet_id\` int NOT NULL, \`amount\` int NOT NULL, \`transfer_date\` datetime NOT NULL, \`description\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`transfer\` ADD CONSTRAINT \`FK_4a79110cc3fdc33249603c8d10a\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`transfer\` ADD CONSTRAINT \`FK_743ff4648d04c736bdfebde23c6\` FOREIGN KEY (\`from_wallet_id\`) REFERENCES \`wallet\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`transfer\` ADD CONSTRAINT \`FK_0c82b565b1ebc8bbd471e95b9ca\` FOREIGN KEY (\`to_wallet_id\`) REFERENCES \`wallet\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`transaction\` ADD CONSTRAINT \`FK_08081d10759ec250c557cebd81a\` FOREIGN KEY (\`wallet_id\`) REFERENCES \`wallet\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`monthly_report\` ADD CONSTRAINT \`FK_bb688bbaf05065b39b1822c82c1\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`monthly_report\` DROP FOREIGN KEY \`FK_bb688bbaf05065b39b1822c82c1\``);
        await queryRunner.query(`ALTER TABLE \`transaction\` DROP FOREIGN KEY \`FK_08081d10759ec250c557cebd81a\``);
        await queryRunner.query(`ALTER TABLE \`transfer\` DROP FOREIGN KEY \`FK_0c82b565b1ebc8bbd471e95b9ca\``);
        await queryRunner.query(`ALTER TABLE \`transfer\` DROP FOREIGN KEY \`FK_743ff4648d04c736bdfebde23c6\``);
        await queryRunner.query(`ALTER TABLE \`transfer\` DROP FOREIGN KEY \`FK_4a79110cc3fdc33249603c8d10a\``);
        await queryRunner.query(`DROP TABLE \`transfer\``);
    }

}
