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

@Injectable()
export class AuthService extends BaseResponse {
  constructor(
    @InjectRepository(User) private readonly auth: Repository<User>,
    private jwtService: JwtService,
    @Inject(REQUEST) private req: any,
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

  async loginAdmin(payload: LoginDto): Promise<any> {
    const checkUserExists = await this.auth.findOne({
      where: {
        email: payload.email,
      },
    });

    if (!checkUserExists) {
      throw new UnprocessableEntityException('User tidak ditemukan');
    }

    if (checkUserExists.role !== 'admin') {
      throw new ForbiddenException('Hanya admin yang bisa login');
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

    // Menghapus password dari response
    delete (checkUserExists as any).password;

    return { ...checkUserExists, access_token, refresh_token };
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
