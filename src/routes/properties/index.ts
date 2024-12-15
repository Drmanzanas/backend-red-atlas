import { Router } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { PropertyController } from '../../controllers/PropertyController';

const propertiesRouter = Router();

propertiesRouter.get('/', asyncHandler(PropertyController.getAll));
propertiesRouter.get('/valuations', asyncHandler(PropertyController.getAllWithValuations));
propertiesRouter.get('/:id', asyncHandler(PropertyController.getById));
propertiesRouter.post('/', asyncHandler(PropertyController.create));
propertiesRouter.put('/:id', asyncHandler(PropertyController.update));
propertiesRouter.delete('/:id', asyncHandler(PropertyController.delete));

export default propertiesRouter;