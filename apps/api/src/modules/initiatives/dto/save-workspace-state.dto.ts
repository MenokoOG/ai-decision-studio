import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class SaveWorkspaceStateDto {
  @ApiProperty({ description: 'Deterministic business-case worksheet input object.' })
  @IsObject()
  input!: Record<string, unknown>;

  @ApiProperty({ description: 'Readiness checklist state by category key.' })
  @IsObject()
  readiness!: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Optional active workflow screen id.' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  activeScreen?: string;

  @ApiPropertyOptional({ description: 'Optional quick-estimate values used by directional calculator.' })
  @IsOptional()
  @IsObject()
  quickEstimate?: Record<string, unknown>;
}
