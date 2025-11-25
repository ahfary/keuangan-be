import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import axios, { AxiosError } from 'axios';
import {
  createSnapSignature,
  nowJakartaISO,
} from './utils/snap-signature.util';
import {
  CreateVaDto,
  InquiryVaDto,
  PaymentCallbackDto,
  VirtualAccountTrxType,
} from './winpay.dto';
import { loadPrivateKey } from './utils/key-loader.util';
import * as crypto from 'crypto';
import * as fs from 'fs';
import { InjectRepository } from '@nestjs/typeorm';
import { status, WinpayHistory } from '../entity/winpay_history.entity';
import { Repository } from 'typeorm';
import { Santri } from '../entity/santri.entity';
import { TransaksiService } from '../transaksi/transaksi.service';
@Injectable()
export class WinpayService {
  private readonly logger = new Logger(WinpayService.name);

  private readonly baseUrl: string;
  private readonly partnerId: string;
  private readonly privateKeyPem: string;
  private readonly prefix: string;
  private readonly channels: string[];

  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService,
    @InjectRepository(WinpayHistory)
    private readonly winpay: Repository<WinpayHistory>,
    @InjectRepository(Santri) private readonly santri: Repository<Santri>,
    private readonly transaksi: TransaksiService,
  ) {
    this.baseUrl = this.config.get<string>('SNAP_BASE_URL')!;
    this.partnerId = this.config.get<string>('SNAP_PARTNER_ID')!;
    this.prefix = this.config.get<string>('SNAP_EXTERNAL_ID_PREFIX') || 'APP';

    this.channels = this.config
      .get<string>('SNAP_CHANNELS')
      ?.split(',')
      .map((c) => c.trim()) || ['BSI'];
  }

  private generateExternalId() {
    return `${this.prefix}-${Date.now()}`;
  }

  generateExpiredDate(hours = 24): string {
    const date = new Date();
    date.setHours(date.getHours() + hours);

    const pad = (n: number) => String(n).padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hour = pad(date.getHours());
    const minute = pad(date.getMinutes());
    const second = pad(date.getSeconds());

    return `${year}-${month}-${day}T${hour}:${minute}:${second}+07:00`;
  }

  generateTrxIdAuto(): string {
    const timestamp = Date.now().toString().slice(-9); // ambil 9 digit terakhir timestamp
    return `INV-${timestamp}`;
  }

  async sendCreateVa(dto: CreateVaDto, channel?: string) {
    try {
      const httpMethod = 'POST';
      const endpointUrl: any = '/v1.0/transfer-va/create-va';
      const timestamp = new Date().toISOString();

      const payload: any = {
        customerNo: dto.customerNo,
        trxId: this.generateTrxIdAuto(),
        virtualAccountName: dto.virtualAccountName,
        totalAmount: {
          value: dto.totalAmount.value,
          currency: dto.totalAmount.currency,
        },
        virtualAccountTrxType: dto.virtualAccountTrxType,
        expiredDate: this.generateExpiredDate(),
        additionalInfo: {
          channel: channel || 'BSI',
        },
      };

      //       const payload = `
      // {
      //   "partnerServiceId": "27",
      //   "customerNo": "08123456789",
      //   "virtualAccountNo": "",
      //   "virtualAccountName": "CHUS PANDI",
      //   "trxId": "INV-000000002",
      //   "totalAmount": {
      //     "value": "10000.00",
      //     "currency": "IDR"
      //   },
      //   "virtualAccountTrxType": "c",
      //   "expiredDate": "2025-11-20T21:22:10+07:00",
      //   "additionalInfo": {
      //     "channel": "BSI"
      //   }
      // }
      // `;
      // const body = JSON.parse(payload);
      const body = payload;
      console.log(body);
      const hashedBody = crypto
        .createHash('sha256')
        .update(JSON.stringify(body, null, 0))
        .digest('hex')
        .toLowerCase();
      let stringToSign: any = [httpMethod, endpointUrl, hashedBody, timestamp];
      let signature = '';
      stringToSign = stringToSign.join(':');
      const privKey = fs.readFileSync('winpay-private.pem');
      const sign = crypto.createSign('RSA-SHA256');
      sign.update(stringToSign);
      signature = sign.sign(privKey, 'base64');
      console.log('Your Signature:', signature);
      // console.log(stringToSign);

      const headers = {
        'Content-Type': 'application/json',
        'X-TIMESTAMP': timestamp,
        'X-SIGNATURE': signature,
        'X-PARTNER-ID': this.partnerId,
        'X-EXTERNAL-ID': this.generateExternalId(),
        'CHANNEL-ID': 'WEB',
      };

      // return headers
      try {
        const { data } = await firstValueFrom(
          this.http.post(process.env.SNAP_BASE_URL + endpointUrl, payload, {
            headers,
            timeout: 20000,
          }),
        );
        this.logger.log(`[SNAP] [${channel}] VA created trxId=${dto.trxId}`);

        //simpan ke tables history payload dan response
        await this.winpay.save({
          payload: JSON.stringify(payload),
          response: JSON.stringify(data),
          nisn: dto.nisn,
          customerNo: data.virtualAccountData.customerNo,
          jenis: dto.jenis,
          bulan: dto.bulan,
          tahun: dto.tahun,
          status: status.PENDING,
        });
        // simpan nisn, cusotmer no, jenis, status default penndig ke tabel cari namanya

        return { channel, data };
      } catch (err) {
        const e = err as AxiosError;
        this.logger.error(`[SNAP] [${channel}] Create VA failed: ${e.message}`);
        if (e.response) this.logger.error(JSON.stringify(e.response.data));
        return { channel, error: e.response?.data || e.message };
      }
    } catch (err) {
      console.log(err);
    }
  }

  async inquiryVa(dto: InquiryVaDto, channel?: string) {
    try {
      const httpMethod = 'POST';
      const endpointUrl: any = '/v1.0/transfer-va/inquiry-va';
      const timestamp = new Date().toISOString();
      const payload = {
        trxId: dto.trxId,
        additionalInfo: {
          contractId: dto.additionalInfo.contractId,
        },
      };
      const body = payload;
      console.log(body);
      const hashedBody = crypto
        .createHash('sha256')
        .update(JSON.stringify(body, null, 0))
        .digest('hex')
        .toLowerCase();
      let stringToSign: any = [httpMethod, endpointUrl, hashedBody, timestamp];
      let signature = '';
      stringToSign = stringToSign.join(':');
      const privKey = fs.readFileSync('winpay-private.pem');
      const sign = crypto.createSign('RSA-SHA256');
      sign.update(stringToSign);
      signature = sign.sign(privKey, 'base64');
      console.log('Your Signature:', signature);

      const headers = {
        'Content-Type': 'application/json',
        'X-TIMESTAMP': timestamp,
        'X-SIGNATURE': signature,
        'X-PARTNER-ID': this.partnerId,
        'X-EXTERNAL-ID': this.generateExternalId(),
        'CHANNEL-ID': 'WEB',
      };

      try {
        const { data } = await firstValueFrom(
          this.http.post(process.env.SNAP_BASE_URL + endpointUrl, payload, {
            headers,
            timeout: 20000,
          }),
        );

        this.logger.log(
          `[SNAP] [${channel}] Inquiry VA success trxId=${dto.trxId}`,
        );
        return { channel, data };
      } catch (err) {
        const e = err as AxiosError;
        this.logger.error(
          `[SNAP] [${channel}] Inquiry VA failed: ${e.message}`,
        );

        if (e.response) this.logger.error(JSON.stringify(e.response.data));

        return { channel, error: e.response?.data || e.message };
      }
    } catch (err) {
      return err;
    }
  }

  async callback(dto: PaymentCallbackDto, channel?: string) {
    const httpMethod = 'POST';
    const endpointUrl: any = '/v1.0/transfer-va/payment';
    const timestamp = new Date().toISOString();
    const payload = {
      partnerServiceId: dto.partnerServiceId,
      customerNo: dto.customerNo,
      virtualAccountNo: dto.virtualAccountNo,
      virtualAccountName: dto.virtualAccountName,
      trxId: dto.trxId,
      paidAmount: {
        value: dto.paidAmount.value,
        currency: dto.paidAmount.currency,
      },
      paymentRequestId: dto.paymentRequestId,
      additionalInfo: {
        channel: dto.additionalInfo.channel,
        contractId: dto.additionalInfo.contractId,
      },
    };
    const body = payload;
    // console.log(body);
    const hashedBody = crypto
      .createHash('sha256')
      .update(JSON.stringify(body, null, 0))
      .digest('hex')
      .toLowerCase();
    let stringToSign: any = [httpMethod, endpointUrl, hashedBody, timestamp];
    let signature = '';
    stringToSign = stringToSign.join(':');
    const privKey = fs.readFileSync('winpay-private.pem');
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(stringToSign);
    signature = sign.sign(privKey, 'base64');
    console.log('Your Signature:', signature);

    const headers = {
      'Content-Type': 'application/json',
      'X-TIMESTAMP': timestamp,
      'X-SIGNATURE': signature,
      'X-PARTNER-ID': this.partnerId,
      'X-EXTERNAL-ID': this.generateExternalId(),
      'CHANNEL-ID': 'WEB',
    };

    // return dto
    try {
      const cust: any = await this.winpay.findOne({
        where: {
          customerNo: dto.customerNo,
        },
      });

      if (cust?.jenis === 'SPP') {
        await this.transaksi.topUpSantri(
          cust.nisn,
          Number(dto.paidAmount.value),
        );
      } else {
        // kirim lap uang

        const v = { 
          jenis: cust?.jenis,
          nisn: cust?.nisn,
          jumlah: dto.paidAmount.value,
          bulan: cust.bulan,
          tahun: cust.tahun,
        };

        // await 
      }

      return {
        responseCode: '2002500',
        responseMessage: 'Successful',
      };
    } catch (err) {
      const e = err as AxiosError;
      this.logger.error(`[SNAP] [${channel}] Callback failed: ${e.message}`);

      if (e.response) this.logger.error(JSON.stringify(e.response.data));

      return { channel, error: e.response?.data || e.message };
    }
  }
}

[
  {
    kode: 'BRI',
    nama: 'Bank Rakyat Indonesia',
    virtualAccountTrxType: 'c',
  },
  {
    kode: 'BNI',
    nama: 'Bank Negara Indonesia',
    virtualAccountTrxType: 'c',
  },
  {
    kode: 'MANDIRI',
    nama: 'Bank Mandiri',
    virtualAccountTrxType: 'c',
  },
  {
    kode: 'PERMATA',
    nama: 'Bank Permata',
    virtualAccountTrxType: 'c',
  },
  {
    kode: 'BSI',
    nama: 'Bank Syariah Indonesia',
    virtualAccountTrxType: 'c',
  },
  {
    kode: 'MUAMALAT',
    nama: 'Bank Muamalat',
    virtualAccountTrxType: 'c',
  },
  {
    kode: 'BCA',
    nama: 'Bank Central ASIA',
    virtualAccountTrxType: 'c',
  },
  {
    kode: 'CIMB',
    nama: 'Bank CIMB NIAGA',
    virtualAccountTrxType: 'c',
  },
  {
    kode: 'SINARMAS',
    nama: 'Bank Sinarmas',
    virtualAccountTrxType: 'c',
  },
  {
    kode: 'BNC',
    nama: 'Bank Neo Commerce',
    virtualAccountTrxType: 'c',
  },
  {
    kode: 'INDOMARET',
    nama: 'Indomaret',
    virtualAccountTrxType: 'c',
  },
  {
    kode: 'ALFAMART',
    nama: 'Alfamart',
    virtualAccountTrxType: 'c',
  },
];
