import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { FilialModule } from './filiais/filial.module';
import { UserModule } from './user/user.module';
import { AuditLogsModule } from './auditLogs/audit-logs.module';
import { VeiculosModule } from './veiculos/veiculos.module';
import { UserFilialModule } from './userFilial/userFilial.module';
import { EntradaModule } from './entrada/entrada.module';
import { VagasModule } from './vagas/vagas.module';
import { VisitantesModule } from './visitantes/visitantes.module';
import { FornecedoresModule } from './fornecedores/fornecedores.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    FilialModule,
    UserModule,
    AuditLogsModule,
    VeiculosModule,
    UserFilialModule,
    EntradaModule,
    VagasModule,
    VisitantesModule,
    FornecedoresModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
