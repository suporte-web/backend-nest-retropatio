import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEntradaDto } from './dtos/create-entrada.dto';
import { RegistrarSaidaDto } from './dtos/registrar-saida.dto';

@Injectable()
export class EntradaService {
  constructor(private readonly prisma: PrismaService) {}

  async registrarEntrada(dto: CreateEntradaDto) {
    const vagaId = Number(dto.vagaId);

    const filial = await this.prisma.filial.findUnique({
      where: { id: dto.filialId },
    });

    if (!filial) {
      throw new BadRequestException('Filial inválida');
    }

    const vaga = await this.prisma.vaga.findUnique({
      where: { id: vagaId },
    });

    if (!vaga) {
      throw new BadRequestException('Vaga não encontrada');
    }

    if (vaga.filialId !== dto.filialId) {
      throw new BadRequestException('Vaga não pertence à filial');
    }

    if ((vaga.status ?? '') !== 'LIVRE') {
      throw new BadRequestException('Vaga ocupada');
    }

    // =========================
    // TRANSAÇÃO: cria entrada + ocupa vaga
    // =========================
    const result = await this.prisma.$transaction(async (tx) => {
      const entrada = await tx.entrada.create({
        data: {
          filialId: dto.filialId,
          vagaId,
          placaCavalo: dto.placaCavalo,
          placaCarreta: dto.placaCarreta || null,
          motoristaId: dto.motoristaId || null,
          proprietario: dto.proprietario || null,
          tipo: dto.tipo,
          tipoVeiculoCategoria: dto.tipoVeiculoCategoria || null,
          tipoProprietario: dto.tipoProprietario || null,
          clienteId: dto.cliente ?? undefined,
          transportadora: dto.transportadora || null,
          statusCarga: dto.statusCarga || null,
          doca: dto.doca || null,
          valor: dto.valor ? Number(dto.valor) : null,
          cte: dto.cte || null,
          nf: dto.nf || null,
          lacre: dto.lacre || null,
          observacoes: dto.observacoes || null,
          multi: dto.multi ?? false,

          // se seu schema tiver veiculoId e você quiser persistir:
          // veiculoId,
          status: 'ATIVO',
        },
      });

      await tx.vaga.update({
        where: { id: vagaId },
        data: { status: 'OCUPADA' },
      });

      return entrada;
    });

    return result;
  }

  async registrarSaida(id: number, dto: RegistrarSaidaDto) {
    // Transação: finaliza entrada + libera vaga
    const result = await this.prisma.$transaction(async (tx) => {
      const entrada = await tx.entrada.update({
        where: { id },
        data: {
          dataSaida: new Date(),
          status: 'FINALIZADO',
          cte: dto.cte || null,
          nf: dto.nf || null,
          lacre: dto.lacre || null,
        },
      });

      await tx.vaga.update({
        where: { id: entrada.vagaId },
        data: { status: 'LIVRE' },
      });

      return entrada;
    });

    return result;
  }

  async listarAtivos(filialId: string) {
    return await this.prisma.entrada.findMany({
      where: { filialId: filialId, dataSaida: null, status: 'ATIVO' },
      include: { vaga: true, filial: true },
      orderBy: { dataEntrada: 'desc' },
    });
  }

  async vagasLivres(filialId: string) {
    if (!filialId) {
      throw new BadRequestException('filialId é obrigatório');
    }

    return this.prisma.vaga.findMany({
      where: {
        filialId: String(filialId),
        status: 'livre',
      },
      orderBy: { NomeVaga: 'asc' },
    });
  }

  async cancelarEntrada(id: number) {
    const entrada = await this.prisma.entrada.findUnique({ where: { id } });

    if (!entrada) {
      throw new NotFoundException('Entrada não encontrada');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const cancelada = await tx.entrada.update({
        where: { id },
        data: {
          status: 'cancelado',
          dataSaida: new Date(),
        },
      });

      await tx.vaga.update({
        where: { id: entrada.vagaId },
        data: { status: 'livre' },
      });

      return {
        message: 'Entrada cancelada com sucesso',
        entrada: cancelada,
      };
    });

    return result;
  }

  async reabrirEntrada(id: number) {
    const result = await this.prisma.$transaction(async (tx) => {
      const entrada = await tx.entrada.update({
        where: { id },
        data: {
          status: 'ativo',
          dataSaida: null,
        },
      });

      await tx.vaga.update({
        where: { id: entrada.vagaId },
        data: { status: 'ocupada' },
      });

      return { message: 'Entrada reaberta', entrada };
    });

    return result;
  }
}
