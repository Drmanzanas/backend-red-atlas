
import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { Property } from '../entities/Property';
import { Advertisement } from '../entities/Advertisement';
import { BulkCreatePropertyDto, CreatePropertyDto } from '../dto/BulkCreatePropertyDto';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { QueryFailedError } from 'typeorm';
import { AdvertisementStatus } from '../enums/Advertisement';
import { PropertyType } from '../enums/Properties';

export class PropertyController {

    static bulkCreate = async (req: Request, res: Response) => {
    
        const bulkCreateDto = plainToClass(BulkCreatePropertyDto, req.body);

    
        const errors = await validate(bulkCreateDto, { whitelist: true, forbidNonWhitelisted: true });
        if (errors.length > 0) {
        
            const formattedErrors = errors.map(error => {
                return {
                    property: error.property,
                    constraints: error.constraints,
                    children: error.children,
                };
            });
            res.status(400).json({ errors: formattedErrors });
            return;
        }

        const propertiesData: CreatePropertyDto[] = bulkCreateDto.properties;

    
        const propertiesToInsert = propertiesData.map(data => ({
            address: data.address,
            area: data.area,
            ownerName: data.ownerName,
            sector: data.sector,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));

    
        const advertisementsToInsert: Partial<Advertisement>[] = [];
        propertiesData.forEach((data, index) => {
            if (data.advertisements && data.advertisements.length > 0) {
                data.advertisements.forEach(adData => {
                    advertisementsToInsert.push({
                        price: adData.price,
                        status: AdvertisementStatus[adData.status.toUpperCase().replace(' ', '_') as keyof typeof AdvertisementStatus],
                        propertyType: PropertyType[adData.propertyType.toUpperCase() as keyof typeof PropertyType],
                    
                    });
                });
            }
        });

        try {
        
            await AppDataSource.transaction(async transactionalEntityManager => {
            
                const insertResult = await transactionalEntityManager
                    .createQueryBuilder()
                    .insert()
                    .into(Property)
                    .values(propertiesToInsert)
                    .returning(['id'])
                    .execute();

                const insertedProperties = insertResult.generatedMaps as Array<{ id: string }>;

            
                let adIndex = 0;
                propertiesData.forEach((data, propIndex) => {
                    if (data.advertisements && data.advertisements.length > 0) {
                        data.advertisements.forEach(adData => {
                            advertisementsToInsert[adIndex].property = { id: insertedProperties[propIndex].id } as Property;
                            adIndex++;
                        });
                    }
                });

            
                if (advertisementsToInsert.length > 0) {
                    await transactionalEntityManager
                        .createQueryBuilder()
                        .insert()
                        .into(Advertisement)
                        .values(advertisementsToInsert)
                        .execute();
                }
            });

        
            res.status(201).json({ message: 'Propiedades y advertisements creados exitosamente.' });
            return;
        } catch (error) {
            if (error instanceof QueryFailedError) {
            
                res.status(400).json({ message: 'Error al crear las propiedades y advertisements.', details: error.message });
                return;
            }

        
            res.status(500).json({ message: 'Error interno del servidor.' });
            return;
        }
    };
}