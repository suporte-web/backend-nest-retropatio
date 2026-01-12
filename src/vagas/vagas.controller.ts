import {
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
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { VagasService } from './vagas.service';
import { CreateVagaDto } from './dtos/create-vaga.dto';
import { UpdateVagaDto } from './dtos/update-vaga.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('vagas')
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
  @Delete(':id')
  excluir(@Param('id') id: string, @Body('filialId') filialId: string) {
    return this.vagasService.excluir(Number(id), filialId);
  }

  // Import Excel
  @Post('import')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  importar(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      // Nest vai retornar 400 se você preferir lançar exceção;
      // aqui vou manter no padrão do seu Express
      return { error: 'Arquivo não enviado' };
    }
    return this.vagasService.importarExcel(file.buffer);
  }
}
