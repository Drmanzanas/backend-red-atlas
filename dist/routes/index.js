"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
const routesPath = path_1.default.join(__dirname);
const entries = fs_1.default.readdirSync(routesPath);
const directories = entries.filter((entry) => {
    const fullPath = path_1.default.join(routesPath, entry);
    return fs_1.default.lstatSync(fullPath).isDirectory();
});
directories.forEach((dir) => {
    const routerPath = path_1.default.join(routesPath, dir, 'index');
    try {
        const routeModule = require(routerPath).default;
        if (routeModule) {
            router.use(`/${dir}`, routeModule);
            console.log(`Ruta '/${dir}' cargada correctamente.`);
        }
        else {
            console.warn(`El módulo en ${routerPath} no tiene una exportación por defecto.`);
        }
    }
    catch (err) {
        console.error(`Error al cargar la ruta '/${dir}':`, err);
    }
});
router.use((req, res, next) => {
    res.status(404).json({ message: 'Ruta no existe' });
});
exports.default = router;
