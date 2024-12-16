import { Router } from 'express';
import { AdvertisementController } from '../../controllers/AdvertisementController';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { authenticateJWT, authorizeRoles } from '../../middlewares/auth';

const advertisementsRouter = Router();

advertisementsRouter.post(
    '/',
    authenticateJWT,
    authorizeRoles('admin', 'user'), 
    asyncHandler(AdvertisementController.create)
);

advertisementsRouter.get(
    '/',
    authenticateJWT,
    authorizeRoles('admin', 'user'), 
    asyncHandler(AdvertisementController.getAll)
);

advertisementsRouter.get(
    '/:id',
    authenticateJWT,
    authorizeRoles('admin', 'user'), 
    asyncHandler(AdvertisementController.getById)
);

advertisementsRouter.put(
    '/:id',
    authenticateJWT,
    authorizeRoles('admin'), 
    asyncHandler(AdvertisementController.update)
);

advertisementsRouter.delete(
    '/:id',
    authenticateJWT,
    authorizeRoles('admin'), 
    asyncHandler(AdvertisementController.delete)
);

export default advertisementsRouter;