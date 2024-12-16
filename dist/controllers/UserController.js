"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt_1 = require("../utils/jwt");
const data_source_1 = require("../database/data-source");
const User_1 = require("../entities/User");
const Role_1 = require("../entities/Role");
class UserController {
}
exports.UserController = UserController;
_a = UserController;
UserController.login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
    const user = yield userRepository.findOne({
        where: { email },
        relations: ['role'],
    });
    if (!user) {
        res.status(404).json({ message: 'Usuario no encontrado.' });
        return;
    }
    const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        res.status(401).json({ message: 'Credenciales inválidas.' });
        return;
    }
    const token = (0, jwt_1.generateToken)({ id: user.id, role: user.role.name });
    res.json({ token });
});
UserController.register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, roleName = 'user' } = req.body;
    const roleRepository = data_source_1.AppDataSource.getRepository(Role_1.Role);
    const role = yield roleRepository.findOneBy({ name: roleName });
    if (!role) {
        res.status(400).json({ message: `El rol '${roleName}' no existe.` });
        return;
    }
    const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
    const existingUser = yield userRepository.findOneBy({ email });
    if (existingUser) {
        res.status(400).json({ message: 'El usuario ya existe.' });
        return;
    }
    const user = userRepository.create({
        email,
        password,
        role,
    });
    yield userRepository.save(user);
    res.status(201).json({ message: 'Usuario registrado exitosamente.' });
});
