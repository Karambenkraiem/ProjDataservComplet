import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { TicketStatus, InterventionType, Priority } from '@prisma/client';

export class CreateTicketDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() description: string;
  @ApiProperty({ enum: InterventionType }) @IsEnum(InterventionType) type: InterventionType;
  @ApiPropertyOptional({ enum: Priority }) @IsOptional() @IsEnum(Priority) priority?: Priority;
  @ApiProperty() @IsUUID() clientId: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() technicienId?: string;
}

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
  @ApiPropertyOptional({ enum: TicketStatus })
  @IsOptional() @IsEnum(TicketStatus) status?: TicketStatus;
}

export class AssignTicketDto {
  @ApiProperty() @IsUUID() technicienId: string;
}