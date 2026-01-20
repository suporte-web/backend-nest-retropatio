import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChamadaDto } from './dtos/create-chamadas.dto';

@Injectable()
export class ChamadasService {
  constructor(private readonly prisma: PrismaService) {}

  async findByFilter(body: any) {
    try {
      const { filialId, status, pesquisa, dataAtendimento } = body;

      const page = Number(body.page ?? 1);
      const limit = Number(body.limit ?? 10);
      const skip = (page - 1) * limit;

      const where: any = {
        filialId,
        ...(status ? { status } : {}),
        ...(dataAtendimento
          ? {
              // se você quer filtrar "por dia", use range (ver abaixo)
              dataAtendimento: new Date(dataAtendimento),
            }
          : {}),
        ...(pesquisa
          ? {
              OR: [
                {
                  motorista: {
                    nome: { contains: pesquisa, mode: 'insensitive' },
                  },
                },
                {
                  veiculo: {
                    placaVeiculo: { contains: pesquisa, mode: 'insensitive' },
                  },
                }, // exemplo
              ],
            }
          : {}),
      };

      const result = await this.prisma.chamadas.findMany({
        where,
        orderBy: { id: 'desc' },
        skip,
        take: limit,
        include: {
          motorista: true,
          veiculo: true,
        },
      });

      const total = await this.prisma.chamadas.count({ where });

      return { result, total };
    } catch (e) {
      throw new InternalServerErrorException('Erro ao listar chamadas');
    }
  }

  async create(dto: CreateChamadaDto) {
    try {
      const { filialId, veiculoId, motoristaId, motivo } = dto;

      return await this.prisma.chamadas.create({
        data: {
          filialId,
          veiculoId: veiculoId,
          motoristaId: motoristaId,
          motivo,
          status: 'PENDENTE',
        },
      });
    } catch (e) {
      throw new InternalServerErrorException('Erro ao criar chamada');
    }
  }

  async atender(id: string) {
    try {
      return await this.prisma.chamadas.update({
        where: { id },
        data: {
          status: 'ATENDIDA',
          dataAtendimento: new Date().toISOString(),
        },
      });
    } catch (e) {
      throw new InternalServerErrorException('Erro ao atender chamada');
    }
  }

  async findPendentes() {
    return await this.prisma.chamadas.findMany({
      where: { status: 'PENDENTE' },
      include: {
        motorista: true,
        veiculo: true,
      },
    });
  }
}
