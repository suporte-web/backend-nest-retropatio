import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MotoristasService {
  constructor(private readonly prisma: PrismaService) {}

  async criarMotorista(body: any) {
    return await this.prisma.motorista.create({ data: body });
  }

  async findAllMotoristas() {
    return await this.prisma.motorista.findMany();
  }

  async findByFilter(body: any) {
    const { status, pesquisa } = body;

    const page = Number(body.page ?? 1);
    const limit = Number(body.limit ?? 10);

    // normaliza status vindo como "true"/"false"/true/false ou array disso
    const toBool = (v: any) => {
      if (v === true || v === false) return v;
      if (typeof v === 'string') {
        if (v.toLowerCase() === 'true') return true;
        if (v.toLowerCase() === 'false') return false;
      }
      return undefined;
    };

    const rawList = Array.isArray(status)
      ? status
      : status !== undefined
        ? [status]
        : [];
    const boolList = rawList
      .map(toBool)
      .filter((v): v is boolean => v !== undefined);

    // se veio [true,false] (ou equivalente), filtrar por status não muda nada -> remove filtro
    const unique = Array.from(new Set(boolList));
    const statusFilter =
      unique.length === 1 ? { status: { equals: unique[0] } } : undefined;

    const skip = (page - 1) * limit;

    const where: any = {
      ...(statusFilter ?? {}),
      ...(pesquisa
        ? {
            OR: [
              { nome: { contains: pesquisa, mode: 'insensitive' } },
              { cpf: { contains: pesquisa, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const result = await this.prisma.motorista.findMany({
      where,
      orderBy: { id: 'desc' },
      skip,
      take: limit,
    });

    const total = await this.prisma.motorista.count({ where });

    return { result, total };
  }

  async findAllMotoristasAtivos() {
    return await this.prisma.motorista.findMany({ where: { status: true } });
  }

  async updateMotorista(body: any) {
    return await this.prisma.motorista.update({
      where: { id: body.id },
      data: body,
    });
  }

  async deleteMotorista(id: string) {
    const findEntrada = await this.prisma.entrada.findFirst({
      where: {
        motoristaId: id,
      },
      select: { id: true },
    });

    if (findEntrada) {
      throw new BadRequestException(
        'Motorista não pode ser excluído poís possui entrada vinculada a ele',
      );
    }

    return this.prisma.motorista.delete({
      where: { id },
    });
  }
}
