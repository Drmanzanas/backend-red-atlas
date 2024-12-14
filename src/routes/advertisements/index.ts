import { Router } from 'express';
import { AdvertisementController } from '../../controllers/AdvertisementController';
import { asyncHandler } from '../../middlewares/asyncHandler';

const advertisementsRouter = Router();

advertisementsRouter.post(
    '/',
    asyncHandler(AdvertisementController.create)
);


advertisementsRouter.get(
    '/',
    asyncHandler(AdvertisementController.getAll)
);


advertisementsRouter.get(
    '/:id',
    asyncHandler(AdvertisementController.getById)
);


advertisementsRouter.put(
    '/:id',
    asyncHandler(AdvertisementController.update)
);


advertisementsRouter.delete(
    '/:id',
    asyncHandler(AdvertisementController.delete)
);

export default advertisementsRouter;