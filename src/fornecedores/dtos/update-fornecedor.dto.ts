import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateFornecedorDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  cnpj?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
