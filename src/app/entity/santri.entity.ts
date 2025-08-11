import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { History } from './history.entity';
import { Cart } from './cart.entity';
import { Kartu } from './kartu_santri.entity';

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

  @Column({ type: 'int', default: 0 })
  hutang: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Cart, (cart) => cart.santri)
  cart: Cart;

  @OneToMany(() => History, (history) => history.santri)
  history: History[];

  @OneToOne(() => Kartu, (kartu) => kartu.santri)
  kartu: Kartu; // Bukan owner, jadi nggak ada @JoinColumn
}
