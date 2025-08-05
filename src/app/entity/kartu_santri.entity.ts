import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Items } from './items.entity';
import { Santri } from './santri.entity';

@Entity()
export class Kartu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nomorKartu: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Santri, (santri) => santri.kartu)
  santri: Santri;
}
