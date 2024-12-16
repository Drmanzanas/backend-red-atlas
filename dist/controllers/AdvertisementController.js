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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvertisementController = void 0;
const data_source_1 = require("../database/data-source");
const Advertisement_1 = require("../entities/Advertisement");
const Property_1 = require("../entities/Property");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const typeorm_1 = require("typeorm");
const ClassAdvertisementDto_1 = require("../dto/ClassAdvertisementDto");
class AdvertisementController {
}
exports.AdvertisementController = AdvertisementController;
_a = AdvertisementController;
AdvertisementController.create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = Array.isArray(req.body) ? req.body : [req.body];
        const advertisementsToSave = [];
        const errorsArray = [];
        const advertisementRepository = data_source_1.AppDataSource.getRepository(Advertisement_1.Advertisement);
        const propertyRepository = data_source_1.AppDataSource.getRepository(Property_1.Property);
        for (const item of data) {
            const createDto = (0, class_transformer_1.plainToClass)(ClassAdvertisementDto_1.CreateAdvertisementDto, item);
            const errors = yield (0, class_validator_1.validate)(createDto, { whitelist: true, forbidNonWhitelisted: true });
            if (errors.length > 0) {
                errorsArray.push({
                    advertisementData: item,
                    errors: errors.map(error => ({
                        property: error.property,
                        constraints: error.constraints,
                    })),
                });
                continue;
            }
            const property = yield propertyRepository.findOneBy({ id: createDto.property_id });
            if (!property) {
                errorsArray.push({
                    advertisementData: item,
                    errors: [{ message: `Propiedad con ID ${createDto.property_id} no encontrada.` }],
                });
                continue;
            }
            const advertisement = advertisementRepository.create({
                price: createDto.price,
                status: createDto.status,
                propertyType: createDto.propertyType,
                property,
            });
            advertisementsToSave.push(advertisement);
        }
        let savedAdvertisements = [];
        if (advertisementsToSave.length > 0) {
            savedAdvertisements = yield advertisementRepository.save(advertisementsToSave);
        }
        if (errorsArray.length > 0) {
            res.status(207).json({
                message: 'Algunos advertisements no pudieron ser creados.',
                successful: savedAdvertisements,
                errors: errorsArray,
            });
        }
        else {
            res.status(201).json({
                message: 'Todos los advertisements fueron creados exitosamente.',
                advertisements: savedAdvertisements,
            });
        }
    }
    catch (error) {
        if (error instanceof typeorm_1.QueryFailedError) {
            res.status(400).json({ message: 'Error al crear los advertisements.', details: error.message });
            return;
        }
        console.error('Error en create Advertisement:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});
AdvertisementController.getAll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const advertisementRepository = data_source_1.AppDataSource.getRepository(Advertisement_1.Advertisement);
        const { status, propertyType, minPrice, maxPrice, sector, orderBy = 'id', order = 'ASC', page = '1', limit = '10', } = req.query;
        const pageNumber = parseInt(page, 10) || 1;
        const pageSize = parseInt(limit, 10) || 10;
        const skip = (pageNumber - 1) * pageSize;
        const qb = advertisementRepository.createQueryBuilder('advertisement')
            .leftJoinAndSelect('advertisement.property', 'property');
        if (status)
            qb.andWhere('advertisement.status = :status', { status });
        if (propertyType)
            qb.andWhere('advertisement.propertyType = :propertyType', { propertyType });
        if (minPrice)
            qb.andWhere('advertisement.price >= :minPrice', { minPrice: parseFloat(minPrice) });
        if (maxPrice)
            qb.andWhere('advertisement.price <= :maxPrice', { maxPrice: parseFloat(maxPrice) });
        if (sector)
            qb.andWhere('property.sector = :sector', { sector });
        const allowedOrderFields = ['id', 'price', 'status', 'propertyType'];
        const orderByField = allowedOrderFields.includes(orderBy) ? orderBy : 'id';
        const orderDirection = order === 'DESC' ? 'DESC' : 'ASC';
        qb.orderBy(`advertisement.${orderByField}`, orderDirection);
        qb.skip(skip).take(pageSize);
        const [advertisements, total] = yield qb.getManyAndCount();
        const totalPages = Math.ceil(total / pageSize);
        res.status(200).json({
            data: advertisements,
            pagination: {
                total,
                page: pageNumber,
                limit: pageSize,
                totalPages,
            },
        });
    }
    catch (error) {
        console.error('Error en getAll Advertisements:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});
AdvertisementController.getById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const advertisement = yield data_source_1.AppDataSource.getRepository(Advertisement_1.Advertisement).findOne({
            where: { id },
            relations: ['property'],
        });
        if (!advertisement) {
            res.status(404).json({ message: 'Advertisement no encontrada.' });
            return;
        }
        res.status(200).json(advertisement);
    }
    catch (error) {
        console.error('Error en getById Advertisement:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});
AdvertisementController.update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const updateDto = (0, class_transformer_1.plainToClass)(ClassAdvertisementDto_1.UpdateAdvertisementDto, req.body);
        const errors = yield (0, class_validator_1.validate)(updateDto, { whitelist: true, forbidNonWhitelisted: true });
        if (errors.length > 0) {
            const formattedErrors = errors.map(error => ({
                property: error.property,
                constraints: error.constraints,
            }));
            res.status(400).json({ errors: formattedErrors });
            return;
        }
        const advertisement = yield data_source_1.AppDataSource.getRepository(Advertisement_1.Advertisement).findOneBy({ id });
        if (!advertisement) {
            res.status(404).json({ message: 'Advertisement no encontrada.' });
            return;
        }
        data_source_1.AppDataSource.getRepository(Advertisement_1.Advertisement).merge(advertisement, updateDto);
        yield data_source_1.AppDataSource.getRepository(Advertisement_1.Advertisement).save(advertisement);
        res.status(200).json({ message: 'Advertisement actualizado exitosamente.', advertisement });
    }
    catch (error) {
        if (error instanceof typeorm_1.QueryFailedError) {
            res.status(400).json({ message: 'Error al actualizar la advertisement.', details: error.message });
            return;
        }
        console.error('Error en update Advertisement:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});
AdvertisementController.delete = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const advertisement = yield data_source_1.AppDataSource.getRepository(Advertisement_1.Advertisement).findOneBy({ id });
        if (!advertisement) {
            res.status(404).json({ message: 'Advertisement no encontrada.' });
            return;
        }
        yield data_source_1.AppDataSource.getRepository(Advertisement_1.Advertisement).remove(advertisement);
        res.status(200).json({ message: 'Advertisement eliminado exitosamente.' });
    }
    catch (error) {
        console.error('Error en delete Advertisement:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});
