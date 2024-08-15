import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Specification } from './Specification';

@Entity()
export class ProductSpecification {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  productId!: number;

  @Column()
  specId!: number;

  @ManyToOne(() => Specification)
  @JoinColumn({ name: 'specId' })
  specification!: Specification;

  @Column()
  specValue!: string;
}
