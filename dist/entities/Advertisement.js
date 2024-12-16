"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Advertisement = void 0;
const typeorm_1 = require("typeorm");
const Property_1 = require("./Property");
const Advertisement_1 = require("../enums/Advertisement");
const Properties_1 = require("../enums/Properties");
let Advertisement = class Advertisement {
};
exports.Advertisement = Advertisement;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Advertisement.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], Advertisement.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: Advertisement_1.AdvertisementStatus,
    }),
    __metadata("design:type", String)
], Advertisement.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: Properties_1.PropertyType,
    }),
    __metadata("design:type", String)
], Advertisement.prototype, "propertyType", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Property_1.Property, (property) => property.advertisements, { onDelete: 'CASCADE' }),
    __metadata("design:type", Property_1.Property)
], Advertisement.prototype, "property", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Advertisement.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Advertisement.prototype, "updatedAt", void 0);
exports.Advertisement = Advertisement = __decorate([
    (0, typeorm_1.Entity)('advertisements')
], Advertisement);
