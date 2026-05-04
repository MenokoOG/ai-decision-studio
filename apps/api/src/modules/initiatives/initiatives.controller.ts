import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateInitiativeDto } from './dto/create-initiative.dto.js';
import { SaveReadinessDto } from './dto/save-readiness.dto.js';
import { SaveSnapshotDto } from './dto/save-snapshot.dto.js';
import { SaveWorkspaceStateDto } from './dto/save-workspace-state.dto.js';
import { UpdateInitiativeDto } from './dto/update-initiative.dto.js';
import { InitiativesService } from './initiatives.service.js';

@ApiTags('Initiatives')
@Controller({
  path: 'initiatives',
  version: '1',
})
export class InitiativesController {
  constructor(
    @Inject(InitiativesService)
    private readonly initiativesService: InitiativesService,
  ) { }

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

  @Get(':id/workspace-state')
  @ApiOperation({ summary: 'Get latest saved workflow draft state for an initiative.' })
  getWorkspaceState(@Param('id') id: string) {
    return this.initiativesService.getWorkspaceState(id);
  }

  @Patch(':id/workspace-state')
  @ApiOperation({ summary: 'Save latest workflow draft state for an initiative.' })
  saveWorkspaceState(@Param('id') id: string, @Body() payload: SaveWorkspaceStateDto) {
    return this.initiativesService.saveWorkspaceState(id, payload);
  }

  @Get(':id/confidence')
  @ApiOperation({ summary: 'Get deterministic initiative confidence score from latest readiness state.' })
  getConfidence(@Param('id') id: string) {
    return this.initiativesService.getConfidence(id);
  }

  @Get(':id/readiness')
  @ApiOperation({ summary: 'Get first-class readiness checklist state for an initiative.' })
  getReadiness(@Param('id') id: string) {
    return this.initiativesService.getReadiness(id);
  }

  @Patch(':id/readiness')
  @ApiOperation({ summary: 'Save first-class readiness checklist state for an initiative.' })
  saveReadiness(@Param('id') id: string, @Body() payload: SaveReadinessDto) {
    return this.initiativesService.saveReadiness(id, payload);
  }

  @Get(':id/snapshots')
  @ApiOperation({ summary: 'List latest deterministic business-case snapshots for an initiative.' })
  listSnapshots(@Param('id') id: string) {
    return this.initiativesService.listSnapshots(id);
  }

  @Post(':id/snapshots')
  @ApiOperation({ summary: 'Save a deterministic business-case snapshot for an initiative.' })
  saveSnapshot(@Param('id') id: string, @Body() payload: SaveSnapshotDto) {
    return this.initiativesService.saveSnapshot(id, payload);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete initiative workspace and related records.' })
  remove(@Param('id') id: string) {
    return this.initiativesService.remove(id);
  }

  @Get(':id/export/excel')
  @ApiOperation({ summary: 'Export initiative as Excel workbook.' })
  async exportExcel(@Param('id') id: string, @Res() res: any) {
    const { fileName, buffer } = await this.initiativesService.exportExcel(id);
    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });
    res.send(buffer);
  }

  @Get(':id/export/markdown')
  @ApiOperation({ summary: 'Export initiative as Markdown report.' })
  async exportMarkdown(@Param('id') id: string, @Res() res: any) {
    const doc = await this.initiativesService.exportMarkdown(id);
    const fileName = doc.fileName ?? `initiative-${id}.md`;
    res.set({
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });
    res.send(doc.content);
  }
}
