import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  InternalServerErrorException,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { VeiculosService } from './veiculos.service';
import { ListAtivosDto } from './dtos/list-ativos.dto';
import { HistoricoDto } from './dtos/historico.dto';
import { RegistrarSaidaDto } from './dtos/registrar-saida.dto';
import { CreateEntradaDto } from './dtos/create-entrada.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('Veiculos')
@Controller('veiculos')
@UseGuards(AuthGuard)
export class VeiculosController {
  constructor(private readonly service: VeiculosService) {}

  // POST /api/veiculos
  @Post('cadastrar-entrada')
  async cadastrarEntrada(@Body() body: CreateEntradaDto) {
    try {
      return await this.service.cadastrarEntrada(body);
    } catch (e) {
      if (e?.status) throw e;
      throw new InternalServerErrorException('Erro ao registrar veículo');
    }
  }

  @Post('create')
  async createVeiculo(@Body() body: any) {
    return await this.service.criarVeiculo(body);
  }

  // GET /api/veiculos/all
  @Get('all')
  async all() {
    try {
      return await this.service.listarTodos();
    } catch {
      throw new InternalServerErrorException('Erro ao listar veículos');
    }
  }

  // GET /api/veiculos/ativos?filialId=xxxx
  @Get('ativos')
  async ativos(@Query() query: ListAtivosDto) {
    try {
      return await this.service.listarAtivosPorFilial(query.filialId);
    } catch (e) {
      // exceções (400 etc) já sobem; só normaliza erro desconhecido
      if (e?.status) throw e;
      throw new InternalServerErrorException('Erro ao listar veículos ativos');
    }
  }

  // GET /api/veiculos/historico?filialId=xxxx&data=yyyy-mm-dd
  @Get('historico')
  async historico(@Query() query: HistoricoDto) {
    try {
      return await this.service.historicoDoDia(query.filialId, query.data);
    } catch (e) {
      if (e?.status) throw e;
      throw new InternalServerErrorException('Erro ao buscar histórico');
    }
  }

  // GET /api/veiculos/buscar/:placa
  @Get('buscar/:placa')
  async buscar(@Param('placa') placa: string) {
    try {
      return await this.service.buscarUltimoPorPlaca(placa);
    } catch {
      throw new InternalServerErrorException('Erro ao buscar veículo');
    }
  }

  // GET /api/veiculos?filialId=xxxx
  @Get()
  async list(@Query('filialId') filialId: string) {
    try {
      return await this.service.listarPorFilial(filialId);
    } catch (e) {
      if (e?.status) throw e;
      throw new InternalServerErrorException('Erro ao listar veículos');
    }
  }

  // GET /api/veiculos/:id
  @Get(':id')
  async detalhe(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.service.detalhePorId(id);
    } catch (e) {
      if (e?.status) throw e;
      throw new InternalServerErrorException('Erro ao buscar veículo');
    }
  }

  // PATCH /api/veiculos/:id
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return await this.service.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.service.delete(id);
  }
}
