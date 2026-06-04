import { Controller, Post, Body } from '@nestjs/common';
import { PassengerQueryService } from './passenger-query.service';
import { PassengerQueryDto } from './dto/passenger-query.dto';

@Controller('passenger-query')
export class PassengerQueryController {
  constructor(private readonly queryService: PassengerQueryService) {}

  @Post()
  queryBaggage(@Body() dto: PassengerQueryDto) {
    return this.queryService.queryBaggage(dto);
  }
}
