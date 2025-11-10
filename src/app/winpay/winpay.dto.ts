import { IsIn, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateVaDto {
  @Matches(/^\d{3,14}$/)
  customerNo!: string; // 3-14 digit numeric

  @IsString()
  @IsNotEmpty()
  virtualAccountName!: string; // Nama di rekening VA

  @IsString()
  @IsNotEmpty()
  trxId!: string; // Unik per transaksi

  @Matches(/^\d+\.\d{2}$/)
  amount!: string; // Format: "25000.00"

  @IsIn(['c', 'o', 'r'])
  virtualAccountTrxType!: 'c' | 'o' | 'r'; // close/open/recurring

  @IsString()
  @IsNotEmpty()
  expiredDate!: string; // ISO8601 WIB format

  @IsString()
  @IsOptional()
  channel?: string; // contoh: BSI, BRI, BCA
}
