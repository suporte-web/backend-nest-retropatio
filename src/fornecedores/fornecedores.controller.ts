import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { FornecedoresService } from './fornecedores.service';
import { CreateFornecedorDto } from './dtos/create-fornecedor.dto';
import { UpdateFornecedorDto } from './dtos/update-fornecedor.dto';

@Controller('api/fornecedores')
export class FornecedoresController {
  constructor(private readonly service: FornecedoresService) {}

  /* ======================================================
     1) LISTAR FORNECEDORES
     GET /api/fornecedores
  ====================================================== */
  @Get()
  listar() {
    return this.service.listar();
  }

  /* ======================================================
     2) CRIAR FORNECEDOR
     POST /api/fornecedores
  ====================================================== */
  @Post()
  async criar(@Body() dto: CreateFornecedorDto) {
    // No Express você retornava 201; no Nest dá pra fazer com decorator,
    // mas vou manter simples (Nest retorna 201 automaticamente em POST? Não.
    // Então se você quiser 201 fixo, use @HttpCode(201).)
    return this.service.criar(dto);
  }

  /* ======================================================
     3) ATUALIZAR FORNECEDOR
     PATCH /api/fornecedores/:id
  ====================================================== */
  @Patch(':id')
  atualizar(@Param('id') id: string, @Body() dto: UpdateFornecedorDto) {
    return this.service.atualizar(id, dto);
  }

  /* ======================================================
     4) REMOVER FORNECEDOR
     DELETE /api/fornecedores/:id
  ====================================================== */
  @Delete(':id')
  remover(@Param('id') id: string) {
    return this.service.remover(id);
  }
}
