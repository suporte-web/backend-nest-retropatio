import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers.authorization;
    if (!authHeader) throw new UnauthorizedException('Token not provided');

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    const user = await this.authService.validateUser(token);

    // no Prisma já é objeto JS e não tem _id/__v/toObject
    request.user = user;

    return true;
  }
}
