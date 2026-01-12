import { Body, Controller, Get, Header, Post, UseGuards } from '@nestjs/common'; // 👈 ESTE
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { User } from 'src/decorator/user.decorator';
import { AuthGuard } from './auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() data: LoginDto) {
    return await this.authService.login(data);
  }

  @Get('me')
  @ApiOperation({ summary: 'Retorna o usuário logado' })
  @UseGuards(AuthGuard) // ✅
  @Header(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate',
  )
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  me(@User() user) {
    return user;
  }
}
