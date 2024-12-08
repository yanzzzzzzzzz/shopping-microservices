import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ProductVariant {
  constructor() {
    this.variantName = '';
  }
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('int')
  productId!: number;

  @Column()
  variantName: string;

  @Column('numeric')
  price!: number;

  @Column('int')
  inventory!: number;
  @Column('integer')
  imageId!: number;
}
