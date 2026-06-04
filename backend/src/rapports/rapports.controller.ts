import { Controller, Get, Query, Param, Res, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { Role } from '@prisma/client';
import { RapportsService } from './rapports.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('rapports')
@ApiBearerAuth()
@Roles(Role.MANAGER)
@Controller('rapports')
export class RapportsController {
  constructor(private rapportsService: RapportsService) {}

  @Get('export/excel')
  @ApiOperation({ summary: 'Export Excel des interventions par période' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'clientId', required: false })
  async exportExcel(
    @Res() res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('clientId') clientId?: string,
  ) {
    const buffer = await this.rapportsService.exportInterventionsExcel(from, to, clientId);
    const filename = `interventions-${Date.now()}.xlsx`;
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get('mensuel/:clientId')
  @Roles(Role.MANAGER, Role.CLIENT)
  @ApiOperation({ summary: 'Rapport mensuel PDF pour un client' })
  @ApiQuery({ name: 'month', required: true })
  @ApiQuery({ name: 'year', required: true })
  async rapportMensuel(
    @Param('clientId') clientId: string,
    @Query('month') month: string,
    @Query('year') year: string,
    @Res() res: Response,
    @CurrentUser() user: any,
  ) {
    if (user.role === Role.CLIENT && user.client?.id !== clientId) {
      throw new ForbiddenException('Accès refusé');
    }

    const buffer = await this.rapportsService.rapportMensuelClient(clientId, +month, +year);
    const filename = `rapport-${clientId}-${year}-${month}.xlsx`;
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}