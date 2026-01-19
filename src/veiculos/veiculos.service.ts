import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';
import { CreateEntradaDto } from './dtos/create-entrada.dto';

type CriarVeiculoBody = {
  placaVeiculo: string;
  tipoVeiculo: string;
  status: boolean;
};

@Injectable()
export class VeiculosService {
  private readonly logger = new Logger(VeiculosService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ✅ Centraliza normalização de placas
  private normalizarPlaca(placa: string) {
    return placa?.trim().toUpperCase().replace(/\s+/g, '');
  }

  async criarVeiculo(body: CriarVeiculoBody) {
    if (!body?.placaVeiculo || !body?.tipoVeiculo || !body?.status) {
      throw new BadRequestException(
        'Placa, Status Carga e Tipo são obrigatórios, verifique se inseriu todos',
      );
    }

    const placaVeiculo = this.normalizarPlaca(body.placaVeiculo);

    // ✅ opcional: impedir duplicidade por placa (se seu schema permitir duplicar, remova)
    const existente = await this.prisma.veiculo.findFirst({
      where: { placaVeiculo: { equals: placaVeiculo, mode: 'insensitive' } },
      orderBy: { createdAt: 'desc' },
    });

    if (existente) {
      throw new ConflictException(
        'Já existe um veículo cadastrado com essa placa',
      );
    }

    return this.prisma.veiculo.create({
      data: {
        tipoVeiculo: body.tipoVeiculo,
        placaVeiculo,
        status: body.status,
      },
    });
  }

  async listarTodos() {
    try {
      return await this.prisma.veiculo.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {
      this.logger.error('Erro ao listar todos os veículos', e as any);
      throw e;
    }
  }

  async listarTodosAtivos() {
    try {
      return await this.prisma.veiculo.findMany({
        where: { status: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {
      this.logger.error('Erro ao listar todos os veículos', e as any);
      throw e;
    }
  }

  async listarAtivosPorFilial(filialId: string) {
    if (!filialId) throw new BadRequestException('filialId é obrigatório');

    return this.prisma.entrada.findMany({
      where: {
        filialId,
        dataSaida: null,
        status: 'ativo',
      },
      include: { vaga: true, filial: true, veiculo: true },
      orderBy: { dataEntrada: 'desc' },
    });
  }

  async historicoDoDia(filialId: string, data?: string) {
    if (!filialId) throw new BadRequestException('filialId é obrigatório');

    const dia = data ? new Date(data) : new Date();

    const inicio = new Date(dia);
    inicio.setHours(0, 0, 0, 0);

    const fim = new Date(dia);
    fim.setHours(23, 59, 59, 999);

    return this.prisma.entrada.findMany({
      where: {
        filialId,
        dataEntrada: { gte: inicio, lte: fim },
      },
      include: { vaga: true, filial: true, veiculo: true },
      orderBy: { dataEntrada: 'desc' },
    });
  }

  async buscarUltimoPorPlaca(placa: string) {
    const placaNorm = this.normalizarPlaca(placa);

    const entrada = await this.prisma.entrada.findFirst({
      where: {
        // ✅ busca sempre pela placa normalizada
        placaCavalo: { equals: placaNorm, mode: 'insensitive' },
      },
      include: { veiculo: true },
      orderBy: { id: 'desc' },
    });

    if (!entrada) return { encontrado: false as const };

    return {
      encontrado: true as const,
      ultimaEntrada: entrada,
    };
  }

  async detalhePorId(id: number) {
    const veiculo = await this.prisma.entrada.findUnique({
      where: { id },
      include: { vaga: true, filial: true, veiculo: true },
    });

    if (!veiculo) throw new NotFoundException('Veículo não encontrado');

    return veiculo;
  }

  async update(id: string, body: any) {
    return await this.prisma.veiculo.update({
      where: { id },
      data: body,
    });
  }

  async cadastrarEntrada(data: CreateEntradaDto) {
    if (
      !data.filialId ||
      !data.vagaId ||
      !data.placaCavalo ||
      !data.motorista
    ) {
      throw new BadRequestException(
        'filialId, vagaId, placaCavalo e motorista são obrigatórios',
      );
    }

    const placaCavalo = this.normalizarPlaca(data.placaCavalo);
    const placaCarreta = data.placaCarreta
      ? this.normalizarPlaca(data.placaCarreta)
      : null;

    return this.prisma.$transaction(async (tx) => {
      const vaga = await tx.vaga.findUnique({
        where: { id: data.vagaId },
      });

      if (!vaga) throw new BadRequestException('Vaga não encontrada');

      // ✅ impede ocupar vaga já ocupada
      if (vaga.status !== 'livre') {
        throw new ConflictException('Vaga já está ocupada');
      }

      // ✅ vehicle é por placaVeiculo (ok). Usa a mesma normalização.
      let veiculo = await tx.veiculo.findFirst({
        where: {
          placaVeiculo: { equals: placaCavalo, mode: 'insensitive' },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!veiculo) {
        veiculo = await tx.veiculo.create({
          data: {
            id: randomUUID(),
            placaVeiculo: placaCavalo,
            placaCarreta,
            cliente: data.cliente ?? null,
            tipoVeiculo: data.tipoVeiculo,
          },
        });
      } else {
        veiculo = await tx.veiculo.update({
          where: { id: veiculo.id },
          data: {
            placaCarreta: placaCarreta ?? veiculo.placaCarreta,
            cliente: data.cliente ?? veiculo.cliente,
          },
        });
      }

      const entrada = await tx.entrada.create({
        data: {
          filialId: data.filialId,
          vagaId: data.vagaId,
          veiculoId: veiculo.id,
          placaCavalo,
          placaCarreta,
          proprietario: data.proprietario ?? null,
          tipo: data.tipo ?? 'entrada',
          tipoVeiculoCategoria: data.tipoVeiculoCategoria ?? null,
          tipoProprietario: data.tipoProprietario ?? null,
          cliente: data.cliente ?? null,
          transportadora: data.transportadora ?? null,
          statusCarga: data.statusCarga ?? null,
          doca: data.doca ?? null,
          valor: data.valor ?? null,
          cte: data.cte ?? null,
          nf: data.nf ?? null,
          lacre: data.lacre ?? null,
          observacoes: data.observacoes ?? null,
          multi: data.multi ?? false,
          status: 'ativo',
        },
      });

      await tx.vaga.update({
        where: { id: data.vagaId },
        data: { status: 'ocupada' },
      });

      return {
        sucesso: true,
        mensagem: 'Veículo registrado no pátio',
        entrada,
        veiculo,
      };
    });
  }

  async listarPorFilial(filialId: string) {
    if (!filialId) throw new BadRequestException('filialId é obrigatório');

    return this.prisma.entrada.findMany({
      where: { filialId },
      include: { vaga: true, filial: true, veiculo: true },
      orderBy: { dataEntrada: 'desc' },
    });
  }

  async delete(id: string) {
    return await this.prisma.veiculo.delete({ where: { id } });
  }
}
