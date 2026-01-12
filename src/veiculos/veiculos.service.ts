import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';
import { RegistrarSaidaDto } from './dtos/registrar-saida.dto';
import { CreateEntradaDto } from './dtos/create-entrada.dto';

@Injectable()
export class VeiculosService {
  private readonly logger = new Logger(VeiculosService.name);

  constructor(private readonly prisma: PrismaService) {}

  async listarTodos() {
    try {
      return await this.prisma.entrada.findMany({
        include: { vaga: true, filial: true, veiculo: true },
        orderBy: { dataEntrada: 'desc' },
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
    const veiculo = await this.prisma.entrada.findFirst({
      where: {
        placaCavalo: { equals: placa, mode: 'insensitive' },
      },
      include: { veiculo: true },
      orderBy: { id: 'desc' },
    });

    if (!veiculo) return { encontrado: false as const };

    return {
      encontrado: true as const,
      ultimaEntrada: veiculo,
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

  async registrarSaida(id: number, body: RegistrarSaidaDto) {
    return this.prisma.$transaction(async (tx) => {
      const saida = await tx.entrada.update({
        where: { id },
        data: {
          dataSaida: new Date(),
          status: 'finalizado',
          cte: body.cte,
          nf: body.nf,
          lacre: body.lacre,
        },
      });

      if (saida.vagaId) {
        await tx.vaga.update({
          where: { id: saida.vagaId },
          data: { status: 'livre' },
        });
      }

      return saida;
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

    const placaCavalo = data.placaCavalo.trim().toUpperCase();

    return this.prisma.$transaction(async (tx) => {
      const vaga = await tx.vaga.findUnique({
        where: { id: data.vagaId },
      });

      if (!vaga) throw new BadRequestException('Vaga não encontrada');

      // ✅ NÃO usa findUnique, porque seu Prisma Client não aceita placaCavalo como unique
      let veiculo = await tx.veiculo.findFirst({
        where: {
          placaCavalo: { equals: placaCavalo, mode: 'insensitive' },
        },
        orderBy: { createdAt: 'desc' }, // opcional, mas ajuda se houver duplicadas
      });

      if (!veiculo) {
        veiculo = await tx.veiculo.create({
          data: {
            id: randomUUID(),
            placaCavalo,
            placaCarreta: data.placaCarreta ?? null,
            motorista: data.motorista,
            cpfMotorista: data.cpfMotorista ?? null,
            transportadora: data.transportadora ?? null,
            cliente: data.cliente ?? null,

            cte: data.cte ?? null,
            nf: data.nf ?? null,
            lacre: data.lacre ?? null,

            dataEntrada: new Date(),
            dataSaida: null,

            // ❌ status removido (seu Prisma Client diz que não existe)
            // status: 'ativo',

            // ✅ situacao existe no seu model
            situacao: 'ativo',
            filialId: data.filialId,
            vagaId: data.vagaId,
          },
        });
      } else {
        veiculo = await tx.veiculo.update({
          where: { id: veiculo.id }, // ✅ id é unique com certeza
          data: {
            placaCarreta: data.placaCarreta ?? veiculo.placaCarreta,
            motorista: data.motorista ?? veiculo.motorista,
            cpfMotorista: data.cpfMotorista ?? veiculo.cpfMotorista,
            transportadora: data.transportadora ?? veiculo.transportadora,
            cliente: data.cliente ?? veiculo.cliente,
            cte: data.cte ?? veiculo.cte,
            nf: data.nf ?? veiculo.nf,
            lacre: data.lacre ?? veiculo.lacre,

            vagaId: data.vagaId,
            filialId: data.filialId,

            // ❌ status removido (seu Prisma Client diz que não existe)
            // status: 'ativo',

            situacao: 'ativo',
            dataEntrada: new Date(),
            dataSaida: null,
          },
        });
      }

      const entrada = await tx.entrada.create({
        data: {
          filialId: data.filialId,
          vagaId: data.vagaId,
          veiculoId: veiculo.id,

          placaCavalo,
          placaCarreta: data.placaCarreta ?? null,
          motorista: data.motorista,
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
          cpfMotorista: data.cpfMotorista ?? null,
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
}
