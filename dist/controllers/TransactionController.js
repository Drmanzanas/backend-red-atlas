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
exports.TransactionController = void 0;
const Transaction_1 = require("../entities/Transaction");
const Property_1 = require("../entities/Property");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const ClassTransactionDto_1 = require("../dto/ClassTransactionDto");
const data_source_1 = require("../database/data-source");
class TransactionController {
}
exports.TransactionController = TransactionController;
_a = TransactionController;
TransactionController.create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transactionsData = Array.isArray(req.body) ? req.body : [req.body];
        const savedTransactions = [];
        const errorsArray = [];
        const transactionsToSave = [];
        for (const transactionData of transactionsData) {
            const createDto = (0, class_transformer_1.plainToClass)(ClassTransactionDto_1.CreateTransactionDto, transactionData);
            const errors = yield (0, class_validator_1.validate)(createDto, { whitelist: true, forbidNonWhitelisted: true });
            if (errors.length > 0) {
                errorsArray.push({
                    transactionData,
                    errors: errors.map(error => ({
                        property: error.property,
                        constraints: error.constraints,
                    })),
                });
                continue;
            }
            const property = yield data_source_1.AppDataSource.getRepository(Property_1.Property).findOneBy({ id: createDto.property_id });
            if (!property) {
                errorsArray.push({
                    transactionData,
                    errors: [{ message: `Propiedad con ID ${createDto.property_id} no encontrada.` }],
                });
                continue;
            }
            transactionsToSave.push(data_source_1.AppDataSource.getRepository(Transaction_1.Transaction).create({
                address: createDto.address,
                type: createDto.type,
                date: createDto.date,
                price: createDto.price,
                property,
            }));
        }
        if (transactionsToSave.length > 0) {
            const saved = yield data_source_1.AppDataSource.getRepository(Transaction_1.Transaction).save(transactionsToSave);
            savedTransactions.push(...saved);
        }
        if (errorsArray.length > 0) {
            res.status(207).json({
                message: 'Algunas transacciones no pudieron ser creadas.',
                successful: savedTransactions,
                errors: errorsArray,
            });
        }
        else {
            res.status(201).json({
                message: 'Todas las transacciones fueron creadas exitosamente.',
                transactions: savedTransactions,
            });
        }
    }
    catch (error) {
        console.error('Error al crear transacciones:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});
TransactionController.getAll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transactionRepository = data_source_1.AppDataSource.getRepository(Transaction_1.Transaction);
        const { type, minPrice, maxPrice, startDate, endDate, orderBy = 'id', order = 'ASC', page = '1', limit = '10', } = req.query;
        const pageNumber = parseInt(page, 10) || 1;
        const pageSize = parseInt(limit, 10) || 10;
        const skip = (pageNumber - 1) * pageSize;
        const qb = transactionRepository.createQueryBuilder('transaction')
            .leftJoinAndSelect('transaction.property', 'property');
        if (type) {
            qb.andWhere('transaction.type = :type', { type });
        }
        if (minPrice) {
            qb.andWhere('transaction.price >= :minPrice', { minPrice: parseFloat(minPrice) });
        }
        if (maxPrice) {
            qb.andWhere('transaction.price <= :maxPrice', { maxPrice: parseFloat(maxPrice) });
        }
        if (startDate) {
            qb.andWhere('transaction.date >= :startDate', { startDate: new Date(startDate) });
        }
        if (endDate) {
            qb.andWhere('transaction.date <= :endDate', { endDate: new Date(endDate) });
        }
        const allowedOrderFields = ['id', 'price', 'date', 'type', 'address'];
        const orderByField = allowedOrderFields.includes(orderBy) ? orderBy : 'id';
        const orderDirection = order === 'DESC' ? 'DESC' : 'ASC';
        qb.orderBy(`transaction.${orderByField}`, orderDirection);
        qb.skip(skip).take(pageSize);
        const [transactions, total] = yield qb.getManyAndCount();
        const totalPages = Math.ceil(total / pageSize);
        res.status(200).json({
            data: transactions,
            pagination: {
                total,
                page: pageNumber,
                limit: pageSize,
                totalPages,
            },
        });
    }
    catch (error) {
        console.error('Error al obtener las transacciones:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});
TransactionController.getById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const transaction = yield data_source_1.AppDataSource.getRepository(Transaction_1.Transaction).findOne({
            where: { id },
            relations: ['property'],
        });
        if (!transaction) {
            res.status(404).json({ message: 'Transacción no encontrada.' });
            return;
        }
        res.status(200).json(transaction);
    }
    catch (error) {
        console.error('Error al obtener la transacción:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});
TransactionController.update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updateDto = (0, class_transformer_1.plainToClass)(ClassTransactionDto_1.UpdateTransactionDto, req.body);
        const errors = yield (0, class_validator_1.validate)(updateDto, { whitelist: true, forbidNonWhitelisted: true });
        if (errors.length > 0) {
            const formattedErrors = errors.map(error => ({
                property: error.property,
                constraints: error.constraints,
            }));
            res.status(400).json({ errors: formattedErrors });
            return;
        }
        const transaction = yield data_source_1.AppDataSource.getRepository(Transaction_1.Transaction).findOneBy({ id });
        if (!transaction) {
            res.status(404).json({ message: 'Transacción no encontrada.' });
            return;
        }
        data_source_1.AppDataSource.getRepository(Transaction_1.Transaction).merge(transaction, updateDto);
        if (updateDto.property_id) {
            const property = yield data_source_1.AppDataSource.getRepository(Property_1.Property).findOneBy({ id: updateDto.property_id });
            if (!property) {
                res.status(404).json({ message: 'Propiedad no encontrada.' });
                return;
            }
            transaction.property = property;
        }
        yield data_source_1.AppDataSource.getRepository(Transaction_1.Transaction).save(transaction);
        res.status(200).json({ message: 'Transacción actualizada exitosamente.', transaction });
    }
    catch (error) {
        console.error('Error al actualizar la transacción:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});
TransactionController.delete = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const transaction = yield data_source_1.AppDataSource.getRepository(Transaction_1.Transaction).findOneBy({ id });
        if (!transaction) {
            res.status(404).json({ message: 'Transacción no encontrada.' });
            return;
        }
        yield data_source_1.AppDataSource.getRepository(Transaction_1.Transaction).remove(transaction);
        res.status(200).json({ message: 'Transacción eliminada exitosamente.' });
    }
    catch (error) {
        console.error('Error al eliminar la transacción:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});
