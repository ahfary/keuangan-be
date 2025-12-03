import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Santri } from './santri.entity';

@Entity()
export class HistoryTransaksi {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Santri, (santri) => santri.history, { eager: true, onDelete: 'CASCADE' , nullable: true})
  santri: Santri | null;

  @Column()
  jumlah: number;

  @CreateDateColumn()
  createdAt: Date;
}
