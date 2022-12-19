import { IsString, IsNotEmpty, IsDate, IsOptional } from 'class-validator';

export class TollDto {
  @IsNotEmpty()
  @IsString()
  interChange: string;

  @IsNotEmpty()
  @IsString()
  plateNumer: string;

  @IsOptional()
  @IsDate()
  date?: Date;
}
