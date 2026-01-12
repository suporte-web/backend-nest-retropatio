import { IsOptional, IsString } from 'class-validator';

export class RegistrarSaidaDto {
  @IsOptional()
  @IsString()
  cte?: string;

  @IsOptional()
  @IsString()
  nf?: string;

  @IsOptional()
  @IsString()
  lacre?: string;
}
