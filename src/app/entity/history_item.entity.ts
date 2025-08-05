import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { History } from './history.entity';
import { Items } from './items.entity';

@Entity()
export class HistoryItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  historyId: number;

  @Column()
  itemId: number;

  @ManyToOne(() => History, (history) => history.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'historyId' })
  history: History;

  @ManyToOne(() => Items, (item) => item.historyItems, {
    onDelete: 'RESTRICT', // Mencegah item dihapus jika ada di histori
  })
  @JoinColumn({ name: 'itemId' })
  item: Items;

  @Column()
  quantity: number;

  @Column()
  priceAtPurchase: number;
}