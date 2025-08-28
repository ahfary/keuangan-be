// src/mail/mail.module.ts
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST || 'sandbox.smtp.mailtrap.io',
        port: 2525,
        secure: false,
        auth: {
          user: process.env.MAIL_USER || '4b7edf748f4f52',
          pass: process.env.MAIL_PASS || 'caeffa9b67f840',
        },
      },
      defaults: {
        from: 'SakuSantri <no-reply@yourapp.com>',
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
