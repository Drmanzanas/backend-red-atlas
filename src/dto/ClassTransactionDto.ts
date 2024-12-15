import {
    IsNotEmpty,
    IsEnum,
    IsNumber,
    IsUUID,
    IsDateString,
    IsOptional,
} from 'class-validator';
import { TransactionType } from '../enums/Transaction';

export class CreateTransactionDto {
    @IsNotEmpty({ message: 'La dirección es obligatoria.' })
    address: string;

    @IsEnum(TransactionType, { message: 'El tipo de transacción es inválido.' })
    type: TransactionType;

    @IsDateString({}, { message: 'La fecha debe tener un formato válido.' })
    date: string;

    @IsNumber()
    @IsNotEmpty({ message: 'El precio es obligatorio.' })
    price: number;

    @IsUUID('4', { message: 'El ID de la propiedad debe ser un UUID válido.' })
    @IsNotEmpty({ message: 'El ID de la propiedad es obligatorio.' })
    property_id: string;
}

export class UpdateTransactionDto {
    @IsOptional()
    address?: string;

    @IsOptional()
    @IsEnum(TransactionType, { message: 'El tipo de transacción es inválido.' })
    type?: TransactionType;

    @IsOptional()
    @IsDateString({}, { message: 'La fecha debe tener un formato válido.' })
    date?: string;

    @IsOptional()
    @IsNumber()
    price?: number;

    @IsOptional()
    @IsUUID('4', { message: 'El ID de la propiedad debe ser un UUID válido.' })
    property_id?: string; 
}