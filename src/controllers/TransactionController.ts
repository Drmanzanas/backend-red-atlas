import { Request, Response } from 'express';
import { Transaction } from '../entities/Transaction';
import { Property } from '../entities/Property';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateTransactionDto, UpdateTransactionDto } from '../dto/ClassTransactionDto';
import { AppDataSource } from '../database/data-source';

export class TransactionController {
    static create = async (req: Request, res: Response) => {
        try {
            const transactionsData = Array.isArray(req.body) ? req.body : [req.body];

            const savedTransactions = [];
            const errorsArray = [];

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

                const transaction = AppDataSource.getRepository(Transaction).create({
                    address: createDto.address,
                    type: createDto.type,
                    date: createDto.date,
                    price: createDto.price,
                    property,
                });

                const savedTransaction = await AppDataSource.getRepository(Transaction).save(transaction);
                savedTransactions.push(savedTransaction);
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

    static getAll = async (_req: Request, res: Response) => {
        try {
            const transactions = await AppDataSource.getRepository(Transaction).find({
                relations: ['property'],
            });
            res.status(200).json(transactions);
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