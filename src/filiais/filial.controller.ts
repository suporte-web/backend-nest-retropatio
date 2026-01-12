import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { FilialService } from './filial.service';

@ApiTags('Filiais')
@Controller('filiais')
@UseGuards(AuthGuard) // 🔐 equivale ao router.use(authMiddleware)
export class FilialController {
  constructor(private readonly filialService: FilialService) {}

  @Post('perfil')
  @ApiOperation({ summary: 'Filiais permitidas do usuário logado' })
  async perfil(@Body() body: any) {
    const userId = body.id;
    return this.filialService.filiaisPermitidasDoUsuario(userId);
  }

  @Post('create')
  @ApiOperation({ summary: 'Criar filial' })
  async create(@Body() body: any) {
    return this.filialService.create(body);
  }

  @Get('find-all')
  @ApiOperation({ summary: 'Listar filiais' })
  async findAll() {
    return this.filialService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar filial por id' })
  async findOne(@Param('id') id: string) {
    return this.filialService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar filial' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.filialService.update(id, body);
  }

  @Put('desativar/:id')
  @ApiOperation({ summary: 'Desativar filial' })
  async desativar(@Param('id') id: string) {
    return this.filialService.desativar(id);
  }

  @Put('ativar/:id')
  @ApiOperation({ summary: 'Ativar filial' })
  async ativar(@Param('id') id: string) {
    return this.filialService.ativar(id);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Excluir filial' })
  async remove(@Param('id') id: string) {
    return this.filialService.remove(id);
  }
}
