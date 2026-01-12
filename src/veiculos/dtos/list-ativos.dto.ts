import { IsNotEmpty, IsString } from 'class-validator';

export class ListAtivosDto {
  @IsString()
  @IsNotEmpty()
  filialId!: string;
}
