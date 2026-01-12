import { Module } from '@nestjs/common';
import { EntradaController } from './entrada.controller';
import { EntradaService } from './entrada.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [EntradaController],
  providers: [EntradaService],
  exports: [EntradaService],
})
export class EntradaModule {}
