import { Body, Controller, Post } from '@nestjs/common';
import { TollDto } from './dto/toll-dto';
import { TollService } from './toll.service';

@Controller('/toll-plaza')
export class TollController {
  constructor(private readonly tollService: TollService) {}

  @Post('/add-entry')
  addEntry(@Body() tollEntry: TollDto) {
    return this.tollService.addTollEntry(tollEntry);
  }

  @Post('/calculate-toll-on-exit')
  calculateTollOnExit(@Body() tollExit: TollDto) {
    return this.tollService.calCulateToll(tollExit);
  }
}
