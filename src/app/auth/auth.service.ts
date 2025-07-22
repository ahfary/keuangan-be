import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { REQUEST } from '@nestjs/core';
import { LoginDto, RegisterDto } from './auth.dto';
import { Prisma } from '@prisma/client';
import { compare, hash } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    @Inject(REQUEST) private req: any,
  ) {}

  generateJWT(payload: jwtPayload, expiresIn: string | number, token: string) {
    return this.jwtService.sign(payload, {
      secret: token,
      expiresIn: expiresIn,
    });
  }

  async refreshToken(id: any, token: string): Promise<any> {
    const checkUserExists = await this.prismaService.user.findFirst({ // ✅ Menggunakan findFirst
      where: {
        id: id,
        refresh_token: token
      },
    });

    if (!checkUserExists) {
      throw new UnauthorizedException('Refresh token tidak valid atau user tidak ditemukan');
    }

    const jwtPayload: jwtPayload = {
      id: checkUserExists.id,
      username : checkUserExists.name,
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
    await this.prismaService.user.update({
      where: { id: checkUserExists.id },
      data: { refresh_token: refresh_token },
    });

    return ({...checkUserExists, access_token, refresh_token});
  }

  async register(payload: RegisterDto): Promise<any> {
    try {
      payload.password = await hash(payload.password, 12);
      
      const user = await this.prismaService.user.create({ // ✅ Menggunakan create
        data : payload,
      });

      // Menghapus password dari response demi keamanan
      delete (user as any).password;
      return ({...user});

    } catch (error) {
      // ✅ Penanganan error spesifik dari Prisma untuk unique constraint
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Email sudah terdaftar.');
      }
      throw error; // Lempar error lain jika bukan karena duplikasi
    }
  }

  async loginAdmin(payload: LoginDto): Promise<any> {
    const checkUserExists = await this.prismaService.user.findUnique({ // ✅ Menggunakan findUnique
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

    const checkPassword = await compare(payload.password, checkUserExists.password);

    if (!checkPassword) {
      throw new UnprocessableEntityException('Email dan password tidak sesuai');
    }

    const jwtPayload: jwtPayload = {
      id: checkUserExists.id,
      username: checkUserExists.name,
      email: checkUserExists.email,
    };

    const access_token = this.generateJWT(jwtPayload, '1d', process.env.ACCESS_TOKEN_SECRET!);
    const refresh_token = this.generateJWT(jwtPayload, '1d', process.env.REFRESH_TOKEN_SECRET!);

    await this.prismaService.user.update({ // ✅ Menggunakan update
      where: { id: checkUserExists.id },
      data: { refresh_token: refresh_token },
    });

    // Menghapus password dari response
    delete (checkUserExists as any).password;
    
    return ({ ...checkUserExists, access_token, refresh_token });
  }

  async profile(): Promise<any> {
    const user = await this.prismaService.user.findUnique({ // ✅ Menggunakan findUnique
      where: {
        id: this.req.user.id,
      },
      select: { // ✅ Menggunakan select untuk memilih field
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }
    return ({user});
  }
}
