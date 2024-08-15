import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Specification {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;
}
