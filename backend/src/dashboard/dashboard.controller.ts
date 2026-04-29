import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { DashboardService } from './dashboard.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('manager')
  @Roles(Role.MANAGER)
  getManagerStats() {
    return this.dashboardService.getManagerStats();
  }

  @Get('technicien')
  @Roles(Role.TECHNICIEN)
  getTechStats(@CurrentUser('id') userId: string) {
    return this.dashboardService.getTechnicienStats(userId);
  }

  @Get('client')
  @Roles(Role.CLIENT)
  getClientStats(@CurrentUser() user: any) {
    return this.dashboardService.getClientStats(user.client?.id);
  }
}