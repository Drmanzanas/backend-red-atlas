

import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { Advertisement } from '../entities/Advertisement';
import { Property } from '../entities/Property';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { QueryFailedError } from 'typeorm';
import { CreateAdvertisementDto, UpdateAdvertisementDto } from '../dto/ClassAdvertisementDto';

export class AdvertisementController {
    
    static create = async (req: Request, res: Response) => {
        try {
            const createDto = plainToClass(CreateAdvertisementDto, req.body);
            const errors = await validate(createDto, { whitelist: true, forbidNonWhitelisted: true });
            if (errors.length > 0) {
                const formattedErrors = errors.map(error => ({
                    property: error.property,
                    constraints: error.constraints,
                }));
                res.status(400).json({ errors: formattedErrors });
                return;
            }

            const property = await AppDataSource.getRepository(Property).findOneBy({ id: createDto.property_id });
            if (!property) {
                res.status(404).json({ message: 'Propiedad no encontrada.' });
                return;
            }

            const advertisement = AppDataSource.getRepository(Advertisement).create({
                price: createDto.price,
                status: createDto.status,
                propertyType: createDto.propertyType,
                property: property,
            });

            await AppDataSource.getRepository(Advertisement).save(advertisement);
            res.status(201).json({ message: 'Advertisement creado exitosamente.', advertisement });
        } catch (error) {
            if (error instanceof QueryFailedError) {
                res.status(400).json({ message: 'Error al crear la advertisement.', details: error.message });
                return;
            }
            console.error('Error en create Advertisement:', error);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    };

    
    static getAll = async (req: Request, res: Response) => {
        try {
            const advertisements = await AppDataSource.getRepository(Advertisement).find({
                relations: ['property'],
            });
            res.status(200).json(advertisements);
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