import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { VisitantesService } from './visitantes.service';
import { CreateVisitanteDto } from './dtos/create-visitante.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('Visitantes')
@Controller('visitantes')
@UseGuards(AuthGuard)
export class VisitantesController {
  constructor(private readonly service: VisitantesService) {}

  @Post('create')
  @ApiOperation({ summary: 'Cria Visitante' })
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

  @Post('find-by-filter')
  @ApiOperation({ summary: 'Encontra o Visitante com filtros' })
  painel(@Body() body: any) {
    return this.service.painel(body);
  }

  @Patch(':id/aprovar')
  @ApiOperation({ summary: 'Aprova a entrada do Visitante para a Portaria' })
  aprovar(@Param('id') id: string) {
    return this.service.aprovar(Number(id));
  }
  
  @Patch(':id/reprovar')
  @ApiOperation({ summary: 'Reprova a entrada do Visitante para a Portaria' })
  reprovar(@Param('id') id: string) {
    return this.service.reprovar(Number(id));
  }

  @Patch(':id/dentro')
  @ApiOperation({ summary: 'Portaria libera a entrada do Visitante para a Empresa' })
  dentro(@Param('id') id: string) {
    return this.service.dentro(Number(id));
  }
  
  @Patch(':id/saiu')
  @ApiOperation({ summary: 'Portaria libera a saída do Visitante da Empresa' })
  saiu(@Param('id') id: string) {
    return this.service.saiu(Number(id));
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
