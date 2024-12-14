
import { 
    IsString, 
    IsNotEmpty, 
    IsNumber, 
    IsEnum, 
    ValidateNested, 
    ArrayMinSize, 
    IsOptional 
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAdvertisementDto } from './ClassAdvertisementDto';
import { PropertySector } from '../enums/Properties';

export class CreatePropertyDto {
    @IsString()
    @IsNotEmpty({ message: 'La dirección es obligatoria.' })
    address: string;

    @IsNumber()
    @IsNotEmpty({ message: 'El área es obligatoria.' })
    area: number;

    @IsString()
    @IsNotEmpty({ message: 'El nombre del propietario es obligatorio.' })
    ownerName: string;

    @IsEnum(PropertySector, { message: 'El sector es inválido.' })
    sector: PropertySector;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CreateAdvertisementDto)
    advertisements?: CreateAdvertisementDto[];
}

export class BulkCreatePropertyDto {
    @ValidateNested({ each: true })
    @Type(() => CreatePropertyDto)
    @ArrayMinSize(1, { message: 'Debe proporcionar al menos una propiedad para crear.' })
    properties: CreatePropertyDto[];
}