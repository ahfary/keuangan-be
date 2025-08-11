import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Cart } from './cart.entity';
import { Items } from './items.entity';

@Entity()
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 1 })
  quantity: number;

  @Column()
  cartId: number;

  @Column()
  itemId: number;

  @ManyToOne(() => Cart, (cart) => cart.cartItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cartId' })
  cart: Cart;

  @ManyToOne(() => Items, (item) => item.cartItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'itemId' })
  item: Items;
}