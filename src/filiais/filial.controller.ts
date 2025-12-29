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
import { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { FilialService } from './filial.service';

@ApiTags('Filiais')
@Controller('filiais')
@UseGuards(AuthGuard) // 🔐 equivale ao router.use(authMiddleware)
export class FilialController {
  constructor(private readonly filialService: FilialService) {}

  /**
   * 1️⃣ Filiais permitidas do usuário logado
   * GET /filiais/perfil
   * (deve vir antes de rotas com :id — no Nest isso não dá conflito)
   */
  @Get('perfil')
  @ApiOperation({ summary: 'Filiais permitidas do usuário logado' })
  async perfil(@Req() req: Request & { user?: any }) {
    const userId = req.user?.id;
    return this.filialService.filiaisPermitidasDoUsuario(userId);
  }

  /**
   * 2️⃣ Criar uma filial
   * POST /filiais
   */
  @Post()
  @ApiOperation({ summary: 'Criar filial' })
  async create(@Body() body: any) {
    return this.filialService.create(body);
  }

  /**
   * 3️⃣ Listar todas as filiais
   * GET /filiais
   */
  @Get()
  @ApiOperation({ summary: 'Listar filiais' })
  async findAll() {
    return this.filialService.findAll();
  }

  /**
   * 4️⃣ Buscar filial por ID
   * GET /filiais/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Buscar filial por id' })
  async findOne(@Param('id') id: string) {
    return this.filialService.findOne(id);
  }

  /**
   * 5️⃣ Editar filial
   * PUT /filiais/:id
   */
  @Put(':id')
  @ApiOperation({ summary: 'Atualizar filial' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.filialService.update(id, body);
  }

  /**
   * 6️⃣ Desativar filial
   * PUT /filiais/:id/desativar
   */
  @Put('desativar/:id')
  @ApiOperation({ summary: 'Desativar filial' })
  async desativar(@Param('id') id: string) {
    return this.filialService.desativar(id);
  }

  /**
   * 7️⃣ Ativar filial
   * PUT /filiais/:id/ativar
   */
  @Put('ativar/:id')
  @ApiOperation({ summary: 'Ativar filial' })
  async ativar(@Param('id') id: string) {
    return this.filialService.ativar(id);
  }

  /**
   * 8️⃣ Excluir filial
   * DELETE /filiais/:id
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Excluir filial' })
  async remove(@Param('id') id: string) {
    return this.filialService.remove(id);
  }
}
