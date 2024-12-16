

import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { Advertisement } from '../entities/Advertisement';
import { Property } from '../entities/Property';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { QueryFailedError, SelectQueryBuilder } from 'typeorm';
import { CreateAdvertisementDto, UpdateAdvertisementDto } from '../dto/ClassAdvertisementDto';

export class AdvertisementController {
    
    static create = async (req: Request, res: Response) => {
        try {
            const data = Array.isArray(req.body) ? req.body : [req.body];
    
            const advertisementsToSave: Advertisement[] = [];
            const errorsArray = [];
            const advertisementRepository = AppDataSource.getRepository(Advertisement);
            const propertyRepository = AppDataSource.getRepository(Property);
    
            for (const item of data) {
                const createDto = plainToClass(CreateAdvertisementDto, item);
                const errors = await validate(createDto, { whitelist: true, forbidNonWhitelisted: true });
    
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
    
                const property = await propertyRepository.findOneBy({ id: createDto.property_id });
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
    
            let savedAdvertisements: Advertisement[] = [];
            if (advertisementsToSave.length > 0) {
                savedAdvertisements = await advertisementRepository.save(advertisementsToSave);
            }
    
            if (errorsArray.length > 0) {
                res.status(207).json({
                    message: 'Algunos advertisements no pudieron ser creados.',
                    successful: savedAdvertisements,
                    errors: errorsArray,
                });
            } else {
                res.status(201).json({
                    message: 'Todos los advertisements fueron creados exitosamente.',
                    advertisements: savedAdvertisements,
                });
            }
        } catch (error) {
            if (error instanceof QueryFailedError) {
                res.status(400).json({ message: 'Error al crear los advertisements.', details: error.message });
                return;
            }
            console.error('Error en create Advertisement:', error);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    };

    static getAll = async (req: Request, res: Response) => {
        try {
            const advertisementRepository = AppDataSource.getRepository(Advertisement);
            const {
                status,
                propertyType,
                minPrice,
                maxPrice,
                sector,
                orderBy = 'id',
                order = 'ASC',
                page = '1',
                limit = '10',
            } = req.query;

            const pageNumber = parseInt(page as string, 10) || 1;
            const pageSize = parseInt(limit as string, 10) || 10;
            const skip = (pageNumber - 1) * pageSize;

            const qb: SelectQueryBuilder<Advertisement> = advertisementRepository.createQueryBuilder('advertisement')
                .leftJoinAndSelect('advertisement.property', 'property');

            if (status) qb.andWhere('advertisement.status = :status', { status });
            if (propertyType) qb.andWhere('advertisement.propertyType = :propertyType', { propertyType });
            if (minPrice) qb.andWhere('advertisement.price >= :minPrice', { minPrice: parseFloat(minPrice as string) });
            if (maxPrice) qb.andWhere('advertisement.price <= :maxPrice', { maxPrice: parseFloat(maxPrice as string) });
            if (sector) qb.andWhere('property.sector = :sector', { sector });

            const allowedOrderFields = ['id', 'price', 'status', 'propertyType'];
            const orderByField = allowedOrderFields.includes(orderBy as string) ? orderBy : 'id';
            const orderDirection = order === 'DESC' ? 'DESC' : 'ASC';

            qb.orderBy(`advertisement.${orderByField}`, orderDirection as 'ASC' | 'DESC');
            qb.skip(skip).take(pageSize);

            const [advertisements, total] = await qb.getManyAndCount();

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
        } catch (error) {
            console.error('Error en getAll Advertisements:', error);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    };

    
    static getById = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const advertisement = await AppDataSource.getRepository(Advertisement).findOne({
                where: { id },
                relations: ['property'],
            });
            if (!advertisement) {
                res.status(404).json({ message: 'Advertisement no encontrada.' });
                return;
            }
            res.status(200).json(advertisement);
        } catch (error) {
            console.error('Error en getById Advertisement:', error);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    };

    
    static update = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const updateDto = plainToClass(UpdateAdvertisementDto, req.body);
            const errors = await validate(updateDto, { whitelist: true, forbidNonWhitelisted: true });
            if (errors.length > 0) {
                const formattedErrors = errors.map(error => ({
                    property: error.property,
                    constraints: error.constraints,
                }));
                res.status(400).json({ errors: formattedErrors });
                return;
            }

            const advertisement = await AppDataSource.getRepository(Advertisement).findOneBy({ id });
            if (!advertisement) {
                res.status(404).json({ message: 'Advertisement no encontrada.' });
                return;
            }

            AppDataSource.getRepository(Advertisement).merge(advertisement, updateDto);
            await AppDataSource.getRepository(Advertisement).save(advertisement);
            res.status(200).json({ message: 'Advertisement actualizado exitosamente.', advertisement });
        } catch (error) {
            if (error instanceof QueryFailedError) {
                res.status(400).json({ message: 'Error al actualizar la advertisement.', details: error.message });
                return;
            }
            console.error('Error en update Advertisement:', error);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    };

    
    static delete = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const advertisement = await AppDataSource.getRepository(Advertisement).findOneBy({ id });
            if (!advertisement) {
                res.status(404).json({ message: 'Advertisement no encontrada.' });
                return;
            }

            await AppDataSource.getRepository(Advertisement).remove(advertisement);
            res.status(200).json({ message: 'Advertisement eliminado exitosamente.' });
        } catch (error) {
            console.error('Error en delete Advertisement:', error);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    };
}