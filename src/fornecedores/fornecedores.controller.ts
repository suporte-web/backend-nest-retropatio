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
import { FornecedoresService } from './fornecedores.service';
import { CreateFornecedorDto } from './dtos/create-fornecedor.dto';
import { UpdateFornecedorDto } from './dtos/update-fornecedor.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('fornecedores')
@Controller('fornecedores')
@UseGuards(AuthGuard)
export class FornecedoresController {
  constructor(private readonly service: FornecedoresService) {}

  @Get()
  @ApiOperation({ summary: 'Encontra todos os Fornecedores' })
  listar() {
    return this.service.listar();
  }

  @Post('create')
  @ApiOperation({ summary: 'Cria o Fornecedor' })
  async criar(@Body() dto: CreateFornecedorDto) {
    return this.service.criar(dto);
  }

  @Patch('update/:id')
  @ApiOperation({
    summary: 'Atualiza o Fornecedor com base no ID e informações passadas',
  })
  atualizar(@Param('id') id: string, @Body() dto: UpdateFornecedorDto) {
    return this.service.atualizar(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deleta Fornecedor com base no ID passado' })
  remover(@Param('id') id: string) {
    return this.service.remover(id);
  }
  
  @Post('find-by-filter')
  @ApiOperation({ summary: 'Encontra o Fornecedor com filtros' })
  async findByFilter(@Body() body: any) {
    return await this.service.findByFilter(body)
  }
}
