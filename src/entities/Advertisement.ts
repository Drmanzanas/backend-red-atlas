
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { Property } from './Property';
import { AdvertisementStatus } from '../enums/Advertisement';
import { PropertyType } from '../enums/Properties';
  
  @Entity('advertisements')
  export class Advertisement {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column('decimal', { precision: 10, scale: 2 })
    price: number;
  
    @Column({
      type: 'enum',
      enum: AdvertisementStatus,
    })
    status: AdvertisementStatus;
  
    @Column({
      type: 'enum',
      enum: PropertyType,
    })
    propertyType: PropertyType;
  
    @ManyToOne(() => Property, (property) => property.advertisements, { onDelete: 'CASCADE' })
    property: Property;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }