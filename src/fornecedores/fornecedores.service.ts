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
  async atualizar(id: string, body: { nome?: string; cnpj?: string; ativo?: boolean }) {
    try {
      return await this.prisma.fornecedor.update({
        where: { id },
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
}
