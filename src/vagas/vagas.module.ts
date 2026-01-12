import { Module } from '@nestjs/common';
import { VagasController } from './vagas.controller';
import { VagasService } from './vagas.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [VagasController],
  providers: [VagasService],
})
export class VagasModule {}
