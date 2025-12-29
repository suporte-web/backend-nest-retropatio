import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  private userSelect = {
    id: true,
    username: true,
    email: true,
    role: true,
    ativo: true,
    filialId: true,
    nome: true,
    createdAt: true,
    updatedAt: true,
  };

  async create(body: any) {
    const plainPassword = body.password ?? body.senha;
    if (!plainPassword) {
      throw new BadRequestException('Informe password (ou senha).');
    }

    const hashed = await bcrypt.hash(plainPassword, 10);

    return this.prisma.user.create({
      data: {
        username: body.username,
        email: body.email,
        password: hashed,
        role: body.role,
        ativo: body.ativo ?? true,
        filialId: body.filialId ?? null,
        nome: body.nome ?? null,
      },
      select: this.userSelect,
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: this.userSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.userSelect,
    });

    if (!user) throw new NotFoundException('Usuário não encontrado.');
    return user;
  }

  async findByFilter(body: any) {
    const { pesquisa, ativo, page = 1, limit = 10 } = body;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    // importante: deixa ativo=false funcionar
    if (typeof ativo === 'boolean') where.ativo = ativo;

    if (pesquisa) {
      where.OR = [
        { nome: { contains: pesquisa, mode: 'insensitive' } },
        { email: { contains: pesquisa, mode: 'insensitive' } },
        { username: { contains: pesquisa, mode: 'insensitive' } },
      ];
    }

    const [result, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        select: this.userSelect,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { result, total };
  }

  async updateUser(id: string, body: any) {
    const data: any = { ...body };

    // aceita senha ou password
    if (data.senha && !data.password) {
      data.password = data.senha;
      delete data.senha;
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data,
        select: this.userSelect,
      });
    } catch (e: any) {
      // quando o id não existe, Prisma geralmente joga erro de "Record not found"
      throw new NotFoundException('Usuário não encontrado.');
    }
  }

  async updateSenhaUser(body: any) {
    const { id, _id, senha1, senha2 } = body;
    const userId = id ?? _id;

    if (!userId) throw new BadRequestException('Informe id (ou _id).');
    if (!senha1 || !senha2) throw new BadRequestException('Informe senha1 e senha2.');

    if (senha1 !== senha2) {
      throw new BadRequestException(
        'Senhas diferentes, lembre-se que a senha deve ser a mesma!',
      );
    }

    const hashed = await bcrypt.hash(senha1, 10);

    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: {
          password: hashed,
          // se você tiver esse campo no Prisma, descomente:
          // primeiroAcesso: false,
        },
        select: this.userSelect,
      });
    } catch (e: any) {
      throw new NotFoundException('Usuário não encontrado.');
    }
  }
}
