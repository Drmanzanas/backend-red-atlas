import { Router, Request, Response } from 'express';
import { AppDataSource } from '../../database/data-source';
import { Property } from '../../entities/Property';
import { SelectQueryBuilder } from 'typeorm';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { PropertyController } from '../../controllers/PropertyController';

const propertiesRouter = Router();

const buildFilters = (query: any): any => {
  const filters: any = {};

  if (query.sector) {
    filters.sector = query.sector;
  }

  if (query.propertyType) {
    filters.propertyType = query.propertyType;
  }

  if (query.status) {
    filters.status = query.status;
  }

  if (query.minArea || query.maxArea) {
    filters.area = {};
    if (query.minArea) {
      filters.area.$gte = parseFloat(query.minArea);
    }
    if (query.maxArea) {
      filters.area.$lte = parseFloat(query.maxArea);
    }
  }


  return filters;
};

propertiesRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
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

    if (sector) {
      qb.andWhere('property.sector = :sector', { sector });
    }

    if (propertyType) {
      qb.andWhere('advertisement.propertyType = :propertyType', { propertyType });
    }

    if (status) {
      qb.andWhere('advertisement.status = :status', { status });
    }

    if (minArea) {
      qb.andWhere('property.area >= :minArea', { minArea: parseFloat(minArea as string) });
    }

    if (maxArea) {
      qb.andWhere('property.area <= :maxArea', { maxArea: parseFloat(maxArea as string) });
    }

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
  })
);

propertiesRouter.get(
  '/valuations',
  asyncHandler(async (req: Request, res: Response) => {
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
  })
);

propertiesRouter.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const propertyRepository = AppDataSource.getRepository(Property);
    const { id } = req.params;

    const property = await propertyRepository.findOne({
      where: { id },
      relations: ['advertisements', 'transactions'],
    });

    if (property) {
      res.json(property);
    } else {
      res.status(404).json({ mensaje: 'Propiedad no encontrada' });
    }
  })
);

propertiesRouter.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const propertyRepository = AppDataSource.getRepository(Property);
    const { address, area, ownerName, sector } = req.body;

    if (!address || !area || !ownerName || !sector) {
      res.status(400).json({ message: 'Faltan campos requeridos' });
      return;
    }

    const property = new Property();
    property.address = address;
    property.area = area;
    property.ownerName = ownerName;
    property.sector = sector;

    const savedProperty = await propertyRepository.save(property);
    res.status(201).json(savedProperty);
  })
);


propertiesRouter.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const propertyRepository = AppDataSource.getRepository(Property);
    const { id } = req.params;
    const { address, area, ownerName, sector } = req.body;

    const property = await propertyRepository.findOneBy({ id });

    if (!property) {
      res.status(404).json({ message: 'Propiedad no encontrada' });
      return
    }

    property.address = address ?? property.address;
    property.area = area ?? property.area;
    property.ownerName = ownerName ?? property.ownerName;
    property.sector = sector ?? property.sector;

    const updatedProperty = await propertyRepository.save(property);
    res.json(updatedProperty);
  })
);

propertiesRouter.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const propertyRepository = AppDataSource.getRepository(Property);
    const { id } = req.params;

    const property = await propertyRepository.findOneBy({ id });

    if (!property) {
      res.status(404).json({ message: 'Propiedad no encontrada' });
      return
    }

    await propertyRepository.remove(property);
    res.json({ message: 'Propiedad eliminada correctamente' });
  })
);

propertiesRouter.post(
    '/bulk',
    asyncHandler(PropertyController.bulkCreate)
);

export default propertiesRouter;