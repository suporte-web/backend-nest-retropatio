import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserService } from 'src/user/user.service';
import { UserFilialService } from './userFilial.service';

@ApiTags('User Filial')
@Controller('user-filial')
@UseGuards(AuthGuard)
export class UserFilialController {
  constructor(private readonly userFilialService: UserFilialService) {}

  @Get('list-by-logged-user/:id')
  @ApiOperation({summary: 'Lista Filiais permitidas para o Usuario'})
  async listByLoggedUser(@Param('id') id: any) {
    return await this.userFilialService.listByLoggedUser(id)
  }

  @Post('permission-to-filial')
  @ApiOperation({ summary: 'Cria a permissao do usuario a Filial' })
  async addPermissionToFilial(@Body() body: any) {
    return this.userFilialService.addPermissionToFilial(body);
  }
}
