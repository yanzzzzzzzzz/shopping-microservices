import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { CheckoutItem } from './CheckoutItem';

@Entity('checkout_records')
export class CheckoutRecord {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50 })
  orderStatus!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  paymentTime!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  shipmentTime!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  completedTime!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  reviewTime!: Date | null;

  @Column({ type: 'int' })
  storeId!: number;

  @Column({ type: 'text' })
  shippingAddress!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  shippingFee!: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  couponUsed!: string | null;

  @Column({ type: 'varchar', length: 50 })
  paymentMethod!: string;

  @Column({ type: 'varchar', length: 50 })
  paymentStatus!: string;

  @Column()
  userId!: number;

  @OneToMany(() => CheckoutItem, checkoutItem => checkoutItem.checkoutRecord)
  items!: CheckoutItem[];
}
