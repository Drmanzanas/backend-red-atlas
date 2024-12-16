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
exports.PropertyController = void 0;
const data_source_1 = require("../database/data-source");
const Property_1 = require("../entities/Property");
class PropertyController {
}
exports.PropertyController = PropertyController;
_a = PropertyController;
PropertyController.getAll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const propertyRepository = data_source_1.AppDataSource.getRepository(Property_1.Property);
        const { sector, propertyType, status, minArea, maxArea, orderBy = 'id', order = 'ASC', page = '1', limit = '10', } = req.query;
        const pageNumber = parseInt(page, 10) || 1;
        const pageSize = parseInt(limit, 10) || 10;
        const skip = (pageNumber - 1) * pageSize;
        const qb = propertyRepository.createQueryBuilder('property')
            .leftJoinAndSelect('property.advertisements', 'advertisement')
            .leftJoinAndSelect('property.transactions', 'transaction');
        if (sector)
            qb.andWhere('property.sector = :sector', { sector });
        if (propertyType)
            qb.andWhere('advertisement.propertyType = :propertyType', { propertyType });
        if (status)
            qb.andWhere('advertisement.status = :status', { status });
        if (minArea)
            qb.andWhere('property.area >= :minArea', { minArea: parseFloat(minArea) });
        if (maxArea)
            qb.andWhere('property.area <= :maxArea', { maxArea: parseFloat(maxArea) });
        qb.addSelect(`
                property.area * (
                    SELECT AVG(ad.price / p.area)
                    FROM advertisements ad
                    JOIN properties p ON ad.property_id = p.id
                    WHERE p.sector = property.sector
                )
            `, 'valuation');
        const allowedOrderFields = ['id', 'address', 'area', 'ownerName', 'sector', 'valuation'];
        const orderByField = allowedOrderFields.includes(orderBy) ? orderBy : 'id';
        const orderDirection = (order === 'DESC') ? 'DESC' : 'ASC';
        qb.orderBy(`property.${orderByField}`, orderDirection);
        qb.skip(skip).take(pageSize);
        const [properties, total] = yield qb.getManyAndCount();
        const totalPages = Math.ceil(total / pageSize);
        res.json({
            data: properties,
            pagination: {
                total,
                page: pageNumber,
                limit: pageSize,
                totalPages,
            },
        });
    }
    catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
PropertyController.getAllWithValuations = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const propertyRepository = data_source_1.AppDataSource.getRepository(Property_1.Property);
        const properties = yield propertyRepository.find({
            relations: ['advertisements'],
        });
        const sectorAveragePricePerM2 = {};
        const sectorGroups = properties.reduce((groups, property) => {
            if (!groups[property.sector]) {
                groups[property.sector] = [];
            }
            groups[property.sector].push(property);
            return groups;
        }, {});
        for (const sector in sectorGroups) {
            const propertiesInSector = sectorGroups[sector];
            const pricesPerM2 = propertiesInSector
                .filter(property => property.area > 0 && property.advertisements.length > 0)
                .map(property => {
                const totalAdvertisementPrice = property.advertisements.reduce((sum, ad) => sum + ad.price, 0);
                return totalAdvertisementPrice / property.area;
            });
            const averagePricePerM2 = pricesPerM2.reduce((sum, price) => sum + price, 0) / pricesPerM2.length;
            sectorAveragePricePerM2[sector] = averagePricePerM2 || 0;
        }
        const propertiesWithValuation = properties.map(property => {
            const averagePricePerM2 = sectorAveragePricePerM2[property.sector] || 0;
            const valuation = property.area * averagePricePerM2;
            return Object.assign(Object.assign({}, property), { valuation: valuation.toFixed(2) });
        });
        res.status(200).json(propertiesWithValuation);
    }
    catch (error) {
        console.error('Error calculating valuations:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
PropertyController.getById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const propertyRepository = data_source_1.AppDataSource.getRepository(Property_1.Property);
        const { id } = req.params;
        const property = yield propertyRepository.findOne({
            where: { id },
            relations: ['advertisements', 'transactions'],
        });
        if (!property) {
            res.status(404).json({ message: 'Property not found.' });
            return;
        }
        res.json(property);
    }
    catch (error) {
        console.error('Error fetching property:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
PropertyController.update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const propertyRepository = data_source_1.AppDataSource.getRepository(Property_1.Property);
        const { id } = req.params;
        const { address, area, ownerName, sector } = req.body;
        const property = yield propertyRepository.findOneBy({ id });
        if (!property) {
            res.status(404).json({ message: 'Property not found.' });
            return;
        }
        propertyRepository.merge(property, {
            address,
            area,
            ownerName,
            sector,
        });
        const updatedProperty = yield propertyRepository.save(property);
        res.json(updatedProperty);
    }
    catch (error) {
        console.error('Error updating property:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
PropertyController.delete = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const propertyRepository = data_source_1.AppDataSource.getRepository(Property_1.Property);
        const { id } = req.params;
        const property = yield propertyRepository.findOneBy({ id });
        if (!property) {
            res.status(404).json({ message: 'Property not found.' });
            return;
        }
        yield propertyRepository.remove(property);
        res.json({ message: 'Property deleted successfully.' });
    }
    catch (error) {
        console.error('Error deleting property:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
PropertyController.create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const propertyRepository = data_source_1.AppDataSource.getRepository(Property_1.Property);
        const data = Array.isArray(req.body) ? req.body : [req.body];
        const propertiesToSave = [];
        const errorsArray = [];
        for (const property of data) {
            const { address, area, ownerName, sector } = property;
            if (!address || !area || !ownerName || !sector) {
                errorsArray.push({
                    property,
                    errors: ['Missing required fields: address, area, ownerName, sector.'],
                });
                continue;
            }
            const newProperty = propertyRepository.create({ address, area, ownerName, sector });
            propertiesToSave.push(newProperty);
        }
        let savedProperties = [];
        if (propertiesToSave.length > 0) {
            savedProperties = yield propertyRepository.save(propertiesToSave);
        }
        if (errorsArray.length > 0) {
            res.status(207).json({
                message: 'Algunas propiedades no pudieron ser creadas.',
                successful: savedProperties,
                errors: errorsArray,
            });
        }
        else {
            res.status(201).json({
                message: 'Todas las propiedades fueron creadas exitosamente.',
                properties: savedProperties,
            });
        }
    }
    catch (error) {
        console.error('Error creating properties:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
