import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  Column,
} from 'typeorm';
import { Santri } from './santri.entity';
import { CartItem } from './cart_item.entity';

@Entity()
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  santriId: number;

  @OneToOne(() => Santri, (santri) => santri.cart, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'santriId' })
  santri: Santri;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart)
  items: CartItem[];

  @CreateDateColumn()
  createdAt: Date;
  cartItems: any;
}