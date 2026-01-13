import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { VagasService } from './vagas.service';
import { CreateVagaDto } from './dtos/create-vaga.dto';
import { UpdateVagaDto } from './dtos/update-vaga.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@ApiTags('Vagas')
@Controller('vagas')
@UseGuards(AuthGuard)
export class VagasController {
  constructor(private readonly vagasService: VagasService) {}

  // 1) Listar todas as vagas
  @Get()
  listarTodas() {
    return this.vagasService.listarTodas();
  }

  // LISTAR VAGAS LIVRES POR FILIAL
  @Get('livres')
  listarLivres(@Query('filialId') filialId: string) {
    return this.vagasService.listarLivresPorFilial(filialId);
  }

  // LISTAR VAGAS OCUPADAS POR FILIAL
  @Get('ocupadas')
  listarOcupadas(@Query('filialId') filialId: string) {
    return this.vagasService.listarOcupadasPorFilial(filialId);
  }

  // LISTAR VAGAS POR FILIAL (MVP)
  @Get('filial/:filialId')
  listarPorFilial(@Param('filialId') filialId: string) {
    return this.vagasService.listarPorFilial(filialId);
  }

  // STATUS DE UMA VAGA
  @Get(':id/status')
  status(@Param('id') id: string) {
    return this.vagasService.statusDaVaga(Number(id));
  }

  // VAGAS POR TIPOS
  @Get('tipos')
  listarTipos(@Query('filialId') filialId: string) {
    return this.vagasService.listarPorTipos(filialId);
  }

  // Criar vaga
  @Post()
  criar(@Body() dto: CreateVagaDto) {
    return this.vagasService.criar(dto);
  }

  // Atualizar vaga
  @Put(':id')
  atualizar(@Param('id') id: string, @Body() dto: UpdateVagaDto) {
    return this.vagasService.atualizar(Number(id), dto);
  }

  // Excluir vaga
  @Delete('delete/:id/:filialId')
  excluir(@Param('id') id: number, @Param('filialId') filialId: string) {
    return this.vagasService.excluir(id, filialId);
  }

  // Import Excel
  @Post('import')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  importar(
    @UploadedFile() file?: Express.Multer.File,
    @Body('filialId') filialId?: string,
  ) {
    if (!file) throw new BadRequestException('Arquivo não enviado');
    if (!filialId) throw new BadRequestException('filialId não enviado');

    return this.vagasService.importarExcel(file.buffer, filialId);
  }
}
