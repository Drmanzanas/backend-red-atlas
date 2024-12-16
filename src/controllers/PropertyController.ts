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

    static getAllWithValuations = async (req: Request, res: Response) => {
        try {
            const { page = '1', limit = '100' } = req.query;
    
            const pageNumber = parseInt(page as string, 10) || 1;
            const pageSize = parseInt(limit as string, 10) || 100;
            const offset = (pageNumber - 1) * pageSize;
    
            const query = `
                SELECT 
                    p.*,
                    ROUND(
                        (p.area * COALESCE(
                            (
                                SELECT AVG(ad.price / prop.area)
                                FROM advertisements ad
                                INNER JOIN properties prop ON ad.property_id = prop.id
                                WHERE prop.sector = p.sector
                                AND prop.area > 0
                            ), 0
                        )), 2
                    )::float AS valuation
                FROM properties p
                LEFT JOIN advertisements a ON p.id = a.property_id
                LIMIT $1 OFFSET $2;
            `;
    
            const propertiesWithValuation = await AppDataSource.query(query, [pageSize, offset]);
    
            res.status(200).json({
                data: propertiesWithValuation,
                pagination: {
                    page: pageNumber,
                    limit: pageSize,
                    total: propertiesWithValuation.length,
                },
            });
        } catch (error) {
            console.error('Error fetching valuations:', error);
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

    static create = async (req: Request, res: Response) => {
        try {
            const propertyRepository = AppDataSource.getRepository(Property);
    
            const data = Array.isArray(req.body) ? req.body : [req.body];
    
            const propertiesToSave: Property[] = [];
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
    
            let savedProperties: Property[] = [];
            if (propertiesToSave.length > 0) {
                savedProperties = await propertyRepository.save(propertiesToSave);
            }
    
            if (errorsArray.length > 0) {
                res.status(207).json({
                    message: 'Algunas propiedades no pudieron ser creadas.',
                    successful: savedProperties,
                    errors: errorsArray,
                });
            } else {
                res.status(201).json({
                    message: 'Todas las propiedades fueron creadas exitosamente.',
                    properties: savedProperties,
                });
            }
        } catch (error) {
            console.error('Error creating properties:', error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    };
}