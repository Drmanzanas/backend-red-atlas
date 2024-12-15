import { Router } from 'express';
import { TransactionController } from '../../controllers/TransactionController';
import { asyncHandler } from '../../middlewares/asyncHandler';

const transactionsRouter = Router();

transactionsRouter.post('/', asyncHandler(TransactionController.create));
transactionsRouter.get('/', asyncHandler(TransactionController.getAll));
transactionsRouter.get('/:id', asyncHandler(TransactionController.getById));
transactionsRouter.put('/:id', asyncHandler(TransactionController.update));
transactionsRouter.delete('/:id', asyncHandler(TransactionController.delete));

export default transactionsRouter;