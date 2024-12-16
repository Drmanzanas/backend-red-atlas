import { Router } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { TransactionController } from '../../controllers/TransactionController';
import { authenticateJWT, authorizeRoles } from '../../middlewares/auth';

const transactionsRouter = Router();

transactionsRouter.post(
  '/',
  authenticateJWT,
  authorizeRoles('admin', 'user'), 
  asyncHandler(TransactionController.create)
);

transactionsRouter.get(
  '/',
  authenticateJWT,
  authorizeRoles('admin', 'user'), 
  asyncHandler(TransactionController.getAll)
);

transactionsRouter.get(
  '/:id',
  authenticateJWT,
  authorizeRoles('admin', 'user'), 
  asyncHandler(TransactionController.getById)
);

transactionsRouter.put(
  '/:id',
  authenticateJWT,
  authorizeRoles('admin'), 
  asyncHandler(TransactionController.update)
);

transactionsRouter.delete(
  '/:id',
  authenticateJWT,
  authorizeRoles('admin'), 
  asyncHandler(TransactionController.delete)
);

export default transactionsRouter;