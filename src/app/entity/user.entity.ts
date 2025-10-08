import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Parent } from './parent.entity';

export enum role {
  ADMIN = 'Admin',
  KASIR = 'Kasir',
  WALISANTRI = 'Walisantri',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({nullable: true, unique: true})
  username: string;

  @Column({ type: 'enum', enum: role, default: role.WALISANTRI })
  role: role; // admin, walisantri

  @Column()
  password: string;

  @Column({ type: 'varchar', length: 6, nullable: true }) 
  resetToken: string | null;

  @Column({ type: 'datetime', nullable: true })
  resetTokenExpiry: Date | null;

  @Column({ type: 'text', nullable: true })
  refresh_token: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Parent, (parent) => parent.user)
  parent: Parent;
}
