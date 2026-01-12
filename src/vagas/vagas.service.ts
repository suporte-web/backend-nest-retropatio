import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVagaDto } from './dtos/create-vaga.dto';
import { UpdateVagaDto } from './dtos/update-vaga.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class VagasService {
  constructor(private readonly prisma: PrismaService) {}

  // 1) Listar todas as vagas
  async listarTodas() {
    try {
      return await this.prisma.vaga.findMany({
        include: { tipoVaga: true, filial: true },
        orderBy: { id: 'asc' },
      });
    } catch (e) {
      throw new BadRequestException('Erro ao buscar vagas');
    }
  }

  // LISTAR VAGAS LIVRES POR FILIAL
  async listarLivresPorFilial(filialId: string) {
    if (!filialId) throw new BadRequestException('filialId é obrigatório');

    const vagas = await this.prisma.vaga.findMany({
      where: { filialId: String(filialId) },
      include: {
        entradas: {
          where: { status: 'ativo', dataSaida: null },
        },
      },
      orderBy: { NomeVaga: 'asc' },
    });

    return vagas.filter((v) => v.entradas.length === 0);
  }

  // LISTAR VAGAS OCUPADAS POR FILIAL
  async listarOcupadasPorFilial(filialId: string) {
    if (!filialId) throw new BadRequestException('filialId é obrigatório');

    return this.prisma.vaga.findMany({
      where: {
        filialId: String(filialId),
        entradas: {
          some: { status: 'ativo', dataSaida: null },
        },
      },
      include: {
        entradas: {
          where: { status: 'ativo', dataSaida: null },
        },
      },
      orderBy: { NomeVaga: 'asc' },
    });
  }

  // LISTAR VAGAS POR FILIAL (MVP)
  async listarPorFilial(filialId: string) {
    return this.prisma.vaga.findMany({
      where: { filialId: String(filialId) },
      include: { tipoVaga: true, filial: true },
      orderBy: { NomeVaga: 'asc' },
    });
  }

  // STATUS DE UMA VAGA
  async statusDaVaga(id: number) {
    const vaga = await this.prisma.vaga.findUnique({
      where: { id: Number(id) },
      include: {
        entradas: {
          where: { status: 'ativo', dataSaida: null },
        },
      },
    });

    if (!vaga) throw new NotFoundException('Vaga não encontrada');

    const status = vaga.entradas.length > 0 ? 'ocupada' : 'livre';

    return { vagaId: vaga.id, NomeVaga: vaga.NomeVaga, status };
  }

  // Listar vagas organizadas por tipo
  async listarPorTipos(filialId: string) {
    if (!filialId) throw new BadRequestException('filialId é obrigatório');

    const tipos = await this.prisma.tipoVaga.findMany({
      include: {
        Vagas: {
          where: { filialId: String(filialId) },
          orderBy: { NomeVaga: 'asc' },
        },
      },
    });

    const resposta: Record<string, any[]> = {};
    tipos.forEach((tipo) => {
      resposta[tipo.Nome] = tipo.Vagas;
    });

    return resposta;
  }

  // Criar nova vaga
  async criar(dto: CreateVagaDto) {
    const { filialId, tipoVagaId, NomeVaga, status } = dto;

    if (!filialId || !tipoVagaId || !NomeVaga) {
      throw new BadRequestException(
        'Campos obrigatórios faltando (filialId, tipoVagaId, NomeVaga)',
      );
    }

    const filial = await this.prisma.filial.findUnique({
      where: { id: filialId },
    });
    if (!filial) throw new BadRequestException('Filial inválida');

    const tipoVaga = await this.prisma.tipoVaga.findUnique({
      where: { Id: Number(tipoVagaId) },
    });
    if (!tipoVaga) throw new BadRequestException('Tipo de vaga inválido');

    const novaVaga = await this.prisma.vaga.create({
      data: {
        filialId,
        tipoVagaId: Number(tipoVagaId),
        NomeVaga,
        status: status || 'livre',
      },
    });

    return { message: 'Vaga criada com sucesso', vaga: novaVaga };
  }

  // Atualizar vaga
  async atualizar(id: number, dto: UpdateVagaDto) {
    const vaga = await this.prisma.vaga.findUnique({
      where: { id: Number(id) },
    });
    if (!vaga) throw new NotFoundException('Vaga não encontrada');

    if (dto.filialId) {
      const filialExists = await this.prisma.filial.findUnique({
        where: { id: dto.filialId },
      });
      if (!filialExists) throw new BadRequestException('Filial inválida');
    }

    if (dto.tipoVagaId) {
      const tipoExists = await this.prisma.tipoVaga.findUnique({
        where: { Id: Number(dto.tipoVagaId) },
      });
      if (!tipoExists) throw new BadRequestException('Tipo de vaga inválida');
    }

    const updated = await this.prisma.vaga.update({
      where: { id: Number(id) },
      data: {
        NomeVaga: dto.NomeVaga ?? vaga.NomeVaga,
        filialId: dto.filialId ?? vaga.filialId,
        tipoVagaId: dto.tipoVagaId ?? vaga.tipoVagaId,
        status: dto.status ?? vaga.status,
      },
    });

    return { message: 'Vaga atualizada com sucesso', vaga: updated };
  }

  // Excluir vaga
  async excluir(id: number, filialId: string) {
    if (!filialId) {
      throw new BadRequestException('filialId é obrigatório para excluir vaga');
    }

    const vaga = await this.prisma.vaga.findUnique({
      where: { id: Number(id) },
    });
    if (!vaga) throw new NotFoundException('Vaga não encontrada');

    if (vaga.filialId !== filialId) {
      throw new ForbiddenException('Vaga não pertence à filial selecionada');
    }

    await this.prisma.vaga.delete({ where: { id: Number(id) } });

    return { message: 'Vaga excluída com sucesso!' };
  }

  async importarExcel(buffer: Buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<any>(sheet);

  let criadas = 0;
  const erros: Array<{ linha: number; erro: string }> = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    try {
      const { NomeVaga, Filial, TipoVaga, Status } = row;

      if (!NomeVaga || !Filial || !TipoVaga) {
        throw new Error('Campos obrigatórios faltando');
      }

      const filial = await this.prisma.filial.findFirst({
        where: { nome: String(Filial) },
      });
      if (!filial) throw new Error('Filial não encontrada');

      const tipo = await this.prisma.tipoVaga.findFirst({
        where: { Nome: String(TipoVaga) },
      });
      if (!tipo) throw new Error('Tipo de vaga não encontrado');

      await this.prisma.vaga.create({
        data: {
          NomeVaga: String(NomeVaga),
          filialId: filial.id,
          tipoVagaId: tipo.Id,
          status: Status || 'livre',
        },
      });

      criadas++;
    } catch (err: any) {
      erros.push({ linha: i + 2, erro: err.message }); // +2 por conta do header do Excel
    }
  }

  return { message: 'Importação finalizada', criadas, erros };
}
}
