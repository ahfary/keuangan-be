import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { role } from '../entity/user.entity';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password harus memiliki setidaknya 6 karakter' })
  password: string;

  @IsNotEmpty()
  @IsEnum(role, { message: 'Role harus salah satu dari Admin, Kasir, atau Walisantri' })
  role: string;
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  // @IsNotEmpty()
  @IsString()
  role: string;
}
