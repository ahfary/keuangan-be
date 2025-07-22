import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtAccessTokenStrategy } from './jwtAccessToken.strategy';
import { JwtRefreshTokenStrategy } from './jwtRefreshToken.strategy';

@Module({
  imports: [JwtModule.register({})],
  providers: [AuthService, PrismaService, JwtAccessTokenStrategy, JwtRefreshTokenStrategy],
  controllers: [AuthController]
})


export class AuthModule {}
