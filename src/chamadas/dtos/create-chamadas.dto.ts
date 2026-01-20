import { IsNotEmpty, IsString, } from 'class-validator';

export class CreateChamadaDto {
  @IsString()
  @IsNotEmpty()
  filialId: string;

  @IsString()
  veiculoId: string;
  
  @IsString()
  motoristaId: string;

  @IsString()
  @IsNotEmpty()
  motivo: string;
}
