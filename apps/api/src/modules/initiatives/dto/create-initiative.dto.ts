import { InitiativePhase } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateInitiativeDto {
  @ApiProperty({ description: 'Display title for the initiative workspace.' })
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title!: string;

  @ApiProperty({ description: 'Short business context and objective summary.' })
  @IsString()
  @MinLength(3)
  @MaxLength(4000)
  summary!: string;

  @ApiProperty({ description: 'Initiative owner label (person/team) for v1 without auth.' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  owner!: string;

  @ApiPropertyOptional({ enum: InitiativePhase, default: InitiativePhase.DISCOVERY })
  @IsOptional()
  @IsEnum(InitiativePhase)
  phase?: InitiativePhase;
}
