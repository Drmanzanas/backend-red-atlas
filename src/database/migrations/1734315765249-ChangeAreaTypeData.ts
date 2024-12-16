import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateAreaAndPriceTypeToInt1734307247096 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "properties"
            ALTER COLUMN "area" TYPE integer USING "area"::integer
        `);

        await queryRunner.query(`
            ALTER TABLE "advertisements"
            ALTER COLUMN "price" TYPE integer USING "price"::integer
        `);

        await queryRunner.query(`
            ALTER TABLE "transactions"
            ALTER COLUMN "price" TYPE integer USING "price"::integer
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "properties"
            ALTER COLUMN "area" TYPE decimal(10, 2) USING "area"::text::decimal
        `);

        await queryRunner.query(`
            ALTER TABLE "advertisements"
            ALTER COLUMN "price" TYPE decimal(10, 2) USING "price"::text::decimal
        `);

        await queryRunner.query(`
            ALTER TABLE "transactions"
            ALTER COLUMN "price" TYPE decimal(10, 2) USING "price"::text::decimal
        `);
    }
}