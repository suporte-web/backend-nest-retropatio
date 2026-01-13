import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateVagaDto {
  @IsString()
  filialId: string;

  @IsString()
  tipoVaga: string;

  @IsString()
  NomeVaga: string;

  @IsOptional()
  @IsString()
  status?: string; // "livre" | "ocupada" etc
}
