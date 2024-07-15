import { MigrationInterface, QueryRunner } from "typeorm";

export class ADDTITLE1720504465809 implements MigrationInterface {
    name = 'ADDTITLE1720504465809'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`FK_1e982e43f63a98ad9918a86035c\` ON \`todo\``);
        await queryRunner.query(`ALTER TABLE \`todo\` ADD \`title\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`todo\` CHANGE \`userId\` \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`todo\` ADD CONSTRAINT \`FK_1e982e43f63a98ad9918a86035c\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`todo\` DROP FOREIGN KEY \`FK_1e982e43f63a98ad9918a86035c\``);
        await queryRunner.query(`ALTER TABLE \`todo\` CHANGE \`userId\` \`userId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`todo\` DROP COLUMN \`title\``);
        await queryRunner.query(`CREATE INDEX \`FK_1e982e43f63a98ad9918a86035c\` ON \`todo\` (\`userId\`)`);
    }

}
