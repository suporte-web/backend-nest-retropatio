import {
  IsBoolean,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateEntradaDto {
  @IsString()
  @IsNotEmpty()
  filialId: string;

  // no seu código original você faz Number(data.vagaId)
  @IsNumberString()
  vagaId: string;

  @IsString()
  @IsNotEmpty()
  placaCavalo: string;

  @IsOptional()
  @IsString()
  placaCarreta?: string;

  @IsString()
  @IsOptional()
  motoristaId: string;

  @IsOptional()
  @IsString()
  proprietario?: string;

  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsOptional()
  @IsString()
  tipoVeiculoCategoria?: string;

  @IsOptional()
  @IsString()
  tipoProprietario?: string;

  @IsOptional()
  @IsString()
  cliente?: string;

  @IsOptional()
  @IsString()
  transportadora?: string;

  @IsOptional()
  @IsString()
  statusCarga?: string;

  @IsOptional()
  @IsString()
  doca?: string;

  // no original: data.valor ? Number(data.valor) : null
  @IsOptional()
  @IsString()
  valor?: string;

  @IsOptional()
  @IsString()
  cte?: string;

  @IsOptional()
  @IsString()
  nf?: string;

  @IsOptional()
  @IsString()
  lacre?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsBoolean()
  multi?: boolean;

  // no original: if (data.veiculoId === "") data.veiculoId = null;
  // aqui eu mantive para compatibilidade caso chegue do front, mas não usei no create (não existia no create original)
  @IsOptional()
  @IsString()
  veiculoId?: string;
}
