"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAreaAndPriceTypeToInt1734307247096 = void 0;
class UpdateAreaAndPriceTypeToInt1734307247096 {
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`
            ALTER TABLE "properties"
            ALTER COLUMN "area" TYPE integer USING "area"::integer
        `);
            yield queryRunner.query(`
            ALTER TABLE "advertisements"
            ALTER COLUMN "price" TYPE integer USING "price"::integer
        `);
            yield queryRunner.query(`
            ALTER TABLE "transactions"
            ALTER COLUMN "price" TYPE integer USING "price"::integer
        `);
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`
            ALTER TABLE "properties"
            ALTER COLUMN "area" TYPE decimal(10, 2) USING "area"::text::decimal
        `);
            yield queryRunner.query(`
            ALTER TABLE "advertisements"
            ALTER COLUMN "price" TYPE decimal(10, 2) USING "price"::text::decimal
        `);
            yield queryRunner.query(`
            ALTER TABLE "transactions"
            ALTER COLUMN "price" TYPE decimal(10, 2) USING "price"::text::decimal
        `);
        });
    }
}
exports.UpdateAreaAndPriceTypeToInt1734307247096 = UpdateAreaAndPriceTypeToInt1734307247096;
