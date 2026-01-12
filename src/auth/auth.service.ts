import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dtos/login.dto';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // falha cedo: melhor do que a API subir "meio quebrada"
    throw new Error('JWT_SECRET não definido no ambiente');
  }
  return secret;
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async validateUser(token: string) {
    const secret = getJwtSecret();
    if (!token) throw new UnauthorizedException('Token not provided');

    const rawToken = token.startsWith('Bearer ') ? token.slice(7) : token;

    try {
      const decoded = jwt.verify(rawToken, secret);

      if (typeof decoded !== 'object' || decoded === null) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const userId = (decoded as any).sub ?? (decoded as any).id;
      if (!userId) throw new UnauthorizedException('Invalid token payload');

      const user = await this.prisma.user.findUnique({
        where: { id: String(userId) },
        select: {
          id: true,
          nome: true,
          email: true,
          role: true,
          filialId: true,
          Filial: { select: { id: true, nome: true } },
        },
      });

      if (!user) throw new UnauthorizedException('Invalid token');
      return user;
    } catch (error: any) {
      if (error?.name === 'TokenExpiredError')
        throw new UnauthorizedException('Token expired');
      throw new UnauthorizedException('Invalid token');
    }
  }

  async login(loginDto: LoginDto) {
    const secret = getJwtSecret();

    try {
      const user = await this.prisma.user.findUnique({
        where: { email: loginDto.email },
        include: {
          permissoes: { include: { filial: true } },
        },
      });

      if (!user) throw new HttpException('Usuário não encontrado', 401);

      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.password,
      );
      if (!isPasswordValid) throw new HttpException('Senha inválida', 401);

      if (user.ativo === false) throw new HttpException('Usuário inativo', 422);

      // ✅ payload mínimo
      const payload = { sub: user.id, email: user.email, role: user.role };

      return jwt.sign(payload, secret, { expiresIn: '12h' });
    } catch (error) {
      Logger.error(error?.message, error?.stack);

      if (error instanceof HttpException) throw error;

      throw new HttpException(
        'Erro ao autenticar',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createJwt(user: any) {
    const secret = getJwtSecret();
    return jwt.sign(user, secret);
  }

  async logout() {
    return { status: 200, message: 'Deslogado com sucesso!' };
  }
}
