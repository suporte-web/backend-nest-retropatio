import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateVagaDto {
  @IsOptional()
  @IsString()
  NomeVaga?: string;

  @IsOptional()
  @IsString()
  filialId?: string;

  @IsOptional()
  @IsString()
  tipoVaga?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
