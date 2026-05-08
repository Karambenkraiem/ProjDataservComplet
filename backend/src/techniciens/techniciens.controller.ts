import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { TechniciensService } from './techniciens.service';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('techniciens')
@ApiBearerAuth()
@Roles(Role.MANAGER)
@Controller('techniciens')
export class TechniciensController {
  constructor(private techniciensService: TechniciensService) {}

  @Get('rendement')
  @ApiOperation({ summary: 'Rendement et stats de tous les techniciens' })
  getRendement() {
    return this.techniciensService.getRendement();
  }

  @Get(':id/rendement')
  @ApiOperation({ summary: "Rendement détaillé d'un technicien" })
  getOneTechnicien(@Param('id') id: string) {
    return this.techniciensService.getOneTechnicien(id);
  }
}