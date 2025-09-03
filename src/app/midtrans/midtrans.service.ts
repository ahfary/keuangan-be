import { Injectable, InternalServerErrorException } from '@nestjs/common';
import BaseResponse from 'src/utils/response.utils';
import * as Midtrans from 'midtrans-client';
import { ConfigService } from '@nestjs/config';
import { CreateTransactionDto } from './midtrans.dto';
import * as crypto from 'crypto';

@Injectable()
export class MidtransService extends BaseResponse {
  private snap: Midtrans.Snap;

  constructor(private configService: ConfigService) {
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
        gross_amount: grossAmount,
      },
      item_details: items,
      // customer_details: {
      //   first_name: 'Budi',
      //   last_name: 'Utomo',
      //   email: 'budi.utomo@example.com',
      //   phone: '081234567890',
      // },
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
    console.log('Menerima notifikasi dari Midtrans:', JSON.stringify(notification, null, 2));

    // Verifikasi Signature Key
    const serverKey = this.configService.get<string>('MIDTRANS_SERVER_KEY');
    const hash = crypto
      .createHash('sha512')
      .update(
        notification.order_id +
          notification.status_code +
          notification.gross_amount +
          serverKey,
      )
      .digest('hex');

    if (hash !== notification.signature_key) {
      // console.error('Invalid signature key');
      return;
    }

    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    console.log(`Transaksi ${orderId}: status ${transactionStatus}, fraud ${fraudStatus}`);

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'accept') {
        console.log(`Pembayaran untuk order ${orderId} berhasil.`);
      }
    } else if (transactionStatus === 'settlement') {
      console.log(`Pembayaran untuk order ${orderId} telah diselesaikan.`);
    } else if (
      transactionStatus === 'cancel' ||
      transactionStatus === 'deny' ||
      transactionStatus === 'expire'
    ) {
      console.log(`Pembayaran untuk order ${orderId} gagal.`);
    } else if (transactionStatus === 'pending') {
      console.log(`Pembayaran untuk order ${orderId} masih pending.`);
    }
  } 
}
