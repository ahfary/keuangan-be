import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne, // Pastikan ini di-import
  OneToMany,
  JoinColumn, // Pastikan ini di-import
} from 'typeorm';
import { Santri } from './santri.entity'; // Pastikan path import benar
import { HistoryItem } from './history_item.entity';

export enum status{
  LUNAS = 'Lunas',
  HUTANG = 'Hutang',
}

@Entity()
export class History {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  santriId: number;

  @Column()
  totalAmount: number;

  @Column({type: 'enum', enum: status, default: status.LUNAS})
  status: status;

  // !! INI BAGIAN PENTING YANG HARUS ADA !!
  @ManyToOne(() => Santri, (santri) => santri.history, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'santriId' })
  santri: Santri; // Properti 'santri' inilah yang dicari oleh santri.entity.ts

  @OneToMany(() => HistoryItem, (item) => item.history)
  items: HistoryItem[];

  @CreateDateColumn()
  createdAt: Date;
}
