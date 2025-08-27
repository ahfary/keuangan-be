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
import { Kartu } from './kartu_santri.entity';

enum Jurusan {
  TKJ = 'TKJ',
  RPL = 'RPL',
}

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

  @Column({ type: 'enum', enum: Jurusan, default: Jurusan.RPL })
  jurusan: Jurusan;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => History, (history) => history.santri)
  history: History[];

  @OneToOne(() => Kartu, (kartu) => kartu.santri)
  kartu: Kartu; // Bukan owner, jadi nggak ada @JoinColumn
}
