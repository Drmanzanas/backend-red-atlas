import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { Property } from '../entities/Property';
import { SelectQueryBuilder } from 'typeorm';

export class PropertyController {
    static getAll = async (req: Request, res: Response) => {
        try {
            const propertyRepository = AppDataSource.getRepository(Property);
            const {
                sector,
                propertyType,
                status,
                minArea,
                maxArea,
                orderBy = 'id',
                order = 'ASC',
                page = '1',
                limit = '10',
            } = req.query;

            const pageNumber = parseInt(page as string, 10) || 1;
            const pageSize = parseInt(limit as string, 10) || 10;
            const skip = (pageNumber - 1) * pageSize;

            const qb: SelectQueryBuilder<Property> = propertyRepository.createQueryBuilder('property')
                .leftJoinAndSelect('property.advertisements', 'advertisement')
                .leftJoinAndSelect('property.transactions', 'transaction');

            if (sector) qb.andWhere('property.sector = :sector', { sector });
            if (propertyType) qb.andWhere('advertisement.propertyType = :propertyType', { propertyType });
            if (status) qb.andWhere('advertisement.status = :status', { status });
            if (minArea) qb.andWhere('property.area >= :minArea', { minArea: parseFloat(minArea as string) });
            if (maxArea) qb.andWhere('property.area <= :maxArea', { maxArea: parseFloat(maxArea as string) });

            qb.addSelect(`
                property.area * (
                    SELECT AVG(ad.price / p.area)
                    FROM advertisements ad
                    JOIN properties p ON ad.property_id = p.id
                    WHERE p.sector = property.sector
                )
            `, 'valuation');

            const allowedOrderFields = ['id', 'address', 'area', 'ownerName', 'sector', 'valuation'];
            const orderByField = allowedOrderFields.includes(orderBy as string) ? orderBy : 'id';
            const orderDirection = (order === 'DESC') ? 'DESC' : 'ASC';

            qb.orderBy(`property.${orderByField}`, orderDirection as 'ASC' | 'DESC');
            qb.skip(skip).take(pageSize);

            const [properties, total] = await qb.getManyAndCount();
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
        } catch (error) {
            console.error('Error fetching properties:', error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    };

    static getAllWithValuations = async (_req: Request, res: Response) => {
        try {
            const propertyRepository = AppDataSource.getRepository(Property);
            const qb: SelectQueryBuilder<Property> = propertyRepository.createQueryBuilder('property')
                .leftJoinAndSelect('property.advertisements', 'advertisement')
                .leftJoinAndSelect('property.transactions', 'transaction');

            qb.addSelect(`
                property.area * (
                    SELECT AVG(ad.price / p.area)
                    FROM advertisements ad
                    JOIN properties p ON ad.property_id = p.id
                    WHERE p.sector = property.sector
                )
            `, 'valuation');

            const properties = await qb.getRawAndEntities();
            const result = properties.entities.map((property, index) => ({
                ...property,
                valuation: parseFloat(properties.raw[index].valuation),
            }));

            res.json(result);
        } catch (error) {
            console.error('Error fetching properties with valuations:', error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    };

    static getById = async (req: Request, res: Response) => {
        try {
            const propertyRepository = AppDataSource.getRepository(Property);
            const { id } = req.params;

            const property = await propertyRepository.findOne({
                where: { id },
                relations: ['advertisements', 'transactions'],
            });

            if (!property) {
                res.status(404).json({ message: 'Property not found.' });
                return;
            }

            res.json(property);
        } catch (error) {
            console.error('Error fetching property:', error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    };

    static create = async (req: Request, res: Response) => {
        try {
            const propertyRepository = AppDataSource.getRepository(Property);
            const { address, area, ownerName, sector } = req.body;

            if (!address || !area || !ownerName || !sector) {
                res.status(400).json({ message: 'Missing required fields.' });
                return;
            }

            const property = propertyRepository.create({
                address,
                area,
                ownerName,
                sector,
            });

            const savedProperty = await propertyRepository.save(property);
            res.status(201).json(savedProperty);
        } catch (error) {
            console.error('Error creating property:', error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    };

    static update = async (req: Request, res: Response) => {
        try {
            const propertyRepository = AppDataSource.getRepository(Property);
            const { id } = req.params;
            const { address, area, ownerName, sector } = req.body;

            const property = await propertyRepository.findOneBy({ id });

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

            const updatedProperty = await propertyRepository.save(property);
            res.json(updatedProperty);
        } catch (error) {
            console.error('Error updating property:', error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    };

    static delete = async (req: Request, res: Response) => {
        try {
            const propertyRepository = AppDataSource.getRepository(Property);
            const { id } = req.params;

            const property = await propertyRepository.findOneBy({ id });

            if (!property) {
                res.status(404).json({ message: 'Property not found.' });
                return;
            }

            await propertyRepository.remove(property);
            res.json({ message: 'Property deleted successfully.' });
        } catch (error) {
            console.error('Error deleting property:', error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    };
}