import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAllEntities1734213734997 implements MigrationInterface {
    name = 'AddAllEntities1734213734997'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."advertisements_status_enum" AS ENUM('for_sale', 'for_lease')`);
        await queryRunner.query(`CREATE TYPE "public"."advertisements_property_type_enum" AS ENUM('apartment', 'house', 'retail', 'land', 'industrial')`);
        await queryRunner.query(`CREATE TABLE "advertisements" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "price" numeric(10,2) NOT NULL, "status" "public"."advertisements_status_enum" NOT NULL, "property_type" "public"."advertisements_property_type_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "property_id" uuid, CONSTRAINT "PK_4818a08332624787e5b2bf82302" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."properties_sector_enum" AS ENUM('residential', 'commercial', 'industrial', 'agricultural')`);
        await queryRunner.query(`CREATE TABLE "properties" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "address" character varying NOT NULL, "area" numeric(10,2) NOT NULL, "owner_name" character varying NOT NULL, "sector" "public"."properties_sector_enum" NOT NULL, CONSTRAINT "PK_2d83bfa0b9fcd45dee1785af44d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."transactions_type_enum" AS ENUM('sale_purchase', 'lease', 'mortgage', 'judicial_sale', 'other')`);
        await queryRunner.query(`CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "address" character varying NOT NULL, "type" "public"."transactions_type_enum" NOT NULL, "date" date NOT NULL, "price" numeric(10,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "property_id" uuid, CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "advertisements" ADD CONSTRAINT "FK_f707d86f4f1a2ac9a2afe515cb2" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_a8f616508eb6137c4ed3f26c939" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_a8f616508eb6137c4ed3f26c939"`);
        await queryRunner.query(`ALTER TABLE "advertisements" DROP CONSTRAINT "FK_f707d86f4f1a2ac9a2afe515cb2"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_type_enum"`);
        await queryRunner.query(`DROP TABLE "properties"`);
        await queryRunner.query(`DROP TYPE "public"."properties_sector_enum"`);
        await queryRunner.query(`DROP TABLE "advertisements"`);
        await queryRunner.query(`DROP TYPE "public"."advertisements_property_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."advertisements_status_enum"`);
    }

}
