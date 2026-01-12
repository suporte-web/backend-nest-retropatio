import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { EntradaService } from './entrada.service';
import { CreateEntradaDto } from './dtos/create-entrada.dto';
import { RegistrarSaidaDto } from './dtos/registrar-saida.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('Entrada')
@Controller('entrada')
@UseGuards(AuthGuard)
export class EntradaController {
  constructor(private readonly entradaService: EntradaService) {}

  @Post('create')
  registrarEntrada(@Body() dto: CreateEntradaDto) {
    return this.entradaService.registrarEntrada(dto);
  }

  @Patch(':id/saida')
  registrarSaida(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RegistrarSaidaDto,
  ) {
    return this.entradaService.registrarSaida(id, dto);
  }

  @Get('ativos')
  listarAtivos(@Query('filialId') filialId: string) {
    return this.entradaService.listarAtivos(filialId);
  }

  @Get('vagas/livres')
  vagasLivres(@Query('filialId') filialId: string) {
    return this.entradaService.vagasLivres(filialId);
  }

  @Patch(':id/cancelar')
  cancelar(@Param('id', ParseIntPipe) id: number) {
    return this.entradaService.cancelarEntrada(id);
  }

  @Patch(':id/reabrir')
  reabrir(@Param('id', ParseIntPipe) id: number) {
    return this.entradaService.reabrirEntrada(id);
  }
}
