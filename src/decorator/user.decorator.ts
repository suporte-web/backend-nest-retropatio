import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export const User = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    if (!request.user) {
      throw new UnauthorizedException(
        'Usuário não encontrado no request. Verifique o AuthGuard.',
      );
    }

    // Prisma não tem _doc. Remove password se existir por algum motivo.
    // (e "senha" também, caso você tenha legado)
    const { password, senha, ...safeUser } = request.user;

    return safeUser;
  },
);
