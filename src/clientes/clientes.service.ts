import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  async createCliente(body: any) {
    return await this.prisma.cliente.create({
      data: {
        nome: body.nome,
        cnpj: body.cnpj,
        ativo: body.ativo,
        status: body.status,
      },
    });
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

    const result = await this.prisma.cliente.findMany({
      where,
      orderBy: { id: 'desc' },
      skip,
      take: limit,
    });

    const total = await this.prisma.cliente.count({ where });

    return { result, total };
  }

  async update(id: any, body: any) {
    return await this.prisma.cliente.update({
      where: { id: id },
      data: {
        nome: body.nome,
        cnpj: body.cnpj,
        ativo: body.ativo,
        status: body.status,
      },
    });
  }

  async delete(id: string) {
    return await this.prisma.cliente.delete({ where: { id: id } });
  }
}
