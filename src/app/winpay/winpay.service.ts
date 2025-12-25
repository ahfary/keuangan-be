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
  InquiryStatus,
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
import { ResponseSuccess } from 'src/interface/response.interface';
import BaseResponse from 'src/utils/response.utils';
@Injectable()
export class WinpayService extends BaseResponse {
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
    super();
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

  generateExpiredDate(hours = 48): string {
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
      // const privKey = fs.readFileSync('winpay-private.pem');
      const privKey: any = process.env.WINPAY_PRIVATE_KEY?.replace(
        /\\n/g,
        '\n',
      );
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

      // return dto.bulan
      try {
        const { data } = await firstValueFrom(
          this.http.post(process.env.SNAP_BASE_URL + endpointUrl, payload, {
            headers,
            timeout: 20000,
          }),
        );
        this.logger.log(`[SNAP] [${channel}] VA created`);

        //simpan ke tables history payload dan response
        await this.winpay.save({
          payload: JSON.stringify(payload),
          response: JSON.stringify(data),
          nisn: dto.nisn,
          customerNo: data.virtualAccountData.customerNo,
          jenis: dto.jenis as any,
          bulan: dto.bulan as any,
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
      // const privKey = fs.readFileSync('winpay-private.pem');
      const privKey: any = process.env.WINPAY_PRIVATE_KEY?.replace(
        /\\n/g,
        '\n',
      );

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

  async inquiryVaStatus(dto: InquiryStatus, channel?: string) {
    try {
      const httpMethod = 'POST';
      const endpointUrl: any = '/v1.0/transfer-va/status';
      const timestamp = new Date().toISOString();
      const payload = {
        virtualAccountNo: dto.virtualAccountNo,
        additionalInfo: {
          contractId: dto.additionalInfo.contractId,
          channel: dto.additionalInfo.channel,
          trxId: dto.additionalInfo.trxId,
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
      // const privKey = fs.readFileSync('winpay-private.pem');
      const privKey: any = process.env.WINPAY_PRIVATE_KEY?.replace(
        /\\n/g,
        '\n',
      );

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

        this.logger.log(`[SNAP] [${channel}] Inquiry Status VA success`);
        return { channel, data };
      } catch (err) {
        return err;
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
    // const privKey = fs.readFileSync('winpay-private.pem');
    const privKey: any = process.env.WINPAY_PRIVATE_KEY?.replace(/\\n/g, '\n');

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

      console.log(cust);

      // Jalankan proses setelah response dikirim
      setImmediate(async () => {
        try {
          if (cust?.jenis === 'uangsaku') {
            await this.transaksi.topUpSantriWinpay(
              cust.nisn,
              Number(dto.paidAmount.value),
            );
            await this.winpay.update(cust.id, {
              status: status.SUCCESS,
            });
            console.log('success');
          } else {
            const data = {
              jenis: cust?.jenis,
              nisn: cust?.nisn,
              jumlah: dto.paidAmount.value,
              bulan: cust.bulan,
              tahun: cust.tahun,
            };

            await axios.post(
              'https://www.lapuang.daffahafizhfirdaus.web.id/payments/bayar',
              data,
            );
          }
        } catch (err) {
          console.error('Gagal memproses callback async:', err);
        }
      });

      // Response dikirim segera, tanpa menunggu proses di atas
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
  async signatureCallback() {
    const path = '/sandbox_prod/url_listener.php/v1.0/transfer-va/payment';
    const timestamp = '2024-01-11T08:57:55+07:00'; //ambil dari header X-Timestamp
    const signature =
      'Zng8tJgtK2lPd8CP89KyO1OGEKXn1tFfXevTGIn5IhHYDpobp7+4uvuczP5HwldghO5mzkh03v6wnggoZev8M2RyKegbrRaIr66KbAgr6sfKfH9MfkXFcEKpF/am8QMr4oExKPdYTdGEr6pq6m1CzUjFQsyu9z6JuMGrjXrxFXU='; //ambil dari header X-Signature
    const httpMethod = 'POST';
    const partnerId = '170041'; //ambil dari header X-Partner-Id
    const body = {
      partnerServiceId: '    9042',
      customerNo: '00000009',
      virtualAccountNo: '    904200000009',
      virtualAccountName: 'WINPAY - fiandi',
      trxId: 'INV-000000023220',
      paymentRequestId: '45539',
      paidAmount: {
        value: '10000.00',
        currency: 'IDR',
      },
      trxDateTime: '2024-01-11T08:57:55+07:00',
      additionalInfo: {
        contractId: 'si1cd5671d-2ffe-4cca-aff0-b8ee9bc1c041',
        channel: 'BSI',
      },
    };
    const payload = JSON.stringify(body);
    const stringToSignArr = [
      httpMethod,
      path,
      crypto.createHash('sha256').update(payload).digest('hex'),
      timestamp,
    ];
    const stringToSign = stringToSignArr.join(':');
    try {
      const publicKey = fs.readFileSync('publicKey.pem');
      const verify = crypto
        .createVerify('sha256')
        .update(stringToSign)
        .verify(publicKey, Buffer.from(signature, 'base64'));
      if (!verify) {
        const response = {
          message: 'Cannot verify signature',
        };
        console.log(response);
      } else {
        const response = {
          responseCode: '2002500',
          responseMessage: 'Successful',
        };
        console.log(response);
      }
    } catch (error) {
      const response = {
        message: 'Invalid signature {' + error.message + '}',
      };
      console.log(response);
    }
  }

  async getWinpayHistoryByNisn(nisn: string): Promise<ResponseSuccess> {
    const history = await this.winpay.find({
      where: { nisn },
    });
    return this.success('Winpay history retrieved', history);
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
