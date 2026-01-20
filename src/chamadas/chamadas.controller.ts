import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ChamadasService } from './chamadas.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { ListChamadasQueryDto } from './dtos/list-chamadas-query.dto';
import { CreateChamadaDto } from './dtos/create-chamadas.dto';

@ApiTags('Chamadas')
@Controller('chamadas')
@UseGuards(AuthGuard)
export class ChamadasController {
  constructor(private readonly chamadasService: ChamadasService) {}

  @Post('find-by-filter')
  async list(@Body() body: any) {
    if (!body.filialId) {
      throw new BadRequestException('filialId é obrigatório');
    }

    return this.chamadasService.findByFilter(body);
  }

  @Post('create')
  async create(@Body() dto: CreateChamadaDto) {
    if (!dto.filialId || !dto.veiculoId || !dto.motivo) {
      throw new BadRequestException(
        'filialId, veiculoId e motivo são obrigatórios',
      );
    }

    return this.chamadasService.create(dto);
  }

  @Patch(':id/atender')
  async atender(@Param('id') id: string) {
    return this.chamadasService.atender(id);
  }
}
