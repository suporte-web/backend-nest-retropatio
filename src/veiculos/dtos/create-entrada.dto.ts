import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEntradaDto {
  @IsString()
  @IsNotEmpty()
  filialId!: string;

  @Type(() => Number)
  @IsNumber()
  vagaId!: number;

  @IsString()
  @IsNotEmpty()
  placaCavalo!: string;

  @IsString()
  @IsNotEmpty()
  motorista!: string;

  @IsOptional()
  @IsString()
  placaCarreta?: string | null;

  @IsOptional()
  @IsString()
  proprietario?: string | null;

  @IsOptional()
  @IsString()
  tipo?: string; // default "entrada" no service

  @IsOptional()
  @IsString()
  tipoVeiculoCategoria?: string | null;

  @IsOptional()
  @IsString()
  tipoProprietario?: string | null;

  @IsOptional()
  @IsString()
  cliente?: string | null;

  @IsOptional()
  @IsString()
  transportadora?: string | null;

  @IsOptional()
  @IsString()
  statusCarga?: string | null;

  @IsOptional()
  @IsString()
  doca?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  valor?: number | null;

  @IsOptional()
  @IsString()
  cte?: string | null;

  @IsOptional()
  @IsString()
  nf?: string | null;

  @IsOptional()
  @IsString()
  lacre?: string | null;

  @IsOptional()
  @IsString()
  cpfMotorista?: string | null;

  @IsOptional()
  @IsString()
  observacoes?: string | null;

  @IsString()
  @IsNotEmpty()
  tipoVeiculo!: string;

  @IsOptional()
  @IsBoolean()
  multi?: boolean;
}
