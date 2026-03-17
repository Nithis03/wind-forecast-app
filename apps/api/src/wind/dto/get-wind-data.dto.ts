import { IsISO8601, IsInt, Min, Max, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';

export class GetWindDataDto {
  @IsDefined()
  @IsISO8601()
  start: string;

  @IsDefined()
  @IsISO8601()
  end: string;

  @IsDefined()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(48)
  horizon: number;
}
