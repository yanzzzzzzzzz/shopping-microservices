import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true }) // account name
  username!: string;

  @Column()
  password!: string;

  @Column({ unique: true })
  email!: string;

  @CreateDateColumn()
  createdAt!: Date;
  @Column({ nullable: true })
  phone?: string;

  @Column({ type: 'char', nullable: true })
  sex?: 'M' | 'F' | 'O';

  @Column({ type: 'date', nullable: true })
  birthday?: Date;

  @Column({ name: 'imageUrl', nullable: true })
  imageId?: number;

  @Column({ nullable: true }) //user personal name
  name?: string;
}
