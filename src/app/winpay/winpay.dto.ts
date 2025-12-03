import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ChannelType {
  BRI = 'BRI',
  BSI = 'BSI',
  MUAMALAT = 'MUAMALAT',
}

export enum VirtualAccountTrxType {
  CLOSE = 'c',
  OPEN = 'o',
  RECURRING = 'r',
}

class TotalAmountDto {
  @Matches(/^\d+\.\d{2}$/)
  value!: string; // example: "25000.00"

  @IsString()
  @IsIn(['IDR'])
  currency!: 'IDR';
}

class AdditionalInfoDto {
  @IsString()
  @IsIn([ChannelType.BRI, ChannelType.BSI, ChannelType.MUAMALAT])
  channel!: ChannelType;
}

export class CreateVaDto {
  @IsString()
  @IsOptional()
  customerNo: string;

  @IsString()
  @IsNotEmpty()
  nisn:string

  // @IsArray()
  @IsString()
  @IsNotEmpty()
  jenis:string

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  bulan:string

  @IsString()
  @IsNotEmpty()
  tahun:string

  @IsString()
  @IsNotEmpty()
  virtualAccountName!: string;

  @IsString()
  @IsOptional()
  trxId: string;

  @ValidateNested()
  @Type(() => TotalAmountDto)
  totalAmount!: TotalAmountDto;

  @IsString()
  // @IsIn(['c', 'o', 'r'])
  virtualAccountTrxType: string;

  @IsString()
  @IsOptional()
  expiredDate!: string; // ISO8601

  @ValidateNested()
  @Type(() => AdditionalInfoDto)
  additionalInfo!: AdditionalInfoDto;
}


class AdditionalInfoInquiryDto {
  @IsString()
  @IsNotEmpty()
  contractId!: string;
}

export class InquiryVaDto {
  @IsString()
  @IsNotEmpty()
  trxId!: string;

  @ValidateNested()
  @Type(() => AdditionalInfoInquiryDto)
  additionalInfo!: AdditionalInfoInquiryDto;
}

class AdditionalInfoInquiryStatusDto {
  @IsString()
  @IsNotEmpty()
  contractId!: string;

  @IsString()
  @IsNotEmpty()
  channel: string;

  @IsString()
  @IsNotEmpty()
  trxId!: string;
}

export class InquiryStatus{
  @IsString()
  @IsNotEmpty()
  virtualAccountNo!: string;

  @ValidateNested()
  @Type(() => AdditionalInfoInquiryStatusDto)
  additionalInfo!: AdditionalInfoInquiryStatusDto;
}

class PaidAmountDto {
  @IsString()
  @IsNotEmpty()
  value!: string; // "10000"

  @IsString()
  @IsNotEmpty()
  currency!: string; // "IDR"
}

  class AdditionalInfoCallbackDto {
    @IsString()
    @IsNotEmpty()
    channel!: string; // CIMB, BRI, BNI, MUAMALAT, dll.

    @IsString()
    @IsNotEmpty()
    contractId!: string;
  }

export class PaymentCallbackDto {
  @IsString()
  @IsNotEmpty()
  partnerServiceId!: string;

  @IsString()
  @IsNotEmpty()
  customerNo!: string;

  @IsString()
  @IsNotEmpty()
  virtualAccountNo!: string;

  @IsString()
  @IsNotEmpty()
  virtualAccountName!: string;

  @IsString()
  @IsNotEmpty()
  trxId!: string;

  @IsString()
  @IsNotEmpty()
  paymentRequestId!: string;

  @ValidateNested()
  @Type(() => PaidAmountDto)
  paidAmount!: PaidAmountDto;

  @IsString()
  @IsNotEmpty()
  trxDateTime!: string; // ISO8601

  @IsString()
  referenceNo!: string;

  @ValidateNested()
  @Type(() => AdditionalInfoCallbackDto)
  additionalInfo!: AdditionalInfoCallbackDto;
}
