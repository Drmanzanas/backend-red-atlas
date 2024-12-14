import { Router, Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

const routesPath = path.join(__dirname);

const entries = fs.readdirSync(routesPath);

const directories = entries.filter((entry) => {
  const fullPath = path.join(routesPath, entry);
  return fs.lstatSync(fullPath).isDirectory();
});

directories.forEach((dir) => {

  const routerPath = path.join(routesPath, dir, 'index');

  try {

    const routeModule = require(routerPath).default;
    if (routeModule) {
      router.use(`/${dir}`, routeModule);
      console.log(`Ruta '/${dir}' cargada correctamente.`);
    } else {
      console.warn(`El módulo en ${routerPath} no tiene una exportación por defecto.`);
    }
  } catch (err) {
    console.error(`Error al cargar la ruta '/${dir}':`, err);
  }
});

router.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: 'Ruta no existe' });
});

export default router;