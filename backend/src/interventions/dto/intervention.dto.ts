import { IsString, IsOptional, IsNumber, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateInterventionDto {
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() resolution?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) hoursWorked?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) travelMinutes?: number;
}

export class CloseInterventionDto {
  @ApiProperty() @IsString() description: string;
  @ApiPropertyOptional() @IsOptional() @IsString() resolution?: string;
  @ApiProperty() @IsNumber() @Min(0) hoursWorked: number;
  @ApiProperty() @IsInt() @Min(0) travelMinutes: number;
}