import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('transaction_history')
export class TransactionHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderId: string;

  @Column()
  transactionStatus: string;

  @Column({ nullable: true })
  fraudStatus: string;

  @Column({ nullable: true })
  paymentType: string;

  @Column({ type: 'int' })
  grossAmount: number;

  @Column()
  statusCode: string;

  @Column()
  signatureKey: string;

  @CreateDateColumn()
  createdAt: Date;
}
