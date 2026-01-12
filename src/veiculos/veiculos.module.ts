import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VeiculosController } from './veiculos.controller';
import { VeiculosService } from './veiculos.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [VeiculosController],
  providers: [VeiculosService, PrismaService],
})
export class VeiculosModule {}
