"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../../middlewares/asyncHandler");
const PropertyController_1 = require("../../controllers/PropertyController");
const auth_1 = require("../../middlewares/auth");
const propertiesRouter = (0, express_1.Router)();
propertiesRouter.get('/', auth_1.authenticateJWT, (0, auth_1.authorizeRoles)('admin', 'user'), (0, asyncHandler_1.asyncHandler)(PropertyController_1.PropertyController.getAll));
propertiesRouter.get('/valuations', auth_1.authenticateJWT, (0, auth_1.authorizeRoles)('admin'), (0, asyncHandler_1.asyncHandler)(PropertyController_1.PropertyController.getAllWithValuations));
propertiesRouter.get('/:id', auth_1.authenticateJWT, (0, auth_1.authorizeRoles)('admin', 'user'), (0, asyncHandler_1.asyncHandler)(PropertyController_1.PropertyController.getById));
propertiesRouter.post('/', auth_1.authenticateJWT, (0, auth_1.authorizeRoles)('admin'), (0, asyncHandler_1.asyncHandler)(PropertyController_1.PropertyController.create));
propertiesRouter.put('/:id', auth_1.authenticateJWT, (0, auth_1.authorizeRoles)('admin'), (0, asyncHandler_1.asyncHandler)(PropertyController_1.PropertyController.update));
propertiesRouter.delete('/:id', auth_1.authenticateJWT, (0, auth_1.authorizeRoles)('admin'), (0, asyncHandler_1.asyncHandler)(PropertyController_1.PropertyController.delete));
exports.default = propertiesRouter;
