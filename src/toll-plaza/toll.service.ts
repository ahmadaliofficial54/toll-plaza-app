import { BadRequestException, Injectable } from '@nestjs/common';
import {
  BASE_RATE,
  DISTANCE_CHARGES_PER_KM,
  ENTRY_POINTS,
  WEEKEND_DISTANCE_CHARGES_PER_KM,
} from 'src/common/constants';
import { TollDto } from './dto/toll-dto';

@Injectable()
export class TollService {
  private tollEntries = new Map();

  addTollEntry(tollEntry: TollDto) {
    try {
      tollEntry.date = new Date();
      this.applyValidation(tollEntry);
      if (this.tollEntries.get(tollEntry.plateNumer)) {
        throw new Error('Entry already exist against the given number plate');
      }
      this.tollEntries.set(tollEntry.plateNumer, tollEntry);
      return { message: 'Toll entry added successfully' };
    } catch (error) {
      throw new BadRequestException(null, error?.message);
    }
  }

  calCulateToll(tollExit: TollDto) {
    try {
      this.applyValidation(tollExit);
      const day = new Date().getDay();
      let discount = 0;
      const responseWithBreakDown: any = {};
      const getEntry = this.tollEntries.get(tollExit.plateNumer);
      if (!getEntry) {
        throw new Error('There is no car entered with the given number plate');
      }
      if (getEntry.interChange === tollExit.interChange) {
        throw new Error('Entry and exist interchange cannot be same');
      }
      const totalDistance =
        ENTRY_POINTS[tollExit.interChange.toString().toLowerCase()] -
        ENTRY_POINTS[getEntry.interChange.toString().toLowerCase()];
      responseWithBreakDown['baseRate'] = BASE_RATE;
      responseWithBreakDown['distanceRate'] =
        day > 5
          ? totalDistance * WEEKEND_DISTANCE_CHARGES_PER_KM
          : totalDistance * DISTANCE_CHARGES_PER_KM;
      responseWithBreakDown['subTotal'] =
        BASE_RATE + responseWithBreakDown.distanceRate;
      discount = this.checkDiscountForOddNumber(
        getEntry,
        responseWithBreakDown.subTotal,
      );
      if (discount <= 0) {
        this.checkDiscountForEvenNumber(
          getEntry,
          responseWithBreakDown.subTotal,
        );
      }
      responseWithBreakDown['discount'] =
        discount +
        this.addNationalHolidayDiscount(
          getEntry,
          responseWithBreakDown.subTotal,
        );
      responseWithBreakDown['totalToBeCharged'] =
        responseWithBreakDown.subTotal - responseWithBreakDown.discount;
      return responseWithBreakDown;
    } catch (error) {
      throw new BadRequestException(null, error?.message);
    }
  }

  checkDiscountForOddNumber(tollEntry: TollDto, subTotal: number) {
    const plateNumer = Number(tollEntry.plateNumer.split('-')[1]);
    const day = tollEntry.date?.getDay();
    if (plateNumer % 2 !== 0 && (day === 2 || day === 4)) {
      return (subTotal * 10) / 100;
    }
    return 0;
  }

  checkDiscountForEvenNumber(tollEntry: TollDto, subTotal: number) {
    const plateNumer = Number(tollEntry.plateNumer.split('-')[1]);
    const day = tollEntry.date?.getDay();
    if (plateNumer % 2 === 0 && (day === 1 || day === 3)) {
      return (subTotal * 10) / 100;
    }
    return 0;
  }

  applyValidation(tollEntry: TollDto) {
    if (!Number(tollEntry.plateNumer.split('-')[1])) {
      throw new Error('Number plate is incorrect');
    } else if (
      !(ENTRY_POINTS[tollEntry.interChange.toString().toLowerCase()] >= 0)
    ) {
      throw new Error('Given interchange is invalid');
    }
  }

  addNationalHolidayDiscount(tollEntry: TollDto, subTotal: number) {
    const month = tollEntry.date?.getMonth();
    const date = tollEntry.date?.getDate();
    const exitDate = new Date().getDate();
    if (
      (month === 3 && (date === 23 || exitDate === 23)) ||
      (month === 8 && (date === 14 || exitDate === 14)) ||
      (month === 12 && (date === 25 || exitDate === 25))
    ) {
      return (subTotal * 50) / 100;
    }
    return 0;
  }
}
