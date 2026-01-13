import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateFornecedorDto {
  @IsString()
  nome: string;

  @IsString()
  cnpj: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
