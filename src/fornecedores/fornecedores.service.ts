import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function prismaErrorCode(err: any): string | undefined {
  return err?.code;
}

@Injectable()
export class FornecedoresService {
  constructor(private readonly prisma: PrismaService) {}

  // 1) LISTAR
  async listar() {
    return this.prisma.fornecedor.findMany({
      orderBy: { nome: 'asc' },
    });
  }

  // 2) CRIAR
  async criar(body: { nome: string; cnpj: string; ativo?: boolean }) {
    const { nome, cnpj, ativo } = body;

    if (!nome || !cnpj) {
      throw new BadRequestException('Nome e CNPJ são obrigatórios');
    }

    try {
      return await this.prisma.fornecedor.create({
        data: {
          nome,
          cnpj,
          ativo: ativo ?? true,
        },
      });
    } catch (err: any) {
      if (prismaErrorCode(err) === 'P2002') {
        throw new ConflictException('CNPJ já cadastrado');
      }
      throw err;
    }
  }

  // 3) ATUALIZAR (PATCH)
  async atualizar(
    id: string,
    body: { nome?: string; cnpj?: string; ativo?: boolean },
  ) {    
    try {
      return await this.prisma.fornecedor.update({
        where: { id: id },
        data: {
          nome: body.nome,
          cnpj: body.cnpj,
          ativo: body.ativo,
        },
      });
    } catch (err: any) {
      if (prismaErrorCode(err) === 'P2025') {
        throw new NotFoundException('Fornecedor não encontrado');
      }
      if (prismaErrorCode(err) === 'P2002') {
        throw new ConflictException('CNPJ já cadastrado');
      }
      throw err;
    }
  }

  // 4) REMOVER
  async remover(id: string) {
    try {
      await this.prisma.fornecedor.delete({ where: { id } });
      return { success: true };
    } catch (err: any) {
      if (prismaErrorCode(err) === 'P2025') {
        throw new NotFoundException('Fornecedor não encontrado');
      }
      throw err;
    }
  }

  async findByFilter(body: any) {
    const { pesquisa, ativo } = body;
    const page = Number(body.page ?? 1);
    const limit = Number(body.limit ?? 10);

    const toBool = (v: any) => {
      if (v === true || v === false) return v;
      if (typeof v === 'string') {
        if (v.toLowerCase() === 'true') return true;
        if (v.toLowerCase() === 'false') return false;
      }
      return undefined;
    };

    const rawList = Array.isArray(ativo)
      ? ativo
      : ativo !== undefined
        ? [ativo]
        : [];

    const boolList = rawList
      .map(toBool)
      .filter((v): v is boolean => v !== undefined);

    const unique = Array.from(new Set(boolList));
    const statusFilter =
      unique.length === 1 ? { ativo: { equals: unique[0] } } : undefined;

    const skip = (page - 1) * limit;

    const where: any = {
      ...(statusFilter ?? {}),
      ...(pesquisa
        ? {
            OR: [
              { nome: { contains: pesquisa, mode: 'insensitive' } },
              { cnpj: { contains: pesquisa, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const result = await this.prisma.fornecedor.findMany({
      where,
      orderBy: { id: 'desc' },
      skip,
      take: limit,
    });

    const total = await this.prisma.fornecedor.count({ where });

    return { result, total };
  }
}
