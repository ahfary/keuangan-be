import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Santri } from './santri.entity';

@Entity()
export class HistoryTransaksi {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Santri, (santri) => santri.history, { eager: true })
  santri: Santri;

  @Column()
  jumlah: number;

  @CreateDateColumn()
  createdAt: Date;
}
