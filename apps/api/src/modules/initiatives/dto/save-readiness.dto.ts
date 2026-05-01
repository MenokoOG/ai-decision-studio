import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class SaveReadinessDto {
    @ApiProperty({ description: 'Readiness checklist state by category key.' })
    @IsObject()
    readiness!: Record<string, unknown>;
}
