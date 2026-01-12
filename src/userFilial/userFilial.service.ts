import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserFilialService {
  constructor(private readonly prisma: PrismaService) {}

  async listByLoggedUser(userId?: any) {
    if (!userId) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    try {
      const permissoes = await this.prisma.userFilial.findMany({
        where: { userId },
        include: { filial: true },
      });

      return permissoes.map((p) => p.filial);
    } catch (err) {
      console.error('Erro ao buscar filiais do usuário:', err);
      throw new InternalServerErrorException('Erro interno no servidor');
    }
  }

  async createLink(userId: any, filialId: any) {
    if (!userId || !filialId) {
      throw new BadRequestException('userId e filialId são obrigatórios');
    }

    try {
      return await this.prisma.userFilial.create({
        data: { userId, filialId },
      });
    } catch (err) {
      console.error('Erro ao vincular usuário à filial:', err);

      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException('Usuário já vinculado a esta filial');
      }

      throw new InternalServerErrorException('Erro interno no servidor');
    }
  }

  async addPermissionToFilial(body: any) {
    return await this.prisma.userFilial.create({
      data: {
        userId: body.id,
        filialId: body.filialId,
      },
    });
  }
}
