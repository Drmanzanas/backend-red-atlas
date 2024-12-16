import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt';
import { AppDataSource } from '../database/data-source';
import { User } from '../entities/User';
import { Role } from '../entities/Role';

export class UserController {
    static login = async (req: Request, res: Response) => {
        const { email, password } = req.body;

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
            where: { email },
            relations: ['role'],
        });

        if (!user) {
            res.status(404).json({ message: 'Usuario no encontrado.' });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Credenciales inválidas.' });
            return;
        }

        const token = generateToken({ id: user.id, role: user.role.name });
        res.json({ token });
    };

    static register = async (req: Request, res: Response) => {
        const { email, password, roleName = 'user' } = req.body;

        const roleRepository = AppDataSource.getRepository(Role);
        const role = await roleRepository.findOneBy({ name: roleName });

        if (!role) {
            res.status(400).json({ message: `El rol '${roleName}' no existe.` });
            return;
        }

        const userRepository = AppDataSource.getRepository(User);
        const existingUser = await userRepository.findOneBy({ email });
        if (existingUser) {
            res.status(400).json({ message: 'El usuario ya existe.' });
            return;
        }

        const user = userRepository.create({
            email,
            password,
            role,
        });

        await userRepository.save(user);

        res.status(201).json({ message: 'Usuario registrado exitosamente.' });
    };
}