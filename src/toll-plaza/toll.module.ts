import { Module } from '@nestjs/common';
import { TollController } from './toll.controller';
import { TollService } from './toll.service';

@Module({
  imports: [],
  controllers: [TollController],
  providers: [TollService],
})
export class TollModule {}
