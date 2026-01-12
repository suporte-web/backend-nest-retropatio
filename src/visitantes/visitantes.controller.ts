import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { VisitantesService } from './visitantes.service';
import { CreateVisitanteDto } from './dtos/create-visitante.dto';

@Controller('api/visitantes')
export class VisitantesController {
  constructor(private readonly service: VisitantesService) {}

  /* ======================================================
     CRIAR VISITANTE
     POST /api/visitantes
  ====================================================== */
  @Post()
  criar(@Body() dto: CreateVisitanteDto) {
    return this.service.criar(dto);
  }

  /* ======================================================
     LISTAR VISITANTES POR FILIAL (CONTRATO DO FRONT)
     GET /api/visitantes?filialId=xxxx
  ====================================================== */
  @Get()
  listar(@Query('filialId') filialId: string) {
    return this.service.listarPorQueryFilial(filialId);
  }

  /* ======================================================
     COMPATIBILIDADE COM FRONT ANTIGO
     GET /api/visitantes/filial/:filialId
  ====================================================== */
  @Get('filial/:filialId')
  listarPorFilial(@Param('filialId') filialId: string) {
    return this.service.listarPorFilialParam(filialId);
  }

  /* ======================================================
     PAINEL DE VISITANTES
     GET /api/visitantes/painel/:filialId
  ====================================================== */
  @Get('painel/:filialId')
  painel(@Param('filialId') filialId: string) {
    return this.service.painel(filialId);
  }

  /* ======================================================
     HISTÓRICO DE VISITANTES
     GET /api/visitantes/historico/:filialId
  ====================================================== */
  @Get('historico/:filialId')
  historico(@Param('filialId') filialId: string) {
    return this.service.historico(filialId);
  }

  /* ======================================================
     AGUARDANDO APROVAÇÃO
     GET /api/visitantes/aguardando/:filialId
  ====================================================== */
  @Get('aguardando/:filialId')
  aguardando(@Param('filialId') filialId: string) {
    return this.service.aguardando(filialId);
  }

  /* ======================================================
     VISITANTES DENTRO
     GET /api/visitantes/dentro/:filialId
  ====================================================== */
  @Get('dentro/:filialId')
  dentro(@Param('filialId') filialId: string) {
    return this.service.dentro(filialId);
  }

  /* ======================================================
     APROVAR VISITANTE
     PATCH /api/visitantes/:id/aprovar
  ====================================================== */
  @Patch(':id/aprovar')
  aprovar(@Param('id') id: string) {
    return this.service.aprovar(Number(id));
  }

  /* ======================================================
     REGISTRAR ENTRADA
     PATCH /api/visitantes/:id/entrada
  ====================================================== */
  @Patch(':id/entrada')
  entrada(@Param('id') id: string) {
    return this.service.registrarEntrada(Number(id));
  }

  /* ======================================================
     REGISTRAR SAÍDA
     PATCH /api/visitantes/:id/saida
  ====================================================== */
  @Patch(':id/saida')
  saida(@Param('id') id: string) {
    return this.service.registrarSaida(Number(id));
  }

  /* ======================================================
     EXPORTAR VISITANTES (CSV)
     GET /api/visitantes/export?filialId=xxxx
  ====================================================== */
  @Get('export')
  async exportar(@Query('filialId') filialId: string, @Res() res: Response) {
    const csv = await this.service.exportarCsv(filialId);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=visitantes_historico.csv',
    );
    return res.send(csv);
  }
}
