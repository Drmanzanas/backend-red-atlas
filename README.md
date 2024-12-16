
# Red Atlas Backend Challenge - Mid-Level

## Descripción

Este proyecto es una API para la gestión de información catastral e inmobiliaria, diseñada para manejar grandes volúmenes de datos, realizar consultas complejas y garantizar un rendimiento eficiente. La API incluye autenticación con JWT, autorización basada en roles, y permite realizar operaciones CRUD sobre propiedades, anuncios y transacciones.

---

## Instalación y Configuración

### Requisitos Previos

1. **Node.js**: Versión 16 o superior.
2. **npm**: Instalado junto con Node.js.
3. **Docker y Docker Compose**: Para la base de datos PostgreSQL.
4. **Git**: Para clonar el repositorio.

---

### Pasos de Instalación

1. **Clonar el repositorio**

   ```bash
   git clone https://github.com/Drmanzanas/backend-red-atlas.git
   cd backend-challenge
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   Copia el archivo `.env.example` a `.env` y edítalo con las variables necesarias:

   ```bash
   cp .env.example .env
   ```
---

### Configuración de la Base de Datos

#### Usando Docker

Para levantar la base de datos PostgreSQL con Docker:

1. **Iniciar el contenedor**

   ```bash
   docker-compose up -d
   ```

   Esto levantará un contenedor de PostgreSQL en el puerto `5432` (o el que configures en `docker-compose.yml`).

---

### Migraciones y Seeds

1. **Correr las migraciones**

   Aplica las migraciones para crear las tablas necesarias:

   ```bash
   npm run migration:run
   ```

2. **Insertar roles predefinidos**

   Carga los roles iniciales (`admin`, `user`):

   ```bash
   npm run seed:roles
   ```

---

### Datos Aleatorios

1. **Generar datos aleatorios**

   Genera 10000 propiedades con anuncios y transacciones aleatorias:

   ```bash
   npm run generate:data
   ```

---

### Levantar el Proyecto

1. **Ejecutar en modo desarrollo**

   Para iniciar el servidor en modo desarrollo:

   ```bash
   npm run dev
   ```

2. **Compilar y ejecutar en modo producción**

   Primero, compila el proyecto:

   ```bash
   npm run build
   ```

   Luego, ejecuta el servidor en producción:

   ```bash
   npm start
   ```

---

### Endpoints

# API Documentation

## **Autenticación**
| Método | Endpoint              | Descripción                     |
|--------|-----------------------|---------------------------------|
| POST   | `/api/user/register`  | Registrar un nuevo usuario      |
| POST   | `/api/user/login`     | Iniciar sesión y obtener token JWT |

---

## **Propiedades**  
| Método | Endpoint                      | Descripción                                     |
|--------|-------------------------------|-------------------------------------------------|
| GET    | `/api/properties`             | Listar propiedades con filtros avanzados        |
| GET    | `/api/properties/:id`         | Obtener una propiedad específica por ID         |
| GET    | `/api/properties/valuations`  | Obtener propiedades con valuaciones dinámicas   |
| POST   | `/api/properties`             | Crear una nueva propiedad (soporta bulk create) |
| PUT    | `/api/properties/:id`         | Actualizar una propiedad específica por ID      |
| DELETE | `/api/properties/:id`         | Eliminar una propiedad específica por ID        |

---

## **Anuncios**  
| Método | Endpoint                        | Descripción                                     |
|--------|---------------------------------|-------------------------------------------------|
| GET    | `/api/advertisements`           | Listar anuncios con filtros avanzados           |
| GET    | `/api/advertisements/:id`       | Obtener un anuncio específico por ID            |
| POST   | `/api/advertisements`           | Crear un nuevo anuncio (soporta bulk create)    |
| PUT    | `/api/advertisements/:id`       | Actualizar un anuncio específico por ID         |
| DELETE | `/api/advertisements/:id`       | Eliminar un anuncio específico por ID           |

---

## **Transacciones**  
| Método | Endpoint                      | Descripción                                     |
|--------|-------------------------------|-------------------------------------------------|
| GET    | `/api/transactions`           | Listar transacciones con filtros avanzados      |
| GET    | `/api/transactions/:id`       | Obtener una transacción específica por ID       |
| POST   | `/api/transactions`           | Crear una nueva transacción (soporta bulk create) |
| PUT    | `/api/transactions/:id`       | Actualizar una transacción específica por ID    |
| DELETE | `/api/transactions/:id`       | Eliminar una transacción específica por ID      |

---

## **Estructura General de Solicitudes**

### **Headers Comunes**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```
---

### Despliegue

Este proyecto está configurado para ser desplegado en servicios como Vercel. Sigue estos pasos:

1. **Configurar base de datos remota**
   - Usa servicios como [Neon.tech](https://neon.tech) o [ElephantSQL](https://www.elephantsql.com).

2. **Proporcionar enlace**
   - [Enlace de Vercel](https://backend-red-atlas-nrp1l6zj1-ulises-menems-projects.vercel.app).

---

**Autor**: [Ulises Menem]