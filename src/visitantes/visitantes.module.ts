import { Module } from '@nestjs/common';
import { VisitantesController } from './visitantes.controller';
import { VisitantesService } from './visitantes.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [VisitantesController],
  providers: [VisitantesService],
})
export class VisitantesModule {}
