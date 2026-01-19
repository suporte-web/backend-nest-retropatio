import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { MotoristasService } from './motoristas.service';

@ApiTags('Motorista')
@Controller('motorista')
@UseGuards(AuthGuard)
export class MotoristaController {
  constructor(private readonly service: MotoristasService) {}

  @Post('create')
  async create(@Body() body: any) {
    return await this.service.criarMotorista(body);
  }

  @Get('find-all')
  async findAllMotoristas() {
    return await this.service.findAllMotoristas();
  }

  @Get('find-all-ativos')
  async findAllMotoristasAtivos() {
    return await this.service.findAllMotoristasAtivos();
  }

  @Post('find-by-filter')
  async findByFilter(@Body() body: any) {
    return await this.service.findByFilter(body);
  }

  @Patch('update')
  async updateMotorista(@Body() body: any) {
    return await this.service.updateMotorista(body);
  }

  @Delete('delete/:id')
  async deleteMotorista(@Param('id') id: string) {
    return await this.service.deleteMotorista(id);
  }
}
