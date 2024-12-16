const { AppDataSource } = require('../database/data-source');
const { Role } = require('../entities/Role');

const seedRoles = async () => {
    try {
        await AppDataSource.initialize();

        const roleRepository = AppDataSource.getRepository(Role);

        const roles = [
            { name: 'admin' },
            { name: 'user' },
        ];

        for (const roleData of roles) {
            const existingRole = await roleRepository.findOneBy({ name: roleData.name });
            if (!existingRole) {
                const role = roleRepository.create(roleData);
                await roleRepository.save(role);
                console.log(`Role '${roleData.name}' created.`);
            } else {
                console.log(`Role '${roleData.name}' already exists.`);
            }
        }

        console.log('Roles seeded successfully!');
        await AppDataSource.destroy();
    } catch (error) {
        console.error('Error seeding roles:', error);
        await AppDataSource.destroy();
        process.exit(1);
    }
};

seedRoles();