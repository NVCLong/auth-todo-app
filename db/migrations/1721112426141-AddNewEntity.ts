import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewEntity1721112426141 implements MigrationInterface {
    name = 'AddNewEntity1721112426141'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`photo\` (\`id\` int NOT NULL AUTO_INCREMENT, \`url\` varchar(255) NOT NULL, \`todoId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`todo\` DROP FOREIGN KEY \`FK_1e982e43f63a98ad9918a86035c\``);
        await queryRunner.query(`ALTER TABLE \`todo\` CHANGE \`userId\` \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`photo\` ADD CONSTRAINT \`FK_cd03300bd950975cef1ce1e9f84\` FOREIGN KEY (\`todoId\`) REFERENCES \`todo\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`todo\` ADD CONSTRAINT \`FK_1e982e43f63a98ad9918a86035c\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`todo\` DROP FOREIGN KEY \`FK_1e982e43f63a98ad9918a86035c\``);
        await queryRunner.query(`ALTER TABLE \`photo\` DROP FOREIGN KEY \`FK_cd03300bd950975cef1ce1e9f84\``);
        await queryRunner.query(`ALTER TABLE \`todo\` CHANGE \`userId\` \`userId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`todo\` ADD CONSTRAINT \`FK_1e982e43f63a98ad9918a86035c\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`DROP TABLE \`photo\``);
    }

}
