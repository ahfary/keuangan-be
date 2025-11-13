import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import axios, { AxiosError } from 'axios';
import {
  createSnapSignature,
  nowJakartaISO,
} from './utils/snap-signature.util';
import { CreateVaDto } from './winpay.dto';
import { loadPrivateKey } from './utils/key-loader.util';
import * as crypto from 'crypto';
import * as fs from 'fs';
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

  async sendCreateVa(dto: CreateVaDto, channel?: string) {
    try {
      const httpMethod = 'POST';
      const endpointUrl: any = process.env.SNAP_BASE_URL;
      const timestamp = new Date().toISOString();
      const payload = `
{
    "customerNo": "08123456789",
    "virtualAccountName": "CHUS PANDI",
    "trxId": "INV-000000001",
    "totalAmount": {
        "value": "10000.00",
        "currency": "IDR"
    },
    "virtualAccountTrxType": "c",
    "expiredDate": "2023-11-02T17:18:48+07:00",
    "additionalInfo": {
        "channel": "BSI"
    }
}
`;
      const body = JSON.parse(payload);
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
          this.http.post(endpointUrl, payload, { headers, timeout: 20000 }),
        );
        this.logger.log(`[SNAP] [${channel}] VA created trxId=${dto.trxId}`);
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
    // try {
    //   const { data } = await firstValueFrom(
    //     this.http.post(url, payload, { headers, timeout: 20000 }),
    //   );
    //   this.logger.log(
    //     `[SNAP] [${channel}] VA created trxId=${dto.trxId}, response=${JSON.stringify(
    //       data,
    //     )}`,
    //   );
    //   return { channel, data };
    // } catch (err) {
    //   const e = err as AxiosError;
    //   this.logger.error(`[SNAP] [${channel}] Create VA failed: ${e.message}`);
    //   if (e.response) this.logger.error(JSON.stringify(e.response.data));
    //   return {
    //     channel,
    //     error: e.response?.data || e.message,
    //   };
    // }
  }

  /** Buat VA untuk 1 channel */
  async createVa(dto: CreateVaDto, channel?: string) {
    const targetChannel = channel || dto.channel || this.channels[0];
    return this.sendCreateVa(dto, targetChannel);
  }

  /** Buat VA untuk semua channel di .env (paralel) */
  async createVaMultiChannel(dto: CreateVaDto) {
    const results = await Promise.all(
      this.channels.map((ch) => this.sendCreateVa(dto, ch)),
    );
    return {
      message: `VA created for ${this.channels.length} channel(s)`,
      results,
    };
  }
}
