import { IsOptional, IsString } from 'class-validator';

export class ListChamadasQueryDto {
  @IsString()
  filialId: string;

  @IsOptional()
  @IsString()
  status?: string;
}
