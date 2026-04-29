import { Controller, Get, Patch, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { InterventionsService } from './interventions.service';
import { UpdateInterventionDto, CloseInterventionDto } from './dto/intervention.dto';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('interventions')
@ApiBearerAuth()
@Controller('interventions')
export class InterventionsController {
  constructor(private interventionsService: InterventionsService) {}

  @Get(':ticketId')
  @ApiOperation({ summary: 'Obtenir la fiche d\'intervention d\'un ticket' })
  findOne(@Param('ticketId') ticketId: string) {
    return this.interventionsService.findOne(ticketId);
  }

  @Patch(':ticketId')
  @Roles(Role.TECHNICIEN, Role.MANAGER)
  @ApiOperation({ summary: 'Mettre à jour la fiche' })
  update(@Param('ticketId') ticketId: string, @Body() dto: UpdateInterventionDto) {
    return this.interventionsService.update(ticketId, dto);
  }

  @Post(':ticketId/close')
  @Roles(Role.TECHNICIEN, Role.MANAGER)
  @ApiOperation({ summary: 'Clôturer l\'intervention et générer le PDF' })
  close(@Param('ticketId') ticketId: string, @Body() dto: CloseInterventionDto) {
    return this.interventionsService.close(ticketId, dto);
  }
}