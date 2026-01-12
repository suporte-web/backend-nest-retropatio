import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class HistoricoDto {
  @IsString()
  @IsNotEmpty()
  filialId!: string;

  // yyyy-mm-dd
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  data?: string;
}
