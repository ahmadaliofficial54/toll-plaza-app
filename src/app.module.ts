import { Module } from '@nestjs/common';
import { TollModule } from './toll-plaza/toll.module';

@Module({
  imports: [TollModule],
})
export class AppModule {}
