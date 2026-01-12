import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FilialService {
  constructor(private readonly prisma: PrismaService) {}

  async filiaisPermitidasDoUsuario(userId: string) {
    if (!userId) throw new BadRequestException('Usuário não identificado.');

    try {
      const permissoes = await this.prisma.userFilial.findMany({
        where: { userId },
        include: {
          filial: {
            select: { id: true, nome: true, codigo: true, endereco: true },
          },
        },
      });

      return permissoes.map((p) => p.filial);
    } catch (e) {
      throw new InternalServerErrorException('Erro interno ao buscar filiais');
    }
  }

  async create(data: any) {
    const { nome, codigo, endereco, ativo } = data;

    try {
      const filial = await this.prisma.filial.create({
        data: {
          nome,
          codigo: String(codigo),
          endereco,
          ativo: ativo ?? true,
        },
      });

      return { message: 'Filial criada com sucesso!', filial };
    } catch (e) {
      throw new InternalServerErrorException('Erro ao criar filial');
    }
  }

  async findAll() {
    try {
      return await this.prisma.filial.findMany({
        orderBy: { nome: 'asc' },
      });
    } catch (e) {
      throw new InternalServerErrorException('Erro ao listar filiais');
    }
  }

  async findOne(id: string) {
    const filial = await this.prisma.filial.findUnique({ where: { id } });
    if (!filial) throw new NotFoundException('Filial não encontrada');
    return filial;
  }

  async update(id: string, data: any) {
    const { nome, codigo, endereco, ativo } = data;

    try {
      const filial = await this.prisma.filial.update({
        where: { id },
        data: {
          nome,
          codigo: String(codigo),
          endereco,
          ...(typeof ativo === 'boolean' ? { ativo } : {}),
        },
      });

      return { message: 'Filial atualizada com sucesso!', filial };
    } catch (e: any) {
      // Se quiser diferenciar "id não existe", dá pra checar e.code (P2025)
      throw new InternalServerErrorException('Erro ao atualizar filial');
    }
  }

  async desativar(id: string) {
    try {
      const filial = await this.prisma.filial.update({
        where: { id },
        data: { ativo: false },
      });

      return { message: 'Filial desativada com sucesso!', filial };
    } catch (e: any) {
      throw new InternalServerErrorException(
        e?.message || 'Erro ao desativar filial',
      );
    }
  }

  async ativar(id: string) {
    try {
      const filial = await this.prisma.filial.update({
        where: { id },
        data: { ativo: true },
      });

      return { message: 'Filial ativada com sucesso!', filial };
    } catch (e) {
      throw new InternalServerErrorException('Erro ao ativar filial');
    }
  }

  async remove(id: string) {
    const filial = await this.prisma.filial.findUnique({ where: { id } });
    if (!filial) throw new NotFoundException('Filial não encontrada');

    try {
      const dependencias = await this.prisma.$transaction([
        this.prisma.vaga.count({ where: { filialId: id } }),
        this.prisma.entrada.count({ where: { filialId: id } }),
        this.prisma.visitante.count({ where: { filialId: id } }),
        this.prisma.userFilial.count({ where: { filialId: id } }),
      ]);

      const total = dependencias.reduce((acc, n) => acc + n, 0);

      if (total > 0) {
        throw new BadRequestException({
          error: 'Não é possível excluir: há registros vinculados à filial.',
          detalhes: {
            vagas: dependencias[0],
            entradas: dependencias[1],
            visitantes: dependencias[2],
            permissoes: dependencias[3],
          },
        });
      }

      await this.prisma.filial.delete({ where: { id } });
      return { message: 'Filial excluída com sucesso!' };
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      throw new InternalServerErrorException('Erro interno no servidor');
    }
  }
}
