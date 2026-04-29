import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('clients')
@ApiBearerAuth()
@Controller('clients')
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Get()
  @Roles(Role.MANAGER)
  findAll() { return this.clientsService.findAll(); }

  @Get('me')
  @Roles(Role.CLIENT)
  getMyProfile(@CurrentUser('id') userId: string) {
    return this.clientsService.findByUserId(userId);
  }

  @Get(':id/stats')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Statistiques client' })
  getStats(@Param('id') id: string) {
    return this.clientsService.getStats(id);
  }

  @Get(':id')
  @Roles(Role.MANAGER)
  findOne(@Param('id') id: string) { return this.clientsService.findOne(id); }

  @Post()
  @Roles(Role.MANAGER)
  create(@Body() dto: CreateClientDto) { return this.clientsService.create(dto); }

  @Patch(':id')
  @Roles(Role.MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.clientsService.update(id, dto);
  }
}