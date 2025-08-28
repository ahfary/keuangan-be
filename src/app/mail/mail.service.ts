import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendResetPassword(email: string, token: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Kode Reset Password',
      text: `Kode reset password kamu: ${token}`,
      html: `<p>Kode reset password kamu adalah:</p>
             <h2>${token}</h2>
             <p>Kode ini hanya berlaku selama 1 Jam!.</p>
             <p>Jangan Berikan Kode Ini Ke Siapapun</p>
             `,
    });
  }
}
