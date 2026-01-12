import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UserFilialController } from './userFilial.controller';
import { UserFilialService } from './userFilial.service';

@Module({
  imports: [AuthModule],
  controllers: [UserFilialController],
  providers: [UserFilialService],
  exports: [UserFilialService],
})
export class UserFilialModule {}
