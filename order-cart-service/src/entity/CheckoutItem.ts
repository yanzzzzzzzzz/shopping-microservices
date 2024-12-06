import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { CheckoutRecord } from './CheckoutRecord';

@Entity('checkout_items')
export class CheckoutItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => CheckoutRecord, checkoutRecord => checkoutRecord.items, { onDelete: 'CASCADE' })
  checkoutRecord!: CheckoutRecord;

  @Column({ type: 'int' })
  productId!: number;

  @Column({ type: 'int', nullable: true })
  productVariantId!: number | null;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount!: number;
  @Column({ type: 'varchar', length: 5000, nullable: true })
  productName!: string | null;
  @Column({ type: 'varchar', length: 500, nullable: true })
  variantName!: string | null;
  @Column({ type: 'int', nullable: true })
  imageId!: number | null;
}
