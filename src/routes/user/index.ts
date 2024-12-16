import { Router } from 'express';
import { UserController } from '../../controllers/UserController';
import { asyncHandler } from '../../middlewares/asyncHandler';

const userRouter = Router();

userRouter.post('/login', asyncHandler(UserController.login));
userRouter.post('/register', asyncHandler(UserController.register));

export default userRouter;