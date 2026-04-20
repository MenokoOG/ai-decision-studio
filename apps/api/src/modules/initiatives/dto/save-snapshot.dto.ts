import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class SaveSnapshotDto {
  @ApiProperty({ description: 'Business-case worksheet input used to generate this deterministic output.' })
  @IsObject()
  input!: Record<string, unknown>;

  @ApiProperty({ description: 'Deterministic business-case result payload returned by calculator.' })
  @IsObject()
  result!: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Optional human label for this snapshot version.' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  label?: string;
}
