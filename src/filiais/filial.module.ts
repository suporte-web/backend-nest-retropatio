import { Module } from '@nestjs/common';
import { FilialService } from './filial.service';
import { AuthModule } from 'src/auth/auth.module';
import { FilialController } from './filial.controller';

@Module({
  imports: [AuthModule],
  controllers: [FilialController],
  providers: [FilialService],
  exports: [FilialService],
})
export class FilialModule {}
