import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexesForOptimizedQueries1734307247097 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX idx_properties_sector ON properties(sector)`);
        await queryRunner.query(`CREATE INDEX idx_properties_area ON properties(area)`);
        await queryRunner.query(`CREATE INDEX idx_advertisements_property_id ON advertisements(property_id)`);
        await queryRunner.query(`CREATE INDEX idx_advertisements_price ON advertisements(price)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX idx_properties_sector`);
        await queryRunner.query(`DROP INDEX idx_properties_area`);
        await queryRunner.query(`DROP INDEX idx_advertisements_property_id`);
        await queryRunner.query(`DROP INDEX idx_advertisements_price`);
    }
}