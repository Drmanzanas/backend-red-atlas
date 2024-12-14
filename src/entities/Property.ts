import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
  } from 'typeorm';
  import { Advertisement } from './Advertisement';
  import { Transaction } from './Transaction';
import { PropertySector } from '../enums/Properties';
  
  @Entity('properties')
  export class Property {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    address: string;
  
    @Column('decimal', { precision: 10, scale: 2 })
    area: number;
  
    @Column()
    ownerName: string;
  
    @Column({
      type: 'enum',
      enum: PropertySector,
    })
    sector: PropertySector;
  
    
    @OneToMany(() => Advertisement, (advertisement) => advertisement.property, { cascade: true })
    advertisements: Advertisement[];
    
    @OneToMany(() => Transaction, (transaction) => transaction.property, { cascade: true })
    transactions: Transaction[];
  }