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
exports.UpdateAdvertisementDto = exports.CreateAdvertisementDto = void 0;
const class_validator_1 = require("class-validator");
const Advertisement_1 = require("../enums/Advertisement");
const Properties_1 = require("../enums/Properties");
class CreateAdvertisementDto {
}
exports.CreateAdvertisementDto = CreateAdvertisementDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'El precio es obligatorio.' }),
    __metadata("design:type", Number)
], CreateAdvertisementDto.prototype, "price", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(Advertisement_1.AdvertisementStatus, { message: 'El estado debe ser "for_sale" o "for_lease".' }),
    __metadata("design:type", String)
], CreateAdvertisementDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(Properties_1.PropertyType, { message: 'El tipo de propiedad es inválido.' }),
    __metadata("design:type", String)
], CreateAdvertisementDto.prototype, "propertyType", void 0);
__decorate([
    (0, class_validator_1.IsUUID)('4', { message: 'El ID de la propiedad debe ser un UUID válido.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El ID de la propiedad es obligatorio.' }),
    __metadata("design:type", String)
], CreateAdvertisementDto.prototype, "property_id", void 0);
class UpdateAdvertisementDto {
}
exports.UpdateAdvertisementDto = UpdateAdvertisementDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateAdvertisementDto.prototype, "price", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Advertisement_1.AdvertisementStatus, { message: 'El estado debe ser "for_sale" o "for_lease".' }),
    __metadata("design:type", String)
], UpdateAdvertisementDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Properties_1.PropertyType, { message: 'El tipo de propiedad es inválido.' }),
    __metadata("design:type", String)
], UpdateAdvertisementDto.prototype, "propertyType", void 0);
