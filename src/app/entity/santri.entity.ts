import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
// Import yang salah sebelumnya: import { HistoryItem } from './history_item.entity';
import { History } from './history.entity'; // 1. Tambahkan import untuk History
import { Cart } from './cart.entity';

@Entity()
export class Santri {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  kelas: string;

  @Column({ type: 'int', default: 0 })
  saldo: number;

  @Column({ type: 'int', nullable: true })
  hutang: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Cart, (cart) => cart.santri)
  cart: Cart;

  @OneToMany(() => History, (history) => history.santri)
  history: History[];
}