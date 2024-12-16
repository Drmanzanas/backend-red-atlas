import { Router } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { PropertyController } from '../../controllers/PropertyController';
import { authenticateJWT, authorizeRoles } from '../../middlewares/auth';

const propertiesRouter = Router();

propertiesRouter.get(
    '/',
    authenticateJWT,
    authorizeRoles('admin', 'user'), 
    asyncHandler(PropertyController.getAll)
);

propertiesRouter.get(
    '/valuations',
    authenticateJWT,
    authorizeRoles('admin'), 
    asyncHandler(PropertyController.getAllWithValuations)
);

propertiesRouter.get(
    '/:id',
    authenticateJWT,
    authorizeRoles('admin', 'user'), 
    asyncHandler(PropertyController.getById)
);

propertiesRouter.post(
    '/',
    authenticateJWT,
    authorizeRoles('admin'), 
    asyncHandler(PropertyController.create)
);

propertiesRouter.put(
    '/:id',
    authenticateJWT,
    authorizeRoles('admin'), 
    asyncHandler(PropertyController.update)
);

propertiesRouter.delete(
    '/:id',
    authenticateJWT,
    authorizeRoles('admin'), 
    asyncHandler(PropertyController.delete)
);

export default propertiesRouter;