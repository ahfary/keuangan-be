import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Kategori } from './kategori.entity';
import { HistoryItem } from './history_item.entity';

@Entity()
export class Items {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nama: string;

  @Column()
  harga: number;

  @Column({ nullable: true })
  kategoriId: number;

  @ManyToOne(() => Kategori, (kategori) => kategori.items, {
    nullable: true,
    onDelete: 'SET NULL', // Jika kategori dihapus, set FK menjadi NULL
  })
  @JoinColumn({ name: 'kategoriId' })
  kategori: Kategori;

  @Column({ default: 0 })
  jumlah: number;

  @Column()
  gambar: string;

  @Column({nullable:true})
  barcode:string;

  @OneToMany(() => HistoryItem, (historyItem) => historyItem.item)
  historyItems: HistoryItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
