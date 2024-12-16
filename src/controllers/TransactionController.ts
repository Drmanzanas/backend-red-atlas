import { Request, Response } from 'express';
import { Transaction } from '../entities/Transaction';
import { Property } from '../entities/Property';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateTransactionDto, UpdateTransactionDto } from '../dto/ClassTransactionDto';
import { AppDataSource } from '../database/data-source';
import { SelectQueryBuilder } from 'typeorm';

export class TransactionController {
    static create = async (req: Request, res: Response) => {
        try {
            const transactionsData = Array.isArray(req.body) ? req.body : [req.body];
    
            const savedTransactions = [];
            const errorsArray = [];
            const transactionsToSave = [];
    
            for (const transactionData of transactionsData) {
                const createDto = plainToClass(CreateTransactionDto, transactionData);
                const errors = await validate(createDto, { whitelist: true, forbidNonWhitelisted: true });
    
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
    
                const property = await AppDataSource.getRepository(Property).findOneBy({ id: createDto.property_id });
                if (!property) {
                    errorsArray.push({
                        transactionData,
                        errors: [{ message: `Propiedad con ID ${createDto.property_id} no encontrada.` }],
                    });
                    continue;
                }
    
                transactionsToSave.push(
                    AppDataSource.getRepository(Transaction).create({
                        address: createDto.address,
                        type: createDto.type,
                        date: createDto.date,
                        price: createDto.price,
                        property,
                    })
                );
            }
    
            if (transactionsToSave.length > 0) {
                const saved = await AppDataSource.getRepository(Transaction).save(transactionsToSave);
                savedTransactions.push(...saved);
            }
    
            if (errorsArray.length > 0) {
                res.status(207).json({
                    message: 'Algunas transacciones no pudieron ser creadas.',
                    successful: savedTransactions,
                    errors: errorsArray,
                });
            } else {
                res.status(201).json({
                    message: 'Todas las transacciones fueron creadas exitosamente.',
                    transactions: savedTransactions,
                });
            }
        } catch (error) {
            console.error('Error al crear transacciones:', error);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    };
    
    static getAll = async (req: Request, res: Response) => {
        try {
            const transactionRepository = AppDataSource.getRepository(Transaction);
            const {
                type,
                minPrice,
                maxPrice,
                startDate,
                endDate,
                orderBy = 'id',
                order = 'ASC',
                page = '1',
                limit = '10',
            } = req.query;

            const pageNumber = parseInt(page as string, 10) || 1;
            const pageSize = parseInt(limit as string, 10) || 10;
            const skip = (pageNumber - 1) * pageSize;

            const qb: SelectQueryBuilder<Transaction> = transactionRepository.createQueryBuilder('transaction')
                .leftJoinAndSelect('transaction.property', 'property');

            if (type) {
                qb.andWhere('transaction.type = :type', { type });
            }

            if (minPrice) {
                qb.andWhere('transaction.price >= :minPrice', { minPrice: parseFloat(minPrice as string) });
            }

            if (maxPrice) {
                qb.andWhere('transaction.price <= :maxPrice', { maxPrice: parseFloat(maxPrice as string) });
            }

            if (startDate) {
                qb.andWhere('transaction.date >= :startDate', { startDate: new Date(startDate as string) });
            }

            if (endDate) {
                qb.andWhere('transaction.date <= :endDate', { endDate: new Date(endDate as string) });
            }

            const allowedOrderFields = ['id', 'price', 'date', 'type', 'address'];
            const orderByField = allowedOrderFields.includes(orderBy as string) ? orderBy : 'id';
            const orderDirection = order === 'DESC' ? 'DESC' : 'ASC';

            qb.orderBy(`transaction.${orderByField}`, orderDirection as 'ASC' | 'DESC');
            qb.skip(skip).take(pageSize);

            const [transactions, total] = await qb.getManyAndCount();

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
        } catch (error) {
            console.error('Error al obtener las transacciones:', error);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    };

    static getById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const transaction = await AppDataSource.getRepository(Transaction).findOne({
                where: { id },
                relations: ['property'],
            });
            if (!transaction) {
                res.status(404).json({ message: 'Transacción no encontrada.' });
                return;
            }
            res.status(200).json(transaction);
        } catch (error) {
            console.error('Error al obtener la transacción:', error);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    };

    static update = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const updateDto = plainToClass(UpdateTransactionDto, req.body);

            const errors = await validate(updateDto, { whitelist: true, forbidNonWhitelisted: true });
            if (errors.length > 0) {
                const formattedErrors = errors.map(error => ({
                    property: error.property,
                    constraints: error.constraints,
                }));
                res.status(400).json({ errors: formattedErrors });
                return;
            }

            const transaction = await AppDataSource.getRepository(Transaction).findOneBy({ id });
            if (!transaction) {
                res.status(404).json({ message: 'Transacción no encontrada.' });
                return;
            }

            AppDataSource.getRepository(Transaction).merge(transaction, updateDto);

            if (updateDto.property_id) {
                const property = await AppDataSource.getRepository(Property).findOneBy({ id: updateDto.property_id });
                if (!property) {
                    res.status(404).json({ message: 'Propiedad no encontrada.' });
                    return;
                }
                transaction.property = property;
            }

            await AppDataSource.getRepository(Transaction).save(transaction);

            res.status(200).json({ message: 'Transacción actualizada exitosamente.', transaction });
        } catch (error) {
            console.error('Error al actualizar la transacción:', error);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    };

    static delete = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const transaction = await AppDataSource.getRepository(Transaction).findOneBy({ id });
            if (!transaction) {
                res.status(404).json({ message: 'Transacción no encontrada.' });
                return;
            }

            await AppDataSource.getRepository(Transaction).remove(transaction);
            res.status(200).json({ message: 'Transacción eliminada exitosamente.' });
        } catch (error) {
            console.error('Error al eliminar la transacción:', error);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    };
}