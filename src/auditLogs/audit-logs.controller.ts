import {
  Controller,
  Get,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('Audit Logs')
@Controller('audit-logs')
@UseGuards(AuthGuard)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get('audit-all-logs')
  async list() {
    try {
      return await this.auditLogsService.listLatest();
    } catch (error) {
      // Você pode logar aqui também, mas o ideal é deixar o service logar
      throw new InternalServerErrorException('Erro ao buscar audit logs');
    }
  }
}
