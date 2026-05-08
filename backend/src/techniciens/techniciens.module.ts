import { Module } from '@nestjs/common';
import { TechniciensService } from './techniciens.service';
import { TechniciensController } from './techniciens.controller';

@Module({
  controllers: [TechniciensController],
  providers: [TechniciensService],
  exports: [TechniciensService],
})
export class TechniciensModule {}