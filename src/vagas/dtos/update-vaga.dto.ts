import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateVagaDto {
  @IsOptional()
  @IsString()
  NomeVaga?: string;

  @IsOptional()
  @IsString()
  filialId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  tipoVagaId?: number;

  @IsOptional()
  @IsString()
  status?: string;
}
