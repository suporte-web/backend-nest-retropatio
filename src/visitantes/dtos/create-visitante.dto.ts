import { IsOptional, IsString } from 'class-validator';

export class CreateVisitanteDto {
  @IsString()
  nome: string;

  @IsString()
  cpf: string;

  @IsOptional()
  @IsString()
  empresa?: string;

  @IsString()
  tipoVisita: string;

  @IsOptional()
  @IsString()
  motivoVisita?: string;

  @IsString()
  filialId: string;
}
