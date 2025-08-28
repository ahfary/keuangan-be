import {
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { REQUEST } from '@nestjs/core';
import { LoginDto, RegisterDto } from './auth.dto';
import { Prisma } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { ResponseSuccess } from 'src/interface/response.interface';
import BaseResponse from 'src/utils/response.utils';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService extends BaseResponse {
  constructor(
    @InjectRepository(User) private readonly auth: Repository<User>,
    private jwtService: JwtService,
    @Inject(REQUEST) private req: any,
    private mailService: MailService,
  ) {
    super();
  }

  generateJWT(payload: jwtPayload, expiresIn: string | number, token: string) {
    return this.jwtService.sign(payload, {
      secret: token,
      expiresIn: expiresIn,
    });
  }

  async refreshToken(id: any, token: string): Promise<any> {
    const checkUserExists = await this.auth.findOne({
      // ✅ Menggunakan findFirst
      where: {
        id: id,
        refresh_token: token,
      },
    });

    if (!checkUserExists) {
      throw new UnauthorizedException(
        'Refresh token tidak valid atau user tidak ditemukan',
      );
    }

    const jwtPayload: jwtPayload = {
      id: checkUserExists.id,
      username: checkUserExists.name,
      email: checkUserExists.email,
      role: checkUserExists.role,
    };

    const access_token = this.generateJWT(
      jwtPayload,
      '1d',
      process.env.ACCESS_TOKEN_SECRET!,
    );
    const refresh_token = this.generateJWT(
      jwtPayload,
      '1d',
      process.env.REFRESH_TOKEN_SECRET!,
    );

    // ✅ Menggunakan update
    await this.auth.save({
      refresh_token: refresh_token,
      id: checkUserExists.id,
    });

    return { ...checkUserExists, access_token, refresh_token };
  }

  async register(payload: RegisterDto): Promise<ResponseSuccess> {
    const userExist = await this.auth.findOne({
      where: {
        email: payload.email,
      },
    });
    if (userExist) {
      throw new HttpException('User already exist', HttpStatus.FOUND);
    }

    payload.password = await hash(payload.password, 12);
    const user = await this.auth.save(payload);
    return this.success('Register Success', user);
  }

  async login(payload: LoginDto): Promise<any> {
    const checkUserExists = await this.auth.findOne({
      where: {
        email: payload.email,
      },
    });

    if (!checkUserExists) {
      throw new UnprocessableEntityException('User tidak ditemukan');
    }

    if (checkUserExists.role !== payload.role) {
      throw new UnauthorizedException(
        `Anda tidak memiliki hak akses sebagai ${payload.role}`,
      );
    }

    const checkPassword = await compare(
      payload.password,
      checkUserExists.password,
    );

    if (!checkPassword) {
      throw new UnprocessableEntityException('Email dan password tidak sesuai');
    }

    const jwtPayload: jwtPayload = {
      id: checkUserExists.id,
      username: checkUserExists.name,
      email: checkUserExists.email,
      role: checkUserExists.role,
    };

    const access_token = this.generateJWT(
      jwtPayload,
      '1d',
      process.env.ACCESS_TOKEN_SECRET!,
    );
    const refresh_token = this.generateJWT(
      jwtPayload,
      '1d',
      process.env.REFRESH_TOKEN_SECRET!,
    );

    await this.auth.update(
      {
        id: checkUserExists.id,
      },
      {
        refresh_token: refresh_token,
      },
    );

    delete (checkUserExists as any).password;

    return { ...checkUserExists, access_token, refresh_token };
  }

  async forgotPassword(email: string) {
  const user = await this.auth.findOne({ where: { email } });
  if (!user) throw new NotFoundException('User tidak ditemukan');

  // Generate OTP 6 digit
  const token = Math.floor(100000 + Math.random() * 900000).toString();

  // Expired 1 jam
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 1);

  user.resetToken = token;
  user.resetTokenExpiry = expiry;
  await this.auth.save(user);

  await this.mailService.sendResetPassword(user.email, token);

  return { message: 'Kode reset password berhasil dikirim ke email' };
}

async resetPassword(token: string, newPassword: string) {
  const user = await this.auth.findOne({ where: { resetToken: token } });
  if (!user) throw new NotFoundException('Token tidak valid');

  if (user.resetTokenExpiry! < new Date()) {
    throw new NotFoundException('Token sudah expired');
  }

  const hashed = await hash(newPassword, 12);
  user.password = hashed;
  user.resetToken = null;
  user.resetTokenExpiry = null;

  await this.auth.save(user);

  return { message: 'Password berhasil direset' };
}

  async profile(): Promise<any> {
    const user = await this.auth.findOne({
      where: {
        id: this.req.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }
    return { user };
  }
}
