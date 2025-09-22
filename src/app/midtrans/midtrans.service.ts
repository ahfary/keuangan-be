import { Injectable, InternalServerErrorException } from '@nestjs/common';
import BaseResponse from 'src/utils/response.utils';
import * as Midtrans from 'midtrans-client';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionHistory } from '../entity/history_midtrans.entity';
import { Santri } from '../entity/santri.entity';

@Injectable()
export class MidtransService extends BaseResponse {
  private snap: Midtrans.Snap;

  constructor(
    private configService: ConfigService,
    @InjectRepository(TransactionHistory)
    private historyRepo: Repository<TransactionHistory>,
    @InjectRepository(Santri)
    private santriRepo: Repository<Santri>,
  ) {
    super();
    this.snap = new Midtrans.Snap({
      isProduction: this.configService.get<string>('MIDTRANS_IS_PRODUCTION') === 'true',
      serverKey: this.configService.get<string>('MIDTRANS_SERVER_KEY'),
      clientKey: this.configService.get<string>('MIDTRANS_CLIENT_KEY'),
    });
  }

  async createTransaction(dto: any) {
    const { orderId, grossAmount, items } = dto;

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Number(grossAmount),
      },
      item_details: items,
    };

    try {
      const transaction = await this.snap.createTransaction(parameter);
      return this.success('Success', transaction);
    } catch (error) {
      console.error('Midtrans Error:', error.ApiResponse || error.message);
      throw new InternalServerErrorException('Gagal membuat transaksi Midtrans.');
    }
  }

  async handleNotification(notification: any) {
  console.log('📩 Notif Midtrans:', JSON.stringify(notification, null, 2));

  const serverKey = this.configService.get<string>('MIDTRANS_SERVER_KEY');

  // Hitung signature yang seharusnya
  const expectedSignature = crypto.createHash('sha512')
    .update(notification.order_id + notification.status_code + notification.gross_amount + serverKey)
    .digest('hex');

  console.log('🔑 Expected Signature:', expectedSignature);
  console.log('🔑 Incoming Signature:', notification.signature_key);

  // Validasi signature
  if (expectedSignature !== notification.signature_key) {
    console.error('❌ Invalid signature, notif diabaikan');
    return { valid: false, message: 'Invalid signature' };
  }

  // Simpan ke transaction_history
  const history = this.historyRepo.create({
    orderId: notification.order_id,
    transactionStatus: notification.transaction_status,
    fraudStatus: notification.fraud_status,
    paymentType: notification.payment_type,
    grossAmount: parseInt(notification.gross_amount, 10),
    statusCode: notification.status_code,
    signatureKey: notification.signature_key,
  });
  await this.historyRepo.save(history);

  // Kalau transaksi berhasil → update saldo santri
  if (
    notification.transaction_status === 'settlement' ||
    (notification.transaction_status === 'capture' && notification.fraud_status === 'accept') ||
    notification.transaction_status === 'success' // kalau dashboard ngirim success
  ) {
    const santriId = this.extractSantriIdFromOrder(notification.order_id);

    const santri = await this.santriRepo.findOne({ where: { id: santriId } });
    if (santri) {
      santri.saldo += parseInt(notification.gross_amount, 10);
      await this.santriRepo.save(santri);
      console.log(`✅ Saldo santri ${santri.name} bertambah +${notification.gross_amount}`);
    }
  }

  return { valid: true, message: 'Notification processed & saved' };
}

private extractSantriIdFromOrder(orderId: string): number {
  // contoh orderId = TOPUP-SANTRI-15-1695392023
  const parts = orderId.split('-');
  return parseInt(parts[2], 10);
}

}
