import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TransactionHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderId: string;

  @Column()
  transactionStatus: string;

  @Column()
  fraudStatus: string;

  @Column()
  paymentType: string;

  @Column()
  grossAmount: number;

  @Column()
  statusCode: string;

  @Column()
  signatureKey: string;

  @CreateDateColumn()
  createdAt: Date;
}
