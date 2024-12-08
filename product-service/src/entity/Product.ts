import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Product {
  constructor() {
    this.description = '';
    this.rating = 0;
    this.category = '';
  }
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  description: string;

  @Column('decimal')
  price!: number;

  @Column()
  category: string;

  @Column('decimal', { precision: 3, scale: 1 })
  rating: number;
  @Column('integer')
  imageId!: number;
}
