"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserController_1 = require("../../controllers/UserController");
const asyncHandler_1 = require("../../middlewares/asyncHandler");
const userRouter = (0, express_1.Router)();
userRouter.post('/login', (0, asyncHandler_1.asyncHandler)(UserController_1.UserController.login));
userRouter.post('/register', (0, asyncHandler_1.asyncHandler)(UserController_1.UserController.register));
exports.default = userRouter;
