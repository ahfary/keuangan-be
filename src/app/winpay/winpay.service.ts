// import { Injectable, Logger } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { HttpService } from '@nestjs/axios';
// import { firstValueFrom } from 'rxjs';
// import { AxiosError } from 'axios';
// import {
//   createSnapSignature,
//   nowJakartaISO,
// } from './utils/snap-signature.util';
// import { CreateVaDto } from './winpay.dto';
// import { loadPrivateKey } from './utils/key-loader.util';

// @Injectable()
// export class WinpayService {
//   private readonly logger = new Logger(WinpayService.name);

//   private readonly baseUrl: string;
//   private readonly partnerId: string;
//   private readonly privateKeyPem: string;
//   private readonly prefix: string;
//   private readonly channels: string[];

//   constructor(
//     private readonly config: ConfigService,
//     private readonly http: HttpService,
//   ) {
//     this.baseUrl = this.config.get<string>('SNAP_BASE_URL')!;
//     this.partnerId = this.config.get<string>('SNAP_PARTNER_ID')!;
//     // this.privateKeyPem = this.config.get<string>('SNAP_PRIVATE_KEY_PEM')!;
// this.privateKeyPem = loadPrivateKey(__dirname + '/winpay-private-pkcs8.pem');
//     this.prefix = this.config.get<string>('SNAP_EXTERNAL_ID_PREFIX') || 'APP';

//     // Ambil daftar channel dari .env, pisahkan pakai koma
//     this.channels = this.config
//       .get<string>('SNAP_CHANNELS')
//       ?.split(',')
//       .map((c) => c.trim()) || ['BSI'];
//   }

//   /** Generate unique X-EXTERNAL-ID */
//   private generateExternalId() {
//     return `${this.prefix}-${Date.now()}`;
//   }

//   /** Core method to call Winpay SNAP API (create VA) */
//   private async sendCreateVa(dto: CreateVaDto, channel: string) {
//     const endpoint = '/v1.0/transfer-va/create-va';
//     const url = new URL(endpoint, this.baseUrl).toString();
//     const timestamp = nowJakartaISO();

//     const payload = {
//       customerNo: dto.customerNo,
//       virtualAccountName: dto.virtualAccountName,
//       trxId: dto.trxId,
//       totalAmount: { value: dto.amount, currency: 'IDR' },
//       virtualAccountTrxType: dto.virtualAccountTrxType,
//       expiredDate: dto.expiredDate,
//       additionalInfo: { channel },
//     };

//     const signature = createSnapSignature(
//       'POST',
//       endpoint,
//       payload,
//       timestamp,
//       this.privateKeyPem,
//     );

//     const headers = {
//       'Content-Type': 'application/json',
//       'X-TIMESTAMP': timestamp,
//       'X-SIGNATURE': signature,
//       'X-PARTNER-ID': this.partnerId,
//       'X-EXTERNAL-ID': this.generateExternalId(),
//       'CHANNEL-ID': channel,
//     };

//     try {
//       const { data } = await firstValueFrom(
//         this.http.post(url, payload, { headers, timeout: 20000 }),
//       );
//       this.logger.log(
//         `[SNAP] [${channel}] VA created trxId=${dto.trxId}, response=${JSON.stringify(
//           data,
//         )}`,
//       );
//       return { channel, data };
//     } catch (err) {
//       const e = err as AxiosError;
//       this.logger.error(`[SNAP] [${channel}] Create VA failed: ${e.message}`);
//       if (e.response) this.logger.error(JSON.stringify(e.response.data));
//       return {
//         channel,
//         error: e.response?.data || e.message,
//       };
//     }
//   }

//   /** Buat VA untuk 1 channel */
//   async createVa(dto: CreateVaDto, channel?: string) {
//     const targetChannel = channel || dto.channel || this.channels[0];
//     return this.sendCreateVa(dto, targetChannel);
//   }

//   /** Buat VA untuk semua channel di .env (paralel) */
//   async createVaMultiChannel(dto: CreateVaDto) {
//     const results = await Promise.all(
//       this.channels.map((ch) => this.sendCreateVa(dto, ch)),
//     );
//     return {
//       message: `VA created for ${this.channels.length} channel(s)`,
//       results,
//     };
//   }
// }
