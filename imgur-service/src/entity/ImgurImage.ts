import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('imgur_images')
export class ImgurImage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  imageUrl!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  deleteHash!: string;

  @CreateDateColumn({ type: 'timestamp' })
  uploadTime!: Date;
}
