import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateVagaDto {
  @IsString()
  filialId: string;

  @IsInt()
  @Min(1)
  tipoVagaId: number;

  @IsString()
  NomeVaga: string;

  @IsOptional()
  @IsString()
  status?: string; // "livre" | "ocupada" etc
}
