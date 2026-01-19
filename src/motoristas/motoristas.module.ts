import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { MotoristaController } from './motoristas.controller';
import { MotoristasService } from './motoristas.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [AuthModule],
  controllers: [MotoristaController],
  providers: [MotoristasService, PrismaService],
})
export class MotoristaModule {}
