import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateKartuDto {
  @IsNotEmpty()
  nomorKartu: string;

  @IsNotEmpty()
  @Matches(/^\d{6}$/, {
    message: 'Passcode harus berupa 6 digit angka',
  })
  passcode: string;
}

export class UpdateKartuDto {
  
  @IsOptional()
  nomorKartu: string;

  @IsOptional()
  @Matches(/^\d{6}$/, {
    message: 'Passcode harus berupa 6 digit angka',
  })
  passcode: string;
}
