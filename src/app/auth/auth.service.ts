import {
  BadRequestException,
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
import { role, User } from '../entity/user.entity';
import { ResponseSuccess } from 'src/interface/response.interface';
import BaseResponse from 'src/utils/response.utils';
import { MailService } from '../mail/mail.service';
import { Santri } from '../entity/santri.entity';
import { Parent } from '../entity/parent.entity';

@Injectable()
export class AuthService extends BaseResponse {
  constructor(
    @InjectRepository(User) private readonly auth: Repository<User>,
    @InjectRepository(Santri) private readonly santri: Repository<Santri>,
    @InjectRepository(Parent) private readonly parent: Repository<Parent>,
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

  async refreshToken(id: number, token: string): Promise<ResponseSuccess> {
    const checkUserExists = await this.auth.findOne({
      where: {
        id: id,
        refresh_token: token,
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        refresh_token: true,
      },
    });

    console.log('user', checkUserExists);
    if (checkUserExists === null) {
      throw new UnauthorizedException();
    }

    const jwtPayload: jwtPayload = {
      id: checkUserExists.id,
      username: checkUserExists.name,
      email: checkUserExists.email,
      role: checkUserExists.role,
    };

    const access_token = await this.generateJWT(
      jwtPayload,
      '1d',
      process.env.ACCESS_TOKEN_SECRET!,
    );

    const refresh_token = await this.generateJWT(
      jwtPayload,
      '1d',
      process.env.REFRESH_TOKEN_SECRET!,
    );

    await this.auth.save({
      refresh_token: refresh_token,
      id: checkUserExists.id,
    });

    return this.success('Success', {
      ...checkUserExists,
      access_token: access_token,
      refresh_token: refresh_token,
    });
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

    const hashed = payload.password = await hash(payload.password, 12);
    const user = await this.auth.create({
      name: payload.name,
      email: payload.email,
      password: hashed,
      role: payload.role as role,
    });
    
    await this.auth.save(user);
    return this.success('Register Success', user);
  }

  async generateWalsan(santriId: number): Promise<ResponseSuccess> {
  const santri = await this.santri.findOne({
    where: { id: santriId },
    relations: ['parent'],
  });

  if (!santri) {
    throw new NotFoundException('Santri tidak ditemukan');
  }

  if (santri.parent) {
    throw new ConflictException('Santri sudah memiliki walsan');
  }

  // generate akun user untuk parent
  const random = Math.floor(1000 + Math.random() * 9000);
  const email = `walsan_${santri.name}${random}@smkmq.com`;
  const name = `Walsan ${santri.name}`;

  const exist = await this.auth.findOne({ where: { email } });
  if (exist) {
    throw new BadRequestException('Email sudah digunakan, coba generate lagi');
  }

  const password = await hash('smkmqbisa', 12);

  // buat User untuk Parent
  const user = this.auth.create({
    name,
    email,
    password,
    role: role.WALISANTRI,
  });
  await this.auth.save(user);

  // buat Parent
  const parent = this.parent.create({
    name,
    user,
  });
  await this.parent.save(parent);

  // assign Parent ke Santri
  santri.parent = parent;
  await this.santri.save(santri);

  return this.success('Generate Akun Walsan Success', {
    user,
    parent,
    santri,
  });
}


  async login(payload: LoginDto): Promise<any> {
    const checkUserExists = await this.auth.findOne({
      where: {
        email: payload.email,
      },
      relations : ['parent', 'parent.santri']
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

    // return { message: 'Kode reset password berhasil dikirim ke email' };
    return this.success('Kode reset password berhasil dikirim ke email', token);
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
