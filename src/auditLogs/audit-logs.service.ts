import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogsService {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async listLatest() {
    try {
      return await this.prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 500,
      });
    } catch (error) {
      this.logger.error('Erro ao buscar audit logs', error);
      throw error; // controller transforma em 500 com mensagem amigável
    }
  }
}
