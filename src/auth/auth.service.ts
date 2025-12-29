import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
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

    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    try {
      // jwt.verify retorna string | JwtPayload
      const decoded = jwt.verify(token, secret);
      return decoded;
    } catch (error: any) {
      if (error?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token format');
      }
      if (error?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired');
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  async login(loginDto: LoginDto) {
    const secret = getJwtSecret();

    // Ajuste aqui se seu DTO usa "senha" ou "password"
    const plainPassword = (loginDto as any).senha ?? (loginDto as any).password;

    if (!loginDto.email || !plainPassword) {
      throw new HttpException(
        'Email e senha são obrigatórios',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: {
        permissoes: {
          include: { filial: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const isPasswordValid = await bcrypt.compare(plainPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha inválida');
    }

    if (user.ativo === false) {
      throw new UnprocessableEntityException('Usuário inativo');
    }

    const filiais = user?.permissoes.map((p) => ({
      id: p.filial.id,
      nome: p.filial.nome,
      codigo: p.filial.codigo,
    }));

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      secret,
      { expiresIn: '8h' },
    );

    return {
      message: 'Login bem-sucedido',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        filiais, // 👈 exatamente o formato que o front espera!
      },
    };
  }

  async createJwt(user: any) {
    const secret = getJwtSecret();
    return jwt.sign(user, secret);
  }

  async logout() {
    return { status: 200, message: 'Deslogado com sucesso!' };
  }
}
