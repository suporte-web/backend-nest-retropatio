import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VisitantesService {
  constructor(private readonly prisma: PrismaService) {}

  async criar(body: {
    nome: string;
    cpf: string;
    empresa?: string;
    tipoVisita: string;
    motivoVisita?: string;
    filialId: string;
  }) {
    const { nome, cpf, tipoVisita, filialId, empresa, motivoVisita } = body;

    if (!nome || !cpf || !tipoVisita || !filialId) {
      throw new BadRequestException('Dados obrigatórios ausentes');
    }

    return this.prisma.visitante.create({
      data: {
        nome,
        cpf,
        empresa,
        tipoVisita,
        motivoVisita,
        filialId,
        status: 'aguardando',
      },
    });
  }

  // GET /api/visitantes?filialId=xxxx (contrato do front)
  async listarPorQueryFilial(filialId: string) {
    if (!filialId) throw new BadRequestException('filialId é obrigatório');

    return this.prisma.visitante.findMany({
      where: { filialId: String(filialId) },
      orderBy: { id: 'desc' },
    });
  }

  // GET /api/visitantes/filial/:filialId (compat front antigo)
  async listarPorFilialParam(filialId: string) {
    return this.prisma.visitante.findMany({
      where: { filialId },
      orderBy: { id: 'desc' },
    });
  }

  // GET /api/visitantes/painel/:filialId
  async painel(filialId: string) {
    return this.prisma.visitante.findMany({
      where: {
        filialId,
        status: { in: ['aguardando', 'aprovado', 'dentro'] },
      },
      orderBy: { id: 'desc' },
    });
  }

  // GET /api/visitantes/historico/:filialId
  async historico(filialId: string) {
    return this.prisma.visitante.findMany({
      where: {
        filialId,
        OR: [{ status: 'saiu' }, { dataSaida: { not: null } }],
      },
      orderBy: { dataSaida: 'desc' },
    });
  }

  // GET /api/visitantes/aguardando/:filialId
  async aguardando(filialId: string) {
    return this.prisma.visitante.findMany({
      where: { filialId, status: 'aguardando' },
      orderBy: { id: 'desc' },
    });
  }

  // GET /api/visitantes/dentro/:filialId
  async dentro(filialId: string) {
    return this.prisma.visitante.findMany({
      where: { filialId, status: 'dentro' },
      orderBy: { dataEntrada: 'desc' },
    });
  }

  // PATCH /api/visitantes/:id/aprovar
  async aprovar(id: number) {
    return this.prisma.visitante.update({
      where: { id: Number(id) },
      data: { status: 'aprovado' },
    });
  }

  // PATCH /api/visitantes/:id/entrada
  async registrarEntrada(id: number) {
    return this.prisma.visitante.update({
      where: { id: Number(id) },
      data: {
        status: 'dentro',
        dataEntrada: new Date(),
      },
    });
  }

  // PATCH /api/visitantes/:id/saida
  async registrarSaida(id: number) {
    return this.prisma.visitante.update({
      where: { id: Number(id) },
      data: {
        status: 'saiu',
        dataSaida: new Date(),
      },
    });
  }

  // GET /api/visitantes/export?filialId=xxxx
  async exportarCsv(filialId: string) {
    if (!filialId) throw new BadRequestException('filialId é obrigatório');

    const visitantes = await this.prisma.visitante.findMany({
      where: {
        filialId: String(filialId),
        OR: [{ status: 'saiu' }, { dataSaida: { not: null } }],
      },
      orderBy: { dataSaida: 'desc' },
    });

    const header = 'Nome,CPF,Empresa,Entrada,Saída';
    const linhas = visitantes.map((v) =>
      [
        safeCsv(v.nome),
        safeCsv(v.cpf),
        safeCsv(v.empresa ?? ''),
        v.dataEntrada ? safeCsv(new Date(v.dataEntrada).toLocaleString('pt-BR')) : '',
        v.dataSaida ? safeCsv(new Date(v.dataSaida).toLocaleString('pt-BR')) : '',
      ].join(','),
    );

    return [header, ...linhas].join('\n');
  }
}

// Evita quebrar CSV quando houver vírgula/aspas/quebra de linha
function safeCsv(value: string) {
  const needsQuotes = /[",\n\r]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}
