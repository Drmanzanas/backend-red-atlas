
import { 
    IsNotEmpty, 
    IsNumber, 
    IsEnum,
    IsOptional,
    IsUUID, 
} from 'class-validator';
import { AdvertisementStatus } from '../enums/Advertisement';
import { PropertyType } from '../enums/Properties';

export class CreateAdvertisementDto {
    @IsNumber()
    @IsNotEmpty({ message: 'El precio es obligatorio.' })
    price: number;

    @IsEnum(AdvertisementStatus, { message: 'El estado debe ser "for_sale" o "for_lease".' })
    status: AdvertisementStatus;

    @IsEnum(PropertyType, { message: 'El tipo de propiedad es inválido.' })
    propertyType: PropertyType;

    @IsUUID('4', { message: 'El ID de la propiedad debe ser un UUID válido.' })
    @IsNotEmpty({ message: 'El ID de la propiedad es obligatorio.' })
    property_id: string;
}


export class UpdateAdvertisementDto {
    @IsOptional()
    @IsNumber()
    price?: number;

    @IsOptional()
    @IsEnum(AdvertisementStatus, { message: 'El estado debe ser "for_sale" o "for_lease".' })
    status?: AdvertisementStatus;

    @IsOptional()
    @IsEnum(PropertyType, { message: 'El tipo de propiedad es inválido.' })
    propertyType?: PropertyType;
}