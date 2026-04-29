import { IsString, IsBoolean, IsOptional, IsInt, IsEmail, MinLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() @MinLength(8) password: string;
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() companyName: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isContractual?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) contractHours?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) travelTimeMinutes?: number;
}

export class UpdateClientDto extends PartialType(CreateClientDto) {}