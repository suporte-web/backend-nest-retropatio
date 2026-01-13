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
        include: { filial: true },
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
          where: { status: 'ATIVO', dataSaida: null },
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
      include: { filial: true },
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

    const vagas = await this.prisma.vaga.findMany({
      where: { filialId: String(filialId) },
      orderBy: { NomeVaga: 'asc' },
      include: { filial: true }, // opcional
    });

    const resposta: Record<string, any[]> = {};

    for (const vaga of vagas) {
      const chave = (vaga.tipoVaga ?? 'SEM_TIPO').trim();
      if (!resposta[chave]) resposta[chave] = [];
      resposta[chave].push(vaga);
    }

    return resposta;
  }

  // Criar nova vaga
  async criar(dto: CreateVagaDto) {
    const { filialId, tipoVaga, NomeVaga, status } = dto;

    if (!filialId || !tipoVaga || !NomeVaga) {
      throw new BadRequestException(
        'Campos obrigatórios faltando (filialId, tipoVagaId, NomeVaga)',
      );
    }

    const filial = await this.prisma.filial.findUnique({
      where: { id: filialId },
    });
    if (!filial) throw new BadRequestException('Filial inválida');

    if (!tipoVaga) throw new BadRequestException('Tipo de vaga inválido');

    const novaVaga = await this.prisma.vaga.create({
      data: {
        filialId,
        tipoVaga,
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

    const updated = await this.prisma.vaga.update({
      where: { id: Number(id) },
      data: {
        NomeVaga: dto.NomeVaga ?? vaga.NomeVaga,
        filialId: dto.filialId ?? vaga.filialId,
        tipoVaga: dto.tipoVaga ? String(dto.tipoVaga).trim() : vaga.tipoVaga, // <-- agora string
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

    const vaga = await this.prisma.vaga.findFirst({
      where: { id, filialId },
    });

    if (!vaga) {
      throw new NotFoundException('Vaga não encontrada para esta filial');
    }

    return this.prisma.vaga.delete({
      where: { id },
    });
  }

  async importarExcel(buffer: Buffer, filialId: string) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<any>(sheet, { defval: '' });

    // 1) Carrega tipos UMA vez e monta o mapa
    const tipos = await this.prisma.tipoVaga.findMany({
      select: { Id: true, Nome: true },
    });
    const tipoMap = new Map(
      tipos.map((t) => [String(t.Nome).trim().toUpperCase(), t.Id]),
    );

    let criadas = 0;
    const erros: Array<{ linha: number; erro: string }> = [];

    for (let i = 0; i < rows.length; i++) {
      try {
        const NomeVaga = String(rows[i].Vagas || '').trim();
        const TipoVaga = String(rows[i].Tipo || '')
          .trim()
          .toUpperCase();
        const Status = 'LIVRE';

        if (!NomeVaga || !TipoVaga) {
          throw new Error('Campos obrigatórios faltando');
        }

        // 2) resolve tipo pelo mapa
        const tipoId = tipoMap.get(TipoVaga);
        if (!tipoId)
          throw new Error(`Tipo de vaga não encontrado: ${TipoVaga}`);

        // 3) checa duplicidade (opcional)
        const jaExiste = await this.prisma.vaga.findFirst({
          where: { NomeVaga, filialId },
          select: { id: true },
        });
        if (jaExiste) continue;

        await this.prisma.vaga.create({
          data: {
            NomeVaga,
            filialId,
            tipoVaga: TipoVaga, // <-- aqui!
            status: Status,
          },
        });

        criadas++;
      } catch (err: any) {
        erros.push({ linha: i + 2, erro: err?.message ?? String(err) });
        console.log('ERRO LINHA', i + 2, err);
      }
    }

    return { message: 'Importação finalizada', criadas, erros };
  }
}
