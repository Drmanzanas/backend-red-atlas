const fetch = require('node-fetch');

const sectors = ['residential', 'commercial', 'industrial', 'agricultural'];
const advertisementStatuses = ['for_sale', 'for_lease'];
const propertyTypes = ['apartment', 'house', 'retail', 'land', 'industrial'];
const transactionTypes = ['sale_purchase', 'lease', 'mortgage', 'judicial_sale', 'other'];

const generateRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateProperties = () => {
    return Array.from({ length: 10000 }, (_, i) => ({
        address: `Street ${i + 1}, Building ${generateRandomNumber(1, 1000)}`,
        area: Number(generateRandomNumber(50, 5000)),
        ownerName: `Owner ${i + 1}`,
        sector: sectors[Math.floor(Math.random() * sectors.length)],
    }));
};

const generateAdvertisements = (propertyIds) => {
    const advertisements = [];
    propertyIds.forEach((property_id) => {
        const count = generateRandomNumber(1, 3); 
        for (let i = 0; i < count; i++) {
            advertisements.push({
                price: Number(generateRandomNumber(10000, 500000)),
                status: advertisementStatuses[Math.floor(Math.random() * advertisementStatuses.length)],
                propertyType: propertyTypes[Math.floor(Math.random() * propertyTypes.length)],
                property_id,
            });
        }
    });
    return advertisements;
};

const generateTransactions = (propertyIds) => {
    const transactions = [];
    propertyIds.forEach((property_id) => {
        const count = generateRandomNumber(1, 5); 
        for (let i = 0; i < count; i++) {
            transactions.push({
                address: `Street ${generateRandomNumber(1, 100)}, Building ${generateRandomNumber(1, 500)}`,
                type: transactionTypes[Math.floor(Math.random() * transactionTypes.length)],
                date: new Date().toISOString(),
                price: Number(generateRandomNumber(5000, 1000000)),
                property_id,
            });
        }
    });
    return transactions;
};


const insertProperties = async (properties) => {
    try {
        const response = await fetch('http://localhost:3000/api/properties', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(properties),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Error HTTP: ${response.status} - ${error}`);
        }

        const data = await response.json();

        const propertiesArray = Array.isArray(data) ? data : [data];

        return propertiesArray.map((property) => property.id);
    } catch (error) {
        console.error('Error al insertar propiedades:', error.message);
        throw error;
    }
};


const insertAdvertisements = async (advertisements) => {
    try {
        const response = await fetch('http://localhost:3000/api/advertisements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(advertisements),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Error HTTP: ${response.status} - ${error}`);
        }

        console.log('Advertisements insertados correctamente.');
    } catch (error) {
        console.error('Error al insertar advertisements:', error.message);
        throw error;
    }
};

const insertTransactions = async (transactions) => {
    try {
        const response = await fetch('http://localhost:3000/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transactions),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Error HTTP: ${response.status} - ${error}`);
        }

        console.log('Transactions insertadas correctamente.');
    } catch (error) {
        console.error('Error al insertar transactions:', error.message);
        throw error;
    }
};

(async () => {
    try {
        console.log('Generando propiedades...');
        const properties = generateProperties();

        console.log(JSON.stringify(properties))
        console.log('Insertando propiedades...');
        const propertyIds = await insertProperties(properties);

        console.log('Generando advertisements...');
        const advertisements = generateAdvertisements(propertyIds);

        console.log(JSON.stringify(advertisements))
        console.log('Insertando advertisements...');
        await insertAdvertisements(advertisements);

        console.log('Generando transactions...');
        const transactions = generateTransactions(propertyIds);

        console.log('Insertando transactions...');
        await insertTransactions(transactions);

        console.log('Datos insertados exitosamente.');
    } catch (error) {
        console.error('Error durante la ejecución:', error.message);
    }
})();