import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { Property } from './Property';
  
  @Entity('transactions')
  export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    address: string;
  
    @Column({
      type: 'enum',
      enum: ['sale_purchase', 'lease', 'mortgage', 'judicial_sale', 'other'],
    })
    type: 'sale_purchase' | 'lease' | 'mortgage' | 'judicial_sale' | 'other';
  
    @Column({ type: 'date' })
    date: Date;
  
    @Column('decimal', { precision: 10, scale: 2 })
    price: number;
  
    @ManyToOne(() => Property, (property) => property.transactions, { onDelete: 'CASCADE' })
    property: Property;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }