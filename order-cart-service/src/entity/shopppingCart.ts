import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ShoppingCart {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  productId!: number;

  @Column()
  productVariantId!: number;

  @Column()
  amount!: number;

  @Column()
  userId!: number;
}
