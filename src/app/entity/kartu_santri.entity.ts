import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Santri } from './santri.entity';

@Entity()
export class Kartu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nomorKartu: string;

  @Column()
  password:string

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;

  @OneToOne(() => Santri, (santri) => santri.kartu, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'santriId' }) // FK ada di tabel kartu
  santri: Santri;
}
