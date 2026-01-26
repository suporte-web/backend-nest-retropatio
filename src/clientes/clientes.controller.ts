import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { ClientesService } from './clientes.service';

@ApiTags('clientes')
@Controller('clientes')
@UseGuards(AuthGuard)
export class ClientesController {
  constructor(private readonly service: ClientesService) {}

  @Post('create')
  @ApiOperation({ summary: 'Cria Cliente' })
  async createCliente(@Body() body: any) {
    return await this.service.createCliente(body);
  }

  @Post('find-by-filter')
  @ApiOperation({ summary: 'Encontra clientes com filtro' })
  async findByFilter(@Body() body: any) {
    return await this.service.findByFilter(body);
  }
}
