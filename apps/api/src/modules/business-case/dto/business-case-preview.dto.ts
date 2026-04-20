import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WorksheetLineDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  key!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  label!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  oneTime!: number;

  @ApiProperty({ minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  annual!: number;
}

export class BusinessCaseWorksheetDto {
  @ApiProperty({ type: [WorksheetLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => WorksheetLineDto)
  costRows!: WorksheetLineDto[];

  @ApiProperty({ type: [WorksheetLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => WorksheetLineDto)
  benefitRows!: WorksheetLineDto[];

  @ApiProperty({ type: [WorksheetLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => WorksheetLineDto)
  mitigationRows!: WorksheetLineDto[];
}

export class BusinessCasePreviewDto {
  @ApiProperty({ minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  baselineAnnualCost!: number;

  @ApiProperty({ minimum: 1, maximum: 10 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(10)
  horizonYears!: number;

  @ApiProperty({ type: BusinessCaseWorksheetDto })
  @ValidateNested()
  @Type(() => BusinessCaseWorksheetDto)
  worksheet!: BusinessCaseWorksheetDto;
}
