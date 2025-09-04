import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Santri } from './santri.entity';

@Entity(    )
export class Parent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;

  @OneToMany(() => Santri, (santri) => santri.parent)
  santri: Santri[];

  @OneToOne(() => User, (user) => user.parent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
