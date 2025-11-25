import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as Midtrans from 'midtrans-client';
import * as crypto from 'crypto';
import { Santri } from '../entity/santri.entity';
import { TransaksiService } from '../transaksi/transaksi.service';
import { TransactionHistory } from '../entity/history_midtrans.entity';

@Injectable()
export class MidtransService {
  private snap: Midtrans.Snap;

  constructor(
    private readonly transaksiService: TransaksiService, // ⬅️ injek TransaksiService
    private readonly configService: ConfigService,
    @InjectRepository(TransactionHistory)
    private readonly historyRepo: Repository<TransactionHistory>,
    @InjectRepository(Santri)
    private readonly santriRepo: Repository<Santri>,
  ) {
    this.snap = new Midtrans.Snap({
      isProduction: this.configService.get<string>('MIDTRANS_IS_PRODUCTION') === 'true',
      serverKey: this.configService.get<string>('MIDTRANS_SERVER_KEY'),
      clientKey: this.configService.get<string>('MIDTRANS_CLIENT_KEY'),
    });
  }

  /**
   * Create transaction di Midtrans
   */
  async createTransaction(dto: { santriId: number; grossAmount: number }) {
    const { santriId, grossAmount } = dto;

    const orderId = `TOPUP-SANTRI-${santriId}-${Date.now()}`;
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Number(grossAmount),
      },
    };

    try {
      const transaction = await this.snap.createTransaction(parameter);

      // simpan history awal
      const history = this.historyRepo.create({
        orderId,
        transactionStatus: 'pending',
        fraudStatus: '-',
        paymentType: '-',
        grossAmount,
        statusCode: '201',
        signatureKey: '-',
      });
      await this.historyRepo.save(history);

      return {
        status: 'success',
        data: {
          token: transaction.token,
          redirect_url: transaction.redirect_url,
        },
      };
    } catch (error) {
      console.error('Midtrans Error:', error.ApiResponse || error.message);
      throw new InternalServerErrorException('Gagal membuat transaksi Midtrans.');
    }
  }

  /**
   * Handle notifikasi dari Midtrans
   */
  async handleNotification(notification: any) {
  console.log('📩 Notif Midtrans:', JSON.stringify(notification, null, 2));

  const serverKey = this.configService.get<string>('MIDTRANS_SERVER_KEY');

  // ⚠️ Perhatikan: gross_amount HARUS string (apa adanya dari payload Midtrans)
  const expectedSignature = crypto
    .createHash('sha512')
    .update(
      notification.order_id +
      notification.status_code +
      notification.gross_amount + // jangan parseInt, harus sama persis
      serverKey,
    )
    .digest('hex');

  console.log('🔑 Expected:', expectedSignature);
  console.log('🔑 Incoming:', notification.signature_key);

  if (expectedSignature !== notification.signature_key) {
    console.error('❌ Invalid signature');
    return { valid: false, message: 'Invalid signature' };
  }

  // simpan history transaksi
  const history = this.historyRepo.create({
    orderId: notification.order_id,
    transactionStatus: notification.transaction_status,
    fraudStatus: notification.fraud_status,
    paymentType: notification.payment_type,
    grossAmount: parseInt(notification.gross_amount, 10), // boleh parseInt untuk simpan
    statusCode: notification.status_code,
    signatureKey: notification.signature_key,
  });
  await this.historyRepo.save(history);

  // handle status transaksi
  switch (notification.transaction_status) {
    case 'pending':
      console.log('⏳ Masih pending, belum update saldo');
      break;

    case 'capture':
      if (notification.fraud_status === 'accept') {
        await this.processSettlement(notification);
      }
      break;

    case 'settlement':
      await this.processSettlement(notification);
      break;

    case 'deny':
    case 'cancel':
    case 'expire':
      console.log('❌ Transaksi gagal/dibatalkan/expired');
      break;

    default:
      console.log('ℹ️ Status tidak dikenali:', notification.transaction_status);
  }

  return { valid: true, message: 'Notification processed' };
}


  private async processSettlement(notification: any) {
    const santriId = this.extractSantriIdFromOrder(notification.order_id);
    const jumlah = parseInt(notification.gross_amount, 10);
    
    // 👉 Panggil service transaksi
    // await this.transaksiService.topUpSantri(santriId, jumlah);
    console.log(`✅ TopUp berhasil untuk santriId ${santriId} sejumlah ${jumlah}`);
  }

  private extractSantriIdFromOrder(orderId: string): number {
    const parts = orderId.split('-');
    return parseInt(parts[2], 10);
  }
}
