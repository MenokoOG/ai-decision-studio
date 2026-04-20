import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateInitiativeDto } from './dto/create-initiative.dto.js';
import { UpdateInitiativeDto } from './dto/update-initiative.dto.js';
import { InitiativesService } from './initiatives.service.js';

@ApiTags('Initiatives')
@Controller({
  path: 'initiatives',
  version: '1',
})
export class InitiativesController {
  constructor(private readonly initiativesService: InitiativesService) {}

  @Get()
  @ApiOperation({ summary: 'List initiative workspaces.' })
  list() {
    return this.initiativesService.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one initiative workspace by id.' })
  getById(@Param('id') id: string) {
    return this.initiativesService.getById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new initiative workspace.' })
  create(@Body() payload: CreateInitiativeDto) {
    return this.initiativesService.create(payload);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update initiative workspace metadata.' })
  update(@Param('id') id: string, @Body() payload: UpdateInitiativeDto) {
    return this.initiativesService.update(id, payload);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete initiative workspace and related records.' })
  remove(@Param('id') id: string) {
    return this.initiativesService.remove(id);
  }
}
