import { InitiativePhase } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateInitiativeDto {
  @ApiPropertyOptional({ description: 'Display title for the initiative workspace.' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title?: string;

  @ApiPropertyOptional({ description: 'Short business context and objective summary.' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(4000)
  summary?: string;

  @ApiPropertyOptional({ description: 'Initiative owner label (person/team) for v1 without auth.' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  owner?: string;

  @ApiPropertyOptional({ enum: InitiativePhase })
  @IsOptional()
  @IsEnum(InitiativePhase)
  phase?: InitiativePhase;
}
